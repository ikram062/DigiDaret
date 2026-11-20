import { Link, useNavigate } from "react-router"
import { Plus } from "lucide-react"
import { api, fmtDate, mad, type CircleRules, type CircleSummary } from "@/lib/api"
import { useFetch } from "@/lib/useFetch"
import { Card, Chip, ErrorBox, Loading, PageHeader } from "./ui"
import { RulesForm } from "./RulesForm"
import { defaultRules } from "./rules"
import { statusChip } from "./labels"

export function Circles() {
  const { data, error, loading } = useFetch<{ circles: CircleSummary[] }>("/circles")

  return (
    <div>
      <PageHeader eyebrow="My circles" title="Your circles">
        <Link to="/app/circles/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-saffron px-4 text-sm font-semibold text-ink hover:brightness-95">
          <Plus className="size-4" /> Create a circle
        </Link>
      </PageHeader>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {data && data.circles.length === 0 && (
        <Card className="py-14 text-center">
          <p className="font-display text-2xl font-semibold text-ink">No circles yet</p>
          <p className="mx-auto mt-2 max-w-sm text-ink/60">Start one and invite your friends with a WhatsApp link, or open an invite link someone sent you.</p>
          <Link to="/app/circles/new" className="mt-6 inline-flex h-10 items-center rounded-xl bg-forest px-4 text-sm font-semibold text-sand hover:bg-ink">
            Create your circle
          </Link>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {data?.circles.map((c) => {
          const s = statusChip[c.status]
          return (
            <Link key={c.id} to={`/app/circles/${c.id}`} className="group rounded-3xl border border-ink/10 bg-white/60 p-5 transition hover:border-forest/40 hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-ink">{c.name}</h2>
                <Chip tone={s.tone}>{s.label}</Chip>
              </div>
              <p className="mt-1 text-sm text-ink/55">
                {mad(c.monthlyAmount)} a month · {c.joinedCount}/{c.memberCount} members
                {c.isOrganizer && " · you organize"}
              </p>
              <p className="mt-4 text-sm text-ink/70">
                {c.status === "FORMING" && `First payment ${fmtDate(c.startDate)}`}
                {c.status === "ACTIVE" && (c.nextDue ? `Next payment ${mad(c.nextDue.amount)} on ${fmtDate(c.nextDue.dueDate)}` : "Nothing due")}
                {c.status === "COMPLETED" && "Everyone has received the pot."}
                {c.status === "CANCELLED" && "This circle never started."}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CreateCircle() {
  const navigate = useNavigate()
  const create = async (rules: CircleRules) => {
    const r = await api<{ id: string }>("/circles", { body: rules })
    navigate(`/app/circles/${r.id}`, { replace: true })
  }
  return (
    <div>
      <PageHeader eyebrow="My circles" title="Create your circle" />
      <p className="-mt-4 mb-8 max-w-xl text-ink/65">
        Set the rules once. Every member has to accept them before the circle starts, and nobody can change them afterwards.
      </p>
      <Card>
        <RulesForm initial={defaultRules()} submitLabel="Create circle" onSubmit={create} />
      </Card>
    </div>
  )
}
