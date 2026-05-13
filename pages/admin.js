import { useState } from 'react'
import Layout from '../components/Layout'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectReason, setRejectReason] = useState({})
  const [showRejectInput, setShowRejectInput] = useState(null)
  const [message, setMessage] = useState('')

  const fetchPending = async (pw) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pending?password=${encodeURIComponent(pw)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts(data)
      setAuthed(true)
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = (e) => {
    e.preventDefault()
    setAuthError('')
    fetchPending(password)
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts(ps => ps.filter(p => p.id !== id))
      setMessage('已批准上線')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`錯誤：${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason: rejectReason[id] || '', password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts(ps => ps.filter(p => p.id !== id))
      setShowRejectInput(null)
      setMessage('已退回')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`錯誤：${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (!authed) {
    return (
      <Layout>
        <div className="max-w-sm mx-auto mt-16">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">待審核區</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">管理員密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="輸入密碼"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
              {loading ? '驗證中...' : '進入'}
            </button>
          </form>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">待審核指令</h1>
          <p className="text-sm text-gray-500 mt-0.5">{prompts.length} 個待審核</p>
        </div>
        <button onClick={() => fetchPending(password)} className="btn-secondary text-sm">
          重新整理
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {message}
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">目前沒有待審核的指令</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map(prompt => (
            <div key={prompt.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{prompt.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge bg-blue-100 text-blue-700">{prompt.type}</span>
                    <span className="text-xs text-gray-400">{prompt.subcategory}</span>
                    <span className="text-xs text-gray-400">
                      品牌：{prompt.brands.join(', ')}
                    </span>
                    {prompt.submittedBy && (
                      <span className="text-xs text-gray-400">提交者：{prompt.submittedBy}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{prompt.createdAt}</span>
              </div>

              {/* Prompt 內容 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {prompt.content}
              </div>

              {prompt.notes && (
                <p className="text-sm text-gray-500 mb-4">備注：{prompt.notes}</p>
              )}

              {/* 來源 */}
              {prompt.source && prompt.source !== 'manual' && (
                <p className="text-xs text-gray-400 mb-3">
                  來源：<a href={prompt.source} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{prompt.source}</a>
                </p>
              )}

              {/* 操作按鈕 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprove(prompt.id)}
                  disabled={actionLoading === prompt.id}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  批准上線
                </button>

                {showRejectInput === prompt.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="退回原因（選填）"
                      value={rejectReason[prompt.id] || ''}
                      onChange={e => setRejectReason(r => ({ ...r, [prompt.id]: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <button
                      onClick={() => handleReject(prompt.id)}
                      disabled={actionLoading === prompt.id}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      確認退回
                    </button>
                    <button
                      onClick={() => setShowRejectInput(null)}
                      className="text-gray-400 hover:text-gray-600 text-sm px-2"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRejectInput(prompt.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg border border-red-200 hover:border-red-400 transition-colors"
                  >
                    退回
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
