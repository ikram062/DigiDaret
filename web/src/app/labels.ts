import type { CircleStatus } from "@/lib/api"

export const statusChip: Record<CircleStatus, { label: string; tone: "amber" | "green" | "grey" | "red" }> = {
  FORMING: { label: "Forming", tone: "amber" },
  ACTIVE: { label: "Active", tone: "green" },
  COMPLETED: { label: "Completed", tone: "grey" },
  CANCELLED: { label: "Cancelled", tone: "red" },
}
