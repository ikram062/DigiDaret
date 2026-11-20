import { Link } from "react-router"
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react"
import { useAuth } from "@/auth/context"
import { cn } from "@/lib/utils"

const kycText = {
  UNVERIFIED: {
    chip: "Not verified",
    body: "Before you can join a circle, a licensed partner checks your ID. DigiDaret never does that itself.",
  },
  PENDING: {
    chip: "Verification pending",
    body: "Your ID check is in progress with our licensed partner.",
  },
  VERIFIED: {
    chip: "Verified",
    body: "Your identity has been checked by our licensed partner. You can join and create circles.",
  },
} as const

export function Overview() {
  const { user } = useAuth()
  if (!user) return null
  const kyc = kycText[user.kycStatus]
  const verified = user.kycStatus === "VERIFIED"
  const first = user.fullName.split(" ")[0]

  return (
    <div>
      <p className="text-sm text-ink/50">Overview</p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">Salam, {first}</h1>

      <div
        className={cn(
          "mt-8 flex items-start gap-4 rounded-2xl border p-5",
          verified ? "border-jade/30 bg-jade/10" : "border-saffron/40 bg-saffron/15",
        )}
      >
        {verified ? (
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-forest" />
        ) : (
          <ShieldAlert className="mt-0.5 size-6 shrink-0 text-[#a86b0a]" />
        )}
        <div>
          <div className="font-semibold text-ink">
            Identity: <span className="font-display">{kyc.chip}</span>
          </div>
          <p className="mt-1 text-sm text-ink/65">{kyc.body}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Circles" value="0" note="You are not in a circle yet." />
        <Stat label="Next payment" value="None" note="Nothing is due." />
        <Stat
          label="Reliability Level"
          value="N"
          note="Too early. A Level needs at least 3 months of payment history."
        />
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-7 text-sand sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold">Start your first circle</h2>
          <p className="mt-1 max-w-md text-sm text-sand/65">
            Set the monthly amount and the number of members, then invite friends with a WhatsApp
            link.
          </p>
        </div>
        <Link
          to="/app/circles"
          className="flex shrink-0 items-center gap-2 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          Create a circle <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-5">
      <div className="text-xs uppercase tracking-widest text-ink/45">{label}</div>
      <div className="mt-2 font-display text-4xl font-semibold text-forest">{value}</div>
      <p className="mt-1 text-sm text-ink/55">{note}</p>
    </div>
  )
}
