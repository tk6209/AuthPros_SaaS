import React from 'react'

const AuthContext = React.createContext<{
  token: string | null
  setToken: (t: string | null) => void
}>({ token: localStorage.getItem('token'), setToken: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'))
  React.useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])
  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return React.useContext(AuthContext)
}
