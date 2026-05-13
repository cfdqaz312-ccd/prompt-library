import Link from 'next/link'

const BRAND_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-red-500 to-pink-600',
  'from-green-500 to-emerald-600',
  'from-yellow-500 to-orange-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-pink-600',
]

export default function BrandCard({ brand, index, promptCount }) {
  const gradient = BRAND_COLORS[index % BRAND_COLORS.length]
  const initials = brand.name.slice(0, 2).toUpperCase()

  return (
    <Link href={`/brand/${brand.id}`}>
      <div className="card p-6 cursor-pointer group">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-105 transition-transform`}>
          {initials}
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{brand.name}</h3>
        {brand.styleKeywords && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">{brand.styleKeywords}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{promptCount ?? 0} 個指令</span>
        </div>
      </div>
    </Link>
  )
}
