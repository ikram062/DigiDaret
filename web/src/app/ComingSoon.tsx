import type { ReactNode } from "react"
import { Check } from "lucide-react"

export function ComingSoon({
  eyebrow,
  title,
  intro,
  points,
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  points: string[]
  children?: ReactNode
}) {
  return (
    <div>
      <p className="text-sm text-ink/50">{eyebrow}</p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/65">{intro}</p>

      <div className="mt-8 rounded-3xl border border-dashed border-ink/20 bg-white/40 p-6 sm:p-8">
        <span className="rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-ink">Coming next</span>
        <ul className="mt-5 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex gap-3 text-ink/75">
              <Check className="mt-1 size-4 shrink-0 text-forest" /> {p}
            </li>
          ))}
        </ul>
        {children}
      </div>
    </div>
  )
}
