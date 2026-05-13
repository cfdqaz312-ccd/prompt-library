import Link from 'next/link'

const TYPE_STYLES = {
  '圖片': 'bg-blue-100 text-blue-700',
  '文案': 'bg-green-100 text-green-700',
}

export default function PromptCard({ prompt, brandId }) {
  const isShared = prompt.brands.includes('ALL')

  return (
    <Link href={`/prompt/${prompt.id}${brandId ? `?brandId=${brandId}` : ''}`}>
      <div className="card p-5 cursor-pointer group h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
            {prompt.name}
          </h3>
          <div className="flex gap-1.5 flex-shrink-0">
            <span className={`badge ${TYPE_STYLES[prompt.type] || 'bg-gray-100 text-gray-600'}`}>
              {prompt.type}
            </span>
            {isShared && (
              <span className="badge bg-gray-100 text-gray-500">共用</span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3 flex-1 line-clamp-2">
          {prompt.content.replace(/\{[^}]+\}/g, '...')}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{prompt.subcategory}</span>
          {prompt.hasVariables && (
            <span className="text-xs text-indigo-500 font-medium">含變數</span>
          )}
        </div>
      </div>
    </Link>
  )
}
