import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { AgentList } from '../components/AgentList'
import { ChatPanel } from '../components/ChatPanel'

export function AgentsPage() {
  const nav = useNavigate()
  const { setToken } = useAuth()
  const [selected, setSelected] = React.useState<{id:string,name:string}|null>(null)

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <header className="lg:col-span-3 flex items-center justify-between p-3 bg-[var(--card)] rounded-xl">
        <div className="font-bold">AuthPros</div>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <button className="underline" onClick={()=>nav('/agents')}>Agents</button>
          <button className="underline" onClick={()=>{ setToken(null); nav('/login') }}>Sign out</button>
        </div>
      </header>

      <aside className="lg:col-span-1 bg-[var(--card)] rounded-xl p-4">
        <div className="text-sm text-[var(--muted)] mb-2">Specialists</div>
        <AgentList onPick={setSelected} />
      </aside>

      <main className="lg:col-span-2 bg-[var(--card)] rounded-xl min-h-[60vh]">
        {selected ? (
          <ChatPanel agentId={selected.id} agentName={selected.name} />
        ) : (
          <div className="h-full grid place-items-center text-[var(--muted)]">
            Pick a specialist to start chatting
          </div>
        )}
      </main>
    </div>
  )
}
