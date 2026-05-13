import { useState } from 'react'
import Layout from '../components/Layout'
import BrandCard from '../components/BrandCard'
import { getBrands, getApprovedPrompts } from '../lib/sheets'

export default function Home({ brands, promptCounts }) {
  const [search, setSearch] = useState('')

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">選擇品牌</h1>
        <p className="text-gray-500 text-sm">選擇要操作的品牌，進入該品牌的指令庫</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="搜尋品牌名稱..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">找不到符合的品牌</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((brand, i) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              index={i}
              promptCount={promptCounts[brand.id] || 0}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const [brands, prompts] = await Promise.all([getBrands(), getApprovedPrompts()])
    const promptCounts = {}
    brands.forEach(b => {
      promptCounts[b.id] = prompts.filter(
        p => p.brands.includes('ALL') || p.brands.includes(b.id)
      ).length
    })
    return { props: { brands, promptCounts } }
  } catch {
    return { props: { brands: [], promptCounts: {} } }
  }
}
