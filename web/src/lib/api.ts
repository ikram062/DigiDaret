export type Language = "DARIJA" | "ARABIC" | "FRENCH" | "ENGLISH"
export type KycStatus = "UNVERIFIED" | "PENDING" | "VERIFIED"

export type User = {
  id: string
  fullName: string
  email: string
  phone: string | null
  preferredLanguage: Language
  kycStatus: KycStatus
  createdAt: string
}

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>
  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
    })
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.")
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.message ?? "Something went wrong.", data.fieldErrors)
  return data as T
}

export const languageLabel: Record<Language, string> = {
  DARIJA: "Darija",
  ARABIC: "Arabic",
  FRENCH: "French",
  ENGLISH: "English",
}
