import type { CircleRules } from "@/lib/api"

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)

export const defaultRules = (): CircleRules => ({
  name: "",
  monthlyAmount: 1000,
  memberCount: 5,
  startDate: inDays(14),
  graceDays: 3,
  orderMode: "AUTOMATIC",
})
