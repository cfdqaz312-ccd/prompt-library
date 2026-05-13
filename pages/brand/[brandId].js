import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PromptCard from '../../components/PromptCard'
import { getBrands, getApprovedPrompts, getCategories } from '../../lib/sheets'

export default function BrandPage({ brand, prompts, categories }) {
  const [activeType, setActiveType] = useState('全部')
  const [activeSub, setActiveSub] = useState('全部')
  const [search, setSearch] = useState('')

  const types = ['全部', ...new Set(prompts.map(p => p.type))]

  const subcategories = ['全部', ...new Set(
    prompts
      .filter(p => activeType === '全部' || p.type === activeType)
      .map(p => p.subcategory)
      .filter(Boolean)
  )]

  const filtered = prompts.filter(p => {
    const matchType = activeType === '全部' || p.type === activeType
    const matchSub = activeSub === '全部' || p.subcategory === activeSub
    const matchSearch = !search || p.name.includes(search) || p.content.includes(search)
    return matchType && matchSub && matchSearch
  })

  if (!brand) {
    return (
      <Layout>
        <p className="text-gray-500">找不到此品牌</p>
        <Link href="/" className="text-indigo-600 text-sm mt-2 inline-block">← 返回首頁</Link>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* 麵包屑 */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">首頁</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{brand.name}</span>
      </div>

      {/* 品牌標題 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand.name}</h1>
        {brand.styleKeywords && (
          <p className="text-sm text-gray-500">{brand.styleKeywords}</p>
        )}
      </div>

      {/* 篩選列 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* 搜尋 */}
        <input
          type="text"
          placeholder="搜尋指令..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
        />

        {/* 類型篩選 */}
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => { setActiveType(t); setActiveSub('全部') }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 子分類篩選 */}
      {subcategories.length > 2 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {subcategories.map(s => (
            <button
              key={s}
              onClick={() => setActiveSub(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeSub === s
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 結果數量 */}
      <p className="text-sm text-gray-400 mb-4">{filtered.length} 個指令</p>

      {/* 指令列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">找不到符合的指令</p>
          <Link href="/submit" className="text-indigo-500 text-sm hover:underline">
            新增一個指令 →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} brandId={brand.id} />
          ))}
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const [brands, prompts, categories] = await Promise.all([
      getBrands(),
      getApprovedPrompts(params.brandId),
      getCategories(),
    ])
    const brand = brands.find(b => b.id === params.brandId) || null
    return { props: { brand, prompts, categories } }
  } catch {
    return { props: { brand: null, prompts: [], categories: [] } }
  }
}
