import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
            Prompt Library
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={`font-medium transition-colors ${router.pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              指令庫
            </Link>
            <Link
              href="/submit"
              className={`font-medium transition-colors ${router.pathname === '/submit' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              新增指令
            </Link>
            <Link
              href="/admin"
              className={`font-medium transition-colors ${router.pathname === '/admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              待審核
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
