import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../state/auth'

export function LoginPage() {
  const nav = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      setToken(res.data.token)
      nav('/agents')
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[var(--card)] rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Welcome back</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 focus:outline-none" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 focus:outline-none" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="w-full bg-[var(--accent)] hover:opacity-90 rounded py-2 font-semibold">Sign in</button>
        </form>
        <p className="text-sm text-[var(--muted)] mt-4">No account? <Link to="/register" className="text-white underline">Create one</Link></p>
      </div>
    </div>
  )
}
