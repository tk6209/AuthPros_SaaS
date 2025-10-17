import React from 'react'
import axios from 'axios'
import { useAuth } from '../state/auth'

type Message = { role: 'user'|'assistant', content: string }

export function ChatPanel({ agentId, agentName }: { agentId: string, agentName: string }) {
  const { token } = useAuth()
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  async function send() {
    if (!input.trim() || busy) return
    const text = input
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setBusy(true)
    try {
      const res = await axios.post('/api/agents/chat', { agentId, sessionId: sessionId || undefined, message: text }, { headers: { Authorization: `Bearer ${token}` }})
      setSessionId(res.data.sessionId)
      const history = res.data.history as { role: string, content: string }[]
      setMessages(history.map(h => ({ role: h.role as 'user'|'assistant', content: h.content })))
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="font-semibold">{agentName}</div>
        {sessionId && <div className="text-xs text-[var(--muted)]">Session: {sessionId.slice(0,8)}…</div>}
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m,i) => (
          <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
            <div className={"inline-block px-3 py-2 rounded-xl max-w-[80%] "+(m.role==='user'?'bg-[var(--accent)]':'bg-[var(--card)]')}>{m.content}</div>
          </div>
        ))}
        {messages.length===0 && <div className="text-center text-[var(--muted)]">Start a conversation with the specialist…</div>}
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') send() }}
          className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10 focus:outline-none" placeholder="Type your message" />
        <button onClick={send} disabled={busy} className="px-4 py-2 bg-[var(--accent)] rounded font-semibold disabled:opacity-50">Send</button>
      </div>
    </div>
  )
}
