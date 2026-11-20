import { useState, type FormEvent } from "react"
import { ApiError, mad, type CircleRules, type OrderMode } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Field, FormError, SelectField } from "@/pages/Field"
import { Btn } from "./ui"

const today = () => new Date().toISOString().slice(0, 10)

const modes: { value: OrderMode; title: string; text: string }[] = [
  {
    value: "AUTOMATIC",
    title: "Automatic, by reliability",
    text: "People with the best payment record receive first. Newcomers go last. If everyone is new, the order is drawn at random.",
  },
  {
    value: "MANUAL",
    title: "You propose, everyone approves",
    text: "Once the circle is full, you propose an order. The circle only starts when every member has approved it.",
  },
]

/** The circle's rules. Used to create a circle and to edit it before it starts. */
export function RulesForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: CircleRules
  submitLabel: string
  onSubmit: (rules: CircleRules) => Promise<void>
  onCancel?: () => void
}) {
  const [f, setF] = useState(initial)
  const [error, setError] = useState<string>()
  const [fe, setFe] = useState<Record<string, string[]>>({})
  const [pending, setPending] = useState(false)

  const num = (k: "monthlyAmount" | "memberCount" | "graceDays") => (e: { target: { value: string } }) =>
    setF((x) => ({ ...x, [k]: e.target.value === "" ? NaN : Number(e.target.value) }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(undefined)
    setFe({})
    try {
      await onSubmit({ ...f, name: f.name.trim() })
    } catch (err) {
      const a = err instanceof ApiError ? err : null
      setError(a?.message ?? "Something went wrong. Please try again.")
      setFe(a?.fieldErrors ?? {})
    } finally {
      setPending(false)
    }
  }

  const valid = Number.isFinite(f.monthlyAmount) && Number.isFinite(f.memberCount)
  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormError message={error} />
      <Field label="Circle name" placeholder="Family Daret" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={fe.name?.[0]} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Monthly amount (MAD)" type="number" inputMode="numeric" min={100} max={10000} step={50} value={Number.isNaN(f.monthlyAmount) ? "" : f.monthlyAmount} onChange={num("monthlyAmount")} error={fe.monthlyAmount?.[0]} hint="Each member pays this every month. 100 to 10,000." />
        <Field label="Number of members" type="number" inputMode="numeric" min={3} max={12} value={Number.isNaN(f.memberCount) ? "" : f.memberCount} onChange={num("memberCount")} error={fe.memberCount?.[0]} hint="3 to 12, you included." />
        <Field label="First payment date" type="date" min={today()} value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} error={fe.startDate?.[0]} hint="Then the same day every month." />
        <SelectField label="Grace period" value={f.graceDays} onChange={(e) => setF({ ...f, graceDays: Number(e.target.value) })} hint="Days after the due date before the Safety Fund steps in.">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
            <option key={d} value={d}>
              {d === 0 ? "None" : `${d} day${d > 1 ? "s" : ""}`}
            </option>
          ))}
        </SelectField>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Who receives first?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((m) => (
            <label
              key={m.value}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 transition",
                f.orderMode === m.value ? "border-forest bg-forest/5 ring-1 ring-forest" : "border-ink/15 bg-white hover:border-ink/30",
              )}
            >
              <input type="radio" name="orderMode" className="sr-only" checked={f.orderMode === m.value} onChange={() => setF({ ...f, orderMode: m.value })} />
              <div className="font-semibold text-ink">{m.title}</div>
              <p className="mt-1 text-sm text-ink/60">{m.text}</p>
            </label>
          ))}
        </div>
      </fieldset>

      {valid && (
        <p className="rounded-2xl bg-sand-2/70 px-4 py-3 text-sm text-ink/75">
          Everyone pays <b>{mad(f.monthlyAmount)}</b> each month. One member receives the pot of{" "}
          <b>{mad(f.monthlyAmount * f.memberCount)}</b> each month, for <b>{f.memberCount}</b> months.
        </p>
      )}

      <div className="flex gap-3">
        <Btn type="submit" disabled={pending}>
          {pending ? "Please wait…" : submitLabel}
        </Btn>
        {onCancel && (
          <Btn type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Btn>
        )}
      </div>
    </form>
  )
}
