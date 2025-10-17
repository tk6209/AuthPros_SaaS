import React from 'react'
import axios from 'axios'
import { useAuth } from '../state/auth'

export function AgentList({ onPick }: { onPick: (agent: {id:string,name:string})=>void }) {
  const { token } = useAuth()
  const [agents, setAgents] = React.useState<{id:string,name:string}[]>([])
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/agents', { headers: { Authorization: `Bearer ${token}` }})
        setAgents(res.data.agents)
      } finally { setLoading(false) }
    })()
  }, [token])
  if (loading) return <div className="p-4 text-[var(--muted)]">Loading agents…</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map(a => (
        <button key={a.id} onClick={()=>onPick(a)} className="bg-[var(--card)] hover:bg-white/5 p-4 rounded-xl text-left">
          <div className="text-lg font-semibold">{a.name}</div>
          <div className="text-sm text-[var(--muted)]">Specialist agent</div>
        </button>
      ))}
    </div>
  )
}
