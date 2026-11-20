import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowDown, ArrowUp, Check, Clock, Copy, MessageCircle, RefreshCw } from "lucide-react"
import {
  api,
  fmtDate,
  mad,
  statusLabel,
  type CircleDetail as Detail,
  type CircleRules,
  type ContributionStatus,
} from "@/lib/api"
import { useFetch } from "@/lib/useFetch"
import { cn } from "@/lib/utils"
import { Btn, Card, CardTitle, Chip, ErrorBox, Loading, PageHeader } from "./ui"
import { RulesForm } from "./RulesForm"
import { statusChip } from "./labels"

const contribTone: Record<ContributionStatus, "grey" | "green" | "amber" | "red"> = {
  PENDING: "grey",
  PAID_ON_TIME: "green",
  PAID_IN_GRACE: "amber",
  COVERED_UNPAID: "red",
  COVERED_REPAID: "amber",
}

export function CircleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading, setData } = useFetch<Detail>(`/circles/${id}`)
  const [actionError, setActionError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  if (loading) return <Loading />
  if (error || !data) return <ErrorBox message={error ?? "Circle not found."} />

  const { circle, you, members, readiness, invite, rounds } = data
  const forming = circle.status === "FORMING"
  const chip = statusChip[circle.status]

  /** Runs an action that returns the refreshed circle. */
  async function act(run: () => Promise<Detail | void>) {
    setBusy(true)
    setActionError(undefined)
    try {
      const next = await run()
      if (next) setData(next)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }
  const post = (path: string, body: unknown = {}) => act(() => api<Detail>(`/circles/${circle.id}${path}`, { body }))
  const confirmed = (msg: string, fn: () => void) => window.confirm(msg) && fn()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My circles" title={circle.name}>
        <Chip tone={chip.tone}>{chip.label}</Chip>
      </PageHeader>
      <p className="-mt-4 text-ink/60">
        {mad(circle.monthlyAmount)} a month · {circle.memberCount} members · pot of {mad(circle.potAmount)} · organized by {circle.organizerName}
      </p>

      {actionError && <ErrorBox message={actionError} />}

      {/* ---------- rules ---------- */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">The rules</h2>
          {forming && you.isOrganizer && !editing && (
            <Btn variant="secondary" onClick={() => setEditing(true)}>
              Edit rules
            </Btn>
          )}
        </div>
        {editing ? (
          <>
            <p className="mb-4 text-sm text-ink/60">Changing the rules means every member has to accept them again.</p>
            <RulesForm
              initial={{ name: circle.name, monthlyAmount: circle.monthlyAmount, memberCount: circle.memberCount, startDate: circle.startDate, graceDays: circle.graceDays, orderMode: circle.orderMode }}
              submitLabel="Save rules"
              onCancel={() => setEditing(false)}
              onSubmit={async (rules: CircleRules) => {
                setData(await api<Detail>(`/circles/${circle.id}`, { method: "PATCH", body: rules }))
                setEditing(false)
              }}
            />
          </>
        ) : (
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Rule k="Each member pays" v={`${mad(circle.monthlyAmount)} every month`} />
            <Rule k="Monthly pot" v={mad(circle.potAmount)} />
            <Rule k="First payment" v={fmtDate(circle.startDate)} />
            <Rule k="Grace period" v={circle.graceDays === 0 ? "None" : `${circle.graceDays} day${circle.graceDays > 1 ? "s" : ""}`} />
            <Rule k="Duration" v={`${circle.memberCount} months, one pot each month`} />
            <Rule
              k="Payout order"
              v={circle.orderMode === "AUTOMATIC" ? "Automatic, by reliability. Newcomers last." : "Proposed by the organizer, approved by everyone"}
            />
          </dl>
        )}
        {forming && !editing && (
          <p className="mt-4 border-t border-ink/10 pt-4 text-xs text-ink/50">
            If a payment is missed: a reminder, a retry, then the grace period. If it is still unpaid, the Safety Fund covers it up to a cap.
            The member who missed still owes it, and cannot join new circles until it is settled.
          </p>
        )}
      </Card>

      {/* ---------- accept ---------- */}
      {forming && !you.acceptedCurrentRules && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-saffron/40 bg-saffron/15 p-5">
          <div>
            <div className="font-semibold text-ink">Review the rules above</div>
            <p className="text-sm text-ink/65">You join the circle for good once it starts, so read them first.</p>
          </div>
          <Btn variant="accent" disabled={busy} onClick={() => post("/accept", { rulesVersion: circle.rulesVersion })}>
            I accept these rules
          </Btn>
        </div>
      )}

      {/* ---------- members ---------- */}
      <Card>
        <CardTitle>
          Members <span className="font-sans text-base font-normal text-ink/50">{members.length}/{circle.memberCount}</span>
        </CardTitle>
        <ul className="divide-y divide-ink/10">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest font-display font-semibold text-sand">{m.fullName[0]}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-ink">
                  {m.fullName} {m.isYou && <span className="text-ink/40">(you)</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {m.isOrganizer && <Chip tone="dark">Organizer</Chip>}
                  {forming && (m.acceptedCurrentRules ? <Chip tone="green">Accepted</Chip> : <Chip tone="amber">Has not accepted</Chip>)}
                  {forming && circle.orderMode === "MANUAL" && m.payoutPosition !== null && (m.orderApproved ? <Chip tone="green">Order approved</Chip> : <Chip tone="grey">Order not approved</Chip>)}
                  {m.payoutPosition !== null && <Chip tone="grey">Receives in month {m.payoutPosition}</Chip>}
                </div>
              </div>
              {forming && you.isOrganizer && !m.isOrganizer && (
                <Btn variant="danger" disabled={busy} onClick={() => confirmed(`Remove ${m.fullName} from the circle?`, () => act(() => api<Detail>(`/circles/${circle.id}/members/${m.id}`, { method: "DELETE" })))}>
                  Remove
                </Btn>
              )}
            </li>
          ))}
          {Array.from({ length: Math.max(0, circle.memberCount - members.length) }).map((_, i) => (
            <li key={`empty${i}`} className="flex items-center gap-3 py-3 text-ink/40">
              <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-ink/25">+</span>
              Waiting for a member
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------- invite ---------- */}
      {forming && you.isOrganizer && invite && <InvitePanel circle={circle} token={invite.token} busy={busy} onRegenerate={() => confirmed("Create a new link? The old link will stop working.", () => post("/invite/regenerate"))} />}

      {/* ---------- payout order ---------- */}
      {forming && (
        <Card>
          <CardTitle>Payout order</CardTitle>
          {circle.orderMode === "AUTOMATIC" ? (
            <p className="text-sm leading-relaxed text-ink/70">
              When the organizer starts the circle, members are ordered by their reliability points, highest first, so the people most likely to keep paying receive first.
              Newcomers go last. If everyone is new, the order is drawn at random. Everyone then sees the final order.
              Points are private: nobody sees anyone else&apos;s.
            </p>
          ) : !readiness.full ? (
            <p className="text-sm text-ink/70">The order can be proposed once the circle is full.</p>
          ) : (
            <ManualOrder
              key={members.map((m) => `${m.id}:${m.payoutPosition}`).join("|")}
              data={data}
              busy={busy}
              onPropose={(ids) => act(() => api<Detail>(`/circles/${circle.id}/order`, { method: "PUT", body: { memberIds: ids } }))}
              onApprove={() => post("/order/approve")}
            />
          )}
        </Card>
      )}

      {/* ---------- start / leave / cancel ---------- */}
      {forming && (
        <Card>
          <CardTitle>{you.isOrganizer ? "Ready to start?" : "Waiting to start"}</CardTitle>
          <ul className="mb-5 space-y-2 text-sm">
            <Check_ ok={readiness.full} text={`The circle is full (${members.length}/${circle.memberCount})`} />
            <Check_ ok={readiness.allAccepted} text="Everyone accepted the rules" />
            {circle.orderMode === "MANUAL" && <Check_ ok={readiness.orderReady} text="Everyone approved the payout order" />}
            <Check_ ok={readiness.dateOk} text="The first payment date is still ahead" />
          </ul>
          <div className="flex flex-wrap gap-3">
            {you.isOrganizer ? (
              <>
                <Btn variant="accent" disabled={busy || !readiness.canStart} onClick={() => confirmed("Start the circle? The rules and the payout order are frozen from now on.", () => post("/start"))}>
                  Start the circle
                </Btn>
                <Btn variant="danger" disabled={busy} onClick={() => confirmed("Cancel this circle? It will never start.", () => post("/cancel"))}>
                  Cancel the circle
                </Btn>
              </>
            ) : (
              <Btn
                variant="danger"
                disabled={busy}
                onClick={() =>
                  confirmed("Leave this circle?", () =>
                    act(async () => {
                      await api(`/circles/${circle.id}/leave`, { method: "POST" })
                      navigate("/app/circles", { replace: true })
                    }),
                  )
                }
              >
                Leave the circle
              </Btn>
            )}
          </div>
        </Card>
      )}

      {circle.status === "CANCELLED" && <ErrorBox message="This circle was cancelled before it started." />}

      {/* ---------- schedule ---------- */}
      {rounds.length > 0 && (
        <Card>
          <CardTitle>Schedule</CardTitle>
          {you.payoutPosition && (
            <p className="mb-4 text-sm text-ink/70">
              You receive the pot of <b>{mad(circle.potAmount)}</b> in month <b>{you.payoutPosition}</b>.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink/45">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Month</th>
                  <th className="pb-2 pr-3 font-medium">Due date</th>
                  <th className="pb-2 pr-3 font-medium">Receives the pot</th>
                  <th className="pb-2 font-medium">Your payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {rounds.map((r) => (
                  <tr key={r.index} className={cn(r.youReceive && "bg-saffron/10")}>
                    <td className="py-3 pr-3 font-display text-lg font-semibold">{r.index}</td>
                    <td className="py-3 pr-3">{fmtDate(r.dueDate)}</td>
                    <td className="py-3 pr-3">
                      {r.recipientName} {r.youReceive && <Chip tone="amber">You</Chip>}
                    </td>
                    <td className="py-3">
                      {r.yourContribution && <Chip tone={contribTone[r.yourContribution.status]}>{statusLabel[r.yourContribution.status]}</Chip>}
                      {r.youReceive && !r.yourContribution && "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-ink/45">Automatic payments and the Safety Fund arrive in the next step.</p>
        </Card>
      )}
    </div>
  )
}

function Rule({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/45">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}

function Check_({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={cn("flex items-center gap-2", ok ? "text-ink" : "text-ink/55")}>
      {ok ? <Check className="size-4 text-forest" /> : <Clock className="size-4 text-saffron" />}
      {text}
    </li>
  )
}

function InvitePanel({ circle, token, busy, onRegenerate }: { circle: Detail["circle"]; token: string; busy: boolean; onRegenerate: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/join/${token}`
  const text = `Join my Daret "${circle.name}" on DigiDaret: ${mad(circle.monthlyAmount)} a month, ${circle.memberCount} members. ${link}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copy this link", link)
    }
  }

  return (
    <Card>
      <CardTitle>Invite your friends</CardTitle>
      <p className="mb-4 text-sm text-ink/65">Send this private link. Anyone who opens it can read the rules and join until the circle is full. They need a verified account.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Invite link" className="h-10 min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink/80" />
        <Btn variant="secondary" onClick={copy}>
          <Copy className="size-4" /> {copied ? "Copied" : "Copy"}
        </Btn>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-ink hover:brightness-95"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>
      <button onClick={onRegenerate} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink">
        <RefreshCw className="size-3" /> Create a new link (the old one stops working)
      </button>
    </Card>
  )
}

function ManualOrder({ data, busy, onPropose, onApprove }: { data: Detail; busy: boolean; onPropose: (ids: string[]) => void; onApprove: () => void }) {
  const { members, you } = data
  const proposed = members.every((m) => m.payoutPosition !== null)
  const initial = [...members].sort((a, b) => (a.payoutPosition ?? 99) - (b.payoutPosition ?? 99)).map((m) => m.id)
  const [draft, setDraft] = useState(initial)
  const byId = new Map(members.map((m) => [m.id, m]))
  const move = (i: number, d: number) =>
    setDraft((cur) => {
      const next = [...cur]
      ;[next[i], next[i + d]] = [next[i + d]!, next[i]!]
      return next
    })

  if (!you.isOrganizer) {
    return (
      <div>
        {proposed ? (
          <>
            <p className="mb-3 text-sm text-ink/70">The organizer proposed this order. The circle starts only when everyone approves it.</p>
            <ol className="mb-4 space-y-1.5">
              {initial.map((id, i) => (
                <li key={id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 font-display text-lg font-semibold text-forest">{i + 1}</span>
                  {byId.get(id)!.fullName}
                </li>
              ))}
            </ol>
            {you.orderApproved ? <Chip tone="green">You approved</Chip> : <Btn variant="accent" disabled={busy} onClick={onApprove}>Approve this order</Btn>}
          </>
        ) : (
          <p className="text-sm text-ink/70">The organizer has not proposed an order yet.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-sm text-ink/70">
        {proposed ? "Your proposal is out. Changing it asks everyone to approve again." : "Arrange who receives first, then propose it. Every member has to approve."}
      </p>
      <ol className="mb-4 space-y-2">
        {draft.map((id, i) => (
          <li key={id} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2">
            <span className="w-6 font-display text-lg font-semibold text-forest">{i + 1}</span>
            <span className="flex-1 text-sm font-medium">{byId.get(id)!.fullName}</span>
            <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-2 disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button aria-label="Move down" disabled={i === draft.length - 1} onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-2 disabled:opacity-30">
              <ArrowDown className="size-4" />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Btn disabled={busy} onClick={() => onPropose(draft)}>
          {proposed ? "Update the proposal" : "Propose this order"}
        </Btn>
        {proposed && (
          <span className="flex items-center gap-1 text-sm text-ink/55">
            {members.filter((m) => m.orderApproved).length}/{members.length} approved
          </span>
        )}
      </div>
    </div>
  )
}
