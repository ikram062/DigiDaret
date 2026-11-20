import { Lock } from "lucide-react"
import { fmtDate, mad, statusLabel, type ContributionStatus, type Level, type ScoreResult } from "@/lib/api"
import { useFetch } from "@/lib/useFetch"
import { Card, CardTitle, Chip, ErrorBox, Loading, PageHeader } from "./ui"

type Payload = {
  score: ScoreResult
  history: { circleName: string; dueDate: string; amount: number; status: ContributionStatus; paidAt: string | null }[]
}

const tone: Record<ContributionStatus, "grey" | "green" | "amber" | "red"> = {
  PENDING: "grey",
  PAID_ON_TIME: "green",
  PAID_IN_GRACE: "amber",
  COVERED_UNPAID: "red",
  COVERED_REPAID: "amber",
}

const levelTone: Record<Level, string> = {
  A: "bg-forest text-sand",
  B: "bg-forest text-sand",
  C: "bg-jade text-ink",
  D: "bg-terracotta text-sand",
  N: "bg-ink/15 text-ink",
}

export function TrustRecord() {
  const { data, error, loading } = useFetch<Payload>("/me/score")
  if (loading) return <Loading />
  if (error || !data) return <ErrorBox message={error ?? "Could not load your record."} />
  const { score: s, history } = data

  const R = 54
  const C = 2 * Math.PI * R

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Trust Record" title="A history you own" />

      <Card className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto size-40">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(11,26,22,.08)" strokeWidth="9" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="#0f5c4d" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - s.points / 100)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl font-semibold text-ink">{s.points}</span>
            <span className="text-xs text-ink/50">out of 100</span>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`flex size-11 items-center justify-center rounded-full font-display text-2xl font-semibold ${levelTone[s.level]}`}>{s.level}</span>
            <div>
              <div className="font-display text-2xl font-semibold text-ink">{s.levelName}</div>
              <div className="text-sm text-ink/55">Your Reliability Level</div>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-ink/65">
            <Lock className="mt-0.5 size-4 shrink-0 text-ink/40" />
            Only you can see your points. They are used to order payouts in circles with automatic ordering. A lender sees nothing unless you share it.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <Mini label="History" value={`${s.monthsOfHistory} mo`} />
        <Mini label="On time" value={s.onTimeRate === null ? "—" : `${Math.round(s.onTimeRate * 100)}%`} />
        <Mini label="On-time streak" value={String(s.streak)} />
        <Mini label="Circles completed" value={String(s.completedCircles)} />
      </div>

      <Card>
        <CardTitle>Where your points come from</CardTitle>
        <div className="space-y-4">
          <Bar label="Payment record" value={s.breakdown.record} max={70} />
          <Bar label="On-time streak" value={s.breakdown.streak} max={15} />
          <Bar label="Circles completed" value={s.breakdown.completion} max={15} />
        </div>
        {s.breakdown.capped && <p className="mt-4 text-sm text-terracotta">Your points are capped at 40 until you repay what the Safety Fund covered.</p>}
        <h3 className="mb-2 mt-6 text-sm font-semibold text-ink">How to improve</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink/70">
          {s.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <details className="mt-6 text-sm text-ink/65">
          <summary className="cursor-pointer font-medium text-ink">How is this calculated?</summary>
          <div className="mt-3 space-y-2">
            <p>Plain arithmetic on your payments over the last 12 months. No AI model and no hidden inputs. Your age, gender, address, contacts and phone data are never used.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Paid by the due date counts fully. Paid in the grace period counts 60%. Covered by the Safety Fund and later repaid counts 20%. Covered and still owed counts 0.</li>
              <li>New members start in the middle and move as their history grows, so one early payment cannot look perfect.</li>
              <li>Up to 15 points for a streak of on-time payments and up to 15 for finished circles.</li>
              <li>A Safety Fund payment you have not repaid caps your points at 40, and after 30 days ranks you last.</li>
            </ul>
            <p className="text-xs text-ink/45">These numbers are proposals. They have not been tested against repayment data yet.</p>
          </div>
        </details>
      </Card>

      <Card>
        <CardTitle>Your payments</CardTitle>
        {history.length === 0 ? (
          <p className="text-sm text-ink/60">No payments yet. Every payment you make in a circle will show up here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink/45">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Due</th>
                  <th className="pb-2 pr-3 font-medium">Circle</th>
                  <th className="pb-2 pr-3 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3">{fmtDate(h.dueDate)}</td>
                    <td className="py-2.5 pr-3">{h.circleName}</td>
                    <td className="py-2.5 pr-3">{mad(h.amount)}</td>
                    <td className="py-2.5"><Chip tone={tone[h.status]}>{statusLabel[h.status]}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-ink/45">Example data in the demo. Every payment will come from the partner&apos;s own ledger.</p>
      </Card>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
      <div className="text-xs uppercase tracking-widest text-ink/45">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold text-forest">{value}</div>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-ink/75">{label}</span>
        <span className="font-medium text-ink">{value} / {max}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-forest" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}
