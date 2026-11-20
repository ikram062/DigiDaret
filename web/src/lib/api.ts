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

// ---- circles -------------------------------------------------------------------------------

export type CircleStatus = "FORMING" | "ACTIVE" | "COMPLETED" | "CANCELLED"
export type OrderMode = "AUTOMATIC" | "MANUAL"
export type ContributionStatus =
  | "PENDING"
  | "PAID_ON_TIME"
  | "PAID_IN_GRACE"
  | "COVERED_UNPAID"
  | "COVERED_REPAID"

export type CircleRules = {
  name: string
  monthlyAmount: number
  memberCount: number
  startDate: string // YYYY-MM-DD
  graceDays: number
  orderMode: OrderMode
}

export type CircleSummary = {
  id: string
  name: string
  status: CircleStatus
  monthlyAmount: number
  memberCount: number
  joinedCount: number
  startDate: string
  isOrganizer: boolean
  nextDue: { dueDate: string; amount: number } | null
}

export type CircleDetail = {
  circle: CircleRules & {
    id: string
    status: CircleStatus
    potAmount: number
    rulesVersion: number
    organizerName: string
    startedAt: string | null
  }
  you: {
    memberId: string
    isOrganizer: boolean
    acceptedCurrentRules: boolean
    orderApproved: boolean
    payoutPosition: number | null
  }
  members: {
    id: string
    fullName: string
    isOrganizer: boolean
    isYou: boolean
    acceptedCurrentRules: boolean
    orderApproved: boolean
    payoutPosition: number | null
  }[]
  readiness: { full: boolean; allAccepted: boolean; orderReady: boolean; dateOk: boolean; canStart: boolean; missing: string[] }
  invite: { token: string; active: boolean } | null
  rounds: {
    index: number
    dueDate: string
    status: "UPCOMING" | "COLLECTING" | "PAID_OUT"
    recipientName: string
    youReceive: boolean
    yourContribution: { status: ContributionStatus; amount: number } | null
    paidCount: number
    memberTotal: number
  }[]
}

export type InvitePreview = {
  circle: {
    id: string
    name: string
    organizerName: string
    monthlyAmount: number
    memberCount: number
    potAmount: number
    spotsLeft: number
    startDate: string
    graceDays: number
    orderMode: OrderMode
  }
  isMember: boolean
  closedReason: string | null
}

// ---- reliability ---------------------------------------------------------------------------

export type Level = "A" | "B" | "C" | "D" | "N"

export type ScoreResult = {
  points: number
  orderingPoints: number
  level: Level
  levelName: string
  monthsOfHistory: number
  paymentsCounted: number
  onTimeRate: number | null
  streak: number
  completedCircles: number
  hasUnrepaidShortfall: boolean
  shortfallBlocked: boolean
  breakdown: { record: number; streak: number; completion: number; capped: boolean }
  tips: string[]
}

export type Summary = {
  activeCircles: number
  hasOpenDebt: boolean
  nextPayment: { amount: number; dueDate: string; circleId: string; circleName: string } | null
  score: { points: number; level: Level; levelName: string; monthsOfHistory: number }
}

export const statusLabel: Record<ContributionStatus, string> = {
  PENDING: "Pending",
  PAID_ON_TIME: "Paid on time",
  PAID_IN_GRACE: "Paid in grace period",
  COVERED_UNPAID: "Covered by Safety Fund, owed",
  COVERED_REPAID: "Covered, repaid",
}

export const mad = (n: number) => `${n.toLocaleString("en-US")} MAD`

export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
