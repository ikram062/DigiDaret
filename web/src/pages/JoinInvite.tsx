import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useAuth } from "@/auth/context"
import { Logo } from "@/components/fx/Zellige"
import { api, fmtDate, mad, type InvitePreview } from "@/lib/api"
import { useFetch } from "@/lib/useFetch"
import { Btn, ErrorBox, Loading } from "@/app/ui"

/** What an invited person sees: the rules, the free spots, and one button. */
export function JoinInvite() {
  const { token } = useParams()
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const { data, error, loading } = useFetch<InvitePreview>(`/invites/${token}`)
  const [err, setErr] = useState<string>()
  const [busy, setBusy] = useState(false)
  const here = `/join/${token}`

  async function join() {
    setBusy(true)
    setErr(undefined)
    try {
      const r = await api<{ circleId: string }>(`/invites/${token}/join`, { method: "POST" })
      navigate(`/app/circles/${r.circleId}`, { replace: true })
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  async function verify() {
    setBusy(true)
    try {
      await api("/me/verify-simulated", { method: "POST" })
      await refresh()
      setErr(undefined)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  const c = data?.circle
  return (
    <div className="flex min-h-svh flex-col items-center bg-sand px-5 py-10">
      <Link to="/" className="mb-10 flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <Logo className="size-7" /> DigiDaret
      </Link>

      <div className="w-full max-w-md">
        {loading && <Loading />}
        {error && (
          <div className="space-y-4 text-center">
            <h1 className="font-display text-3xl font-semibold text-ink">Invite not found</h1>
            <ErrorBox message="This invite link is not valid. Ask the organizer for a new one." />
          </div>
        )}

        {c && data && (
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_30px_80px_rgba(11,26,22,.10)] sm:p-8">
            <p className="text-sm text-ink/50">{c.organizerName} invited you to a Daret</p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-ink">{c.name}</h1>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink/45">You pay</dt>
                <dd className="font-display text-xl font-semibold">{mad(c.monthlyAmount)}/month</dd>
              </div>
              <div>
                <dt className="text-ink/45">Monthly pot</dt>
                <dd className="font-display text-xl font-semibold">{mad(c.potAmount)}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Members</dt>
                <dd className="font-medium">{c.memberCount} ({c.spotsLeft} spot{c.spotsLeft === 1 ? "" : "s"} left)</dd>
              </div>
              <div>
                <dt className="text-ink/45">First payment</dt>
                <dd className="font-medium">{fmtDate(c.startDate)}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Grace period</dt>
                <dd className="font-medium">{c.graceDays === 0 ? "None" : `${c.graceDays} days`}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Payout order</dt>
                <dd className="font-medium">{c.orderMode === "AUTOMATIC" ? "By reliability" : "Agreed by all"}</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs text-ink/50">You will see the full rules and accept them before the circle starts.</p>

            <div className="mt-6 space-y-3">
              {data.closedReason && !data.isMember && <ErrorBox message={data.closedReason} />}
              {err && <ErrorBox message={err} />}

              {data.isMember ? (
                <Link to={`/app/circles/${c.id}`} className="flex h-11 items-center justify-center rounded-xl bg-forest font-semibold text-sand hover:bg-ink">
                  You are in. Open the circle
                </Link>
              ) : !user ? (
                <>
                  <Link to={`/signup?next=${encodeURIComponent(here)}`} className="flex h-11 items-center justify-center rounded-xl bg-forest font-semibold text-sand hover:bg-ink">
                    Create an account to join
                  </Link>
                  <Link to={`/login?next=${encodeURIComponent(here)}`} className="flex h-11 items-center justify-center rounded-xl border border-ink/15 font-semibold text-ink hover:bg-sand-2">
                    I already have an account
                  </Link>
                </>
              ) : user.kycStatus !== "VERIFIED" ? (
                <>
                  <p className="text-sm text-ink/65">Your identity must be verified by our licensed partner before you can join a circle.</p>
                  {import.meta.env.DEV && (
                    <Btn variant="accent" className="w-full" disabled={busy} onClick={verify}>
                      Verify my identity (simulated)
                    </Btn>
                  )}
                </>
              ) : (
                <Btn className="h-11 w-full" disabled={busy || !!data.closedReason} onClick={join}>
                  {busy ? "Joining…" : "Join this circle"}
                </Btn>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
