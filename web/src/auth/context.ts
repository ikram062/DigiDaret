import { createContext, useContext } from "react"
import type { Language, User } from "@/lib/api"

export type SignupInput = {
  fullName: string
  email: string
  phone: string
  password: string
  preferredLanguage: Language
}

export type AuthState = {
  /** undefined while the first session check is in flight, null when logged out */
  user: User | null | undefined
  login: (email: string, password: string) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
