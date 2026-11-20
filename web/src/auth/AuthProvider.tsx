import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, ApiError, type User } from "@/lib/api"
import { AuthContext, type AuthState, type SignupInput } from "./context"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  // Ask the server who we are. The session lives in an HttpOnly cookie we cannot read.
  useEffect(() => {
    let cancelled = false
    api<{ user: User }>("/auth/me")
      .then((r) => !cancelled && setUser(r.user))
      .catch((e) => {
        if (cancelled) return
        if (!(e instanceof ApiError) || e.status !== 401) console.error(e)
        setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User }>("/auth/login", { body: { email, password } })
    setUser(r.user)
  }, [])

  const signup = useCallback(async (input: SignupInput) => {
    const r = await api<{ user: User }>("/auth/signup", { body: input })
    setUser(r.user)
  }, [])

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {})
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const r = await api<{ user: User }>("/auth/me")
    setUser(r.user)
  }, [])

  const value = useMemo<AuthState>(() => ({ user, login, signup, logout, refresh }), [user, login, signup, logout, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
