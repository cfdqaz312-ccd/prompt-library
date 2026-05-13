import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getBrands, getCategories } from '../lib/sheets'

const TYPES = ['圖片', '文案']

export default function SubmitPage({ brands, categories }) {
  const [tab, setTab] = useState('manual') // 'manual' | 'url'
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState('')

  const [form, setForm] = useState({
    name: '',
    type: '',
    subcategory: '',
    brands: [],
    content: '',
    notes: '',
    submittedBy: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const subcategories = form.type
    ? categories.filter(c => c.type === form.type).map(c => c.subcategory)
    : []

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleBrand = (brandId) => {
    setForm(f => ({
      ...f,
      brands: f.brands.includes(brandId)
        ? f.brands.filter(b => b !== brandId)
        : [...f.brands, brandId],
    }))
  }

  const handleScrape = async () => {
    if (!url.trim()) return
    setScraping(true)
    setScrapeError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({
        ...f,
        content: data.content,
        type: data.type || '',
        subcategory: data.subcategory || '',
      }))
      setTab('manual')
    } catch (err) {
      setScrapeError(err.message)
    } finally {
      setScraping(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.type || !form.content) {
      setError('請填寫名稱、類型與 Prompt 內容')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          brands: form.brands.length === 0 ? ['ALL'] : form.brands,
          source: url || 'manual',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">提交成功！</h2>
          <p className="text-gray-500 text-sm mb-6">指令已進入待審核區，管理員批准後即會上線。</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ name: '', type: '', subcategory: '', brands: [], content: '', notes: '', submittedBy: '' }); setUrl('') }} className="btn-secondary">
              再新增一個
            </button>
            <Link href="/" className="btn-primary">返回首頁</Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">新增指令</h1>
          <p className="text-sm text-gray-500">新增後需要管理員批准才會上線</p>
        </div>

        {/* Tab 切換 */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setTab('manual')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            手動填寫
          </button>
          <button
            onClick={() => setTab('url')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            從 Threads 匯入
          </button>
        </div>

        {/* URL 匯入 */}
        {tab === 'url' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
            <p className="text-sm text-gray-600 mb-3">貼上 Threads 貼文網址，系統會自動擷取 prompt 內容並分類</p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://www.threads.net/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleScrape}
                disabled={scraping || !url.trim()}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {scraping ? '擷取中...' : '自動擷取'}
              </button>
            </div>
            {scrapeError && <p className="text-red-500 text-xs mt-2">{scrapeError}</p>}
            <p className="text-xs text-gray-400 mt-2">擷取後可在下方手動調整內容</p>
          </div>
        )}

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 指令名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">指令名稱 *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="例：廣告圖去背（白底）"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">類型 *</label>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('type', t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 子分類 */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">子分類</label>
              <div className="flex gap-2 flex-wrap">
                {subcategories.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('subcategory', s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.subcategory === s
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 適用品牌 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              適用品牌
              <span className="text-gray-400 font-normal ml-1">（不選 = 所有品牌共用）</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {brands.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    form.brands.includes(b.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt 內容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt 內容 *
              <span className="text-gray-400 font-normal ml-1">（變數請用 {'{'} {'}'} 包住，例：{'{品牌名稱}'}）</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => update('content', e.target.value)}
              rows={6}
              placeholder="在此貼上 prompt 內容..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* 提交者姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">你的名字</label>
            <input
              type="text"
              value={form.submittedBy}
              onChange={e => update('submittedBy', e.target.value)}
              placeholder="選填"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 備注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備注</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="補充說明、使用場景等（選填）"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交審核'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const [brands, categories] = await Promise.all([getBrands(), getCategories()])
    return { props: { brands, categories } }
  } catch {
    return { props: { brands: [], categories: [] } }
  }
}
