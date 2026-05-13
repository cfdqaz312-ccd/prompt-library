import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { getPromptById, getBrands, getProducts } from '../../lib/sheets'
import { detectVariables } from '../../lib/categorizer'

export default function PromptDetail({ prompt, brand, products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [copied, setCopied] = useState(false)
  const variables = detectVariables(prompt?.content || '')

  // 將 prompt 內容中的變數替換成實際值
  const buildPrompt = () => {
    if (!prompt) return ''
    let result = prompt.content

    if (brand) {
      result = result.replace(/\{品牌名稱\}/g, brand.name)
      result = result.replace(/\{品牌色調\}/g, brand.colorDescription || '')
      result = result.replace(/\{品牌風格\}/g, brand.styleKeywords || '')
      result = result.replace(/\{品牌語氣\}/g, brand.toneDescription || '')
      if (brand.customVar1Label && brand.customVar1Value) {
        result = result.replace(new RegExp(`\\{${brand.customVar1Label}\\}`, 'g'), brand.customVar1Value)
      }
      if (brand.customVar2Label && brand.customVar2Value) {
        result = result.replace(new RegExp(`\\{${brand.customVar2Label}\\}`, 'g'), brand.customVar2Value)
      }
    }

    if (selectedProduct) {
      result = result.replace(/\{產品名稱\}/g, selectedProduct.name)
      result = result.replace(/\{產品描述\}/g, selectedProduct.description || '')
      result = result.replace(/\{產品特色\}/g, selectedProduct.features || '')
    }

    return result
  }

  const finalPrompt = buildPrompt()
  const hasUnfilled = /\{[^}]+\}/.test(finalPrompt)

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!prompt) {
    return (
      <Layout>
        <p className="text-gray-500">找不到此指令</p>
        <Link href="/" className="text-indigo-600 text-sm mt-2 inline-block">← 返回首頁</Link>
      </Layout>
    )
  }

  const TYPE_STYLES = {
    '圖片': 'bg-blue-100 text-blue-700',
    '文案': 'bg-green-100 text-green-700',
  }

  return (
    <Layout>
      {/* 麵包屑 */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">首頁</Link>
        {brand && (
          <>
            <span>/</span>
            <Link href={`/brand/${brand.id}`} className="hover:text-indigo-600 transition-colors">{brand.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{prompt.name}</span>
      </div>

      <div className="max-w-3xl">
        {/* 標題區 */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{prompt.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`badge ${TYPE_STYLES[prompt.type] || 'bg-gray-100 text-gray-600'}`}>
                {prompt.type}
              </span>
              <span className="text-sm text-gray-400">{prompt.subcategory}</span>
              {prompt.brands.includes('ALL') && (
                <span className="badge bg-gray-100 text-gray-500">共用</span>
              )}
            </div>
          </div>
        </div>

        {/* 變數選擇區（有變數才顯示） */}
        {prompt.hasVariables && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-indigo-800 mb-4">選擇要套用的變數</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 品牌已自動帶入 */}
              {brand && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">品牌</label>
                  <div className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-indigo-700 font-medium">
                    {brand.name} ✓ 已自動帶入
                  </div>
                </div>
              )}

              {/* 產品選擇（如果有產品變數） */}
              {variables.some(v => ['產品名稱', '產品描述', '產品特色'].includes(v)) && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">產品</label>
                  <select
                    value={selectedProduct?.id || ''}
                    onChange={e => {
                      const p = products.find(p => p.id === e.target.value)
                      setSelectedProduct(p || null)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- 選擇產品 --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {hasUnfilled && (
              <p className="text-xs text-amber-600 mt-3">
                ⚠ 仍有未填入的變數，請手動替換 {'{'} 紅色標記處 {'}'}
              </p>
            )}
          </div>
        )}

        {/* Prompt 預覽 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prompt 內容</span>
            <button
              onClick={handleCopy}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? '✓ 已複製' : '複製'}
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {finalPrompt.split(/(\{[^}]+\})/g).map((part, i) => {
                if (/^\{[^}]+\}$/.test(part)) {
                  return (
                    <span key={i} className="bg-amber-100 text-amber-700 rounded px-1 font-mono text-xs">
                      {part}
                    </span>
                  )
                }
                return part
              })}
            </p>
          </div>
        </div>

        {/* 備注 */}
        {prompt.notes && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <strong className="text-gray-700">備注：</strong> {prompt.notes}
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params, query }) {
  try {
    const { brandId } = query
    const [prompt, brands, products] = await Promise.all([
      getPromptById(params.id),
      getBrands(),
      brandId ? getProducts(brandId) : Promise.resolve([]),
    ])
    const brand = brandId ? (brands.find(b => b.id === brandId) || null) : null
    return { props: { prompt, brand, products } }
  } catch {
    return { props: { prompt: null, brand: null, products: [] } }
  }
}
