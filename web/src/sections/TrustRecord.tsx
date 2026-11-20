import { useRef, useState } from "react"
import { Lock, Share2 } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { CountUp } from "@/components/fx/CountUp"
import { cn } from "@/lib/utils"

// 10 months of example history: 9 on time, 1 in the grace period (counts as late)
const months = ["on", "on", "on", "on", "grace", "on", "on", "on", "on", "on"] as const
const levels = [
  { l: "A", name: "Established", rule: "12+ months, a circle completed, 95%+ on time, no unrepaid shortfall" },
  { l: "B", name: "Reliable", rule: "6+ months, 90%+ on time, no unrepaid shortfall" },
  { l: "C", name: "Building", rule: "3+ months, 80%+ on time, no unrepaid shortfall" },
  { l: "D", name: "Review", rule: "A shortfall unrepaid after 30 days, or under 80% on time" },
  { l: "N", name: "Too early", rule: "Fewer than 3 months of history" },
]
const asks = [
  ["Is this person who they say?", "Checked by the licensed partner's own KYC."],
  ["Did the payment happen?", "Read from the partner's ledger, never self-reported."],
  ["Can we read the rule?", "Plain arithmetic on published cut-offs. No AI model."],
  ["Is it fair?", "Only payment behaviour counts. No age, gender, address or contacts."],
  ["Did the person agree?", "Per lender, per purpose, time-limited, revocable, logged."],
]

export function TrustRecord() {
  const root = useRef<HTMLElement>(null)
  const [shared, setShared] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-bar]", {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.9,
        ease: "back.out(1.6)",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-bars]", start: "top 85%", once: true },
      })
      gsap.from("[data-statement]", {
        opacity: 0,
        y: 70,
        rotate: 2,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-statement]", start: "top 85%", once: true },
      })
      gsap.from("[data-ask]", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-asks]", start: "top 85%", once: true },
      })
    },
    { scope: root },
  )

  const toggle = () => {
    const next = !shared
    setShared(next)
    gsap.fromTo(
      "[data-consent]",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    )
  }

  return (
    <section ref={root} id="trust" className="relative overflow-hidden bg-sand py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl items-start gap-16 px-5 sm:px-8 lg:grid-cols-2">
        {/* statement card */}
        <div data-statement className="lg:sticky lg:top-28">
          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-[0_30px_80px_rgba(11,26,22,.12)] sm:p-8">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink/40">
              <span>Trust Statement</span>
              <span className="rounded-full bg-sand-2 px-2.5 py-1 normal-case tracking-normal text-ink/60">
                Example data
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="relative flex size-28 items-center justify-center rounded-full bg-forest text-sand">
                <span className="font-display text-6xl font-semibold">B</span>
                <span className="absolute -bottom-2 rounded-full bg-saffron px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                  Reliable
                </span>
              </div>
              <dl className="grid flex-1 grid-cols-2 gap-y-3 text-sm">
                <div>
                  <dt className="text-ink/45">History</dt>
                  <dd className="font-display text-2xl font-semibold">
                    <CountUp to={10} /> months
                  </dd>
                </div>
                <div>
                  <dt className="text-ink/45">On time</dt>
                  <dd className="font-display text-2xl font-semibold">
                    <CountUp to={90} suffix="%" />
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-ink/45">Unrepaid shortfall</dt>
                  <dd className="font-medium">None</dd>
                </div>
              </dl>
            </div>

            <div data-bars className="mt-8 flex h-24 items-end gap-2">
              {months.map((m, i) => (
                <div
                  key={i}
                  data-bar
                  title={m === "on" ? "On time" : "Paid in grace period"}
                  className={cn("flex-1 rounded-t-md", m === "on" ? "h-full bg-jade" : "h-3/5 bg-saffron")}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-ink/40">
              <span>Month 1</span>
              <span className="flex gap-3">
                <span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-jade" />on time</span>
                <span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-saffron" />grace period</span>
              </span>
              <span>Month 10</span>
            </div>

            <div className="mt-8 rounded-2xl bg-sand p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {shared ? <Share2 className="size-5 text-forest" /> : <Lock className="size-5 text-ink/40" />}
                  <div>
                    <div className="font-medium">Share with a lender</div>
                    <div className="text-xs text-ink/50">Off by default. Your record, your call.</div>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={shared}
                  onClick={toggle}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    shared ? "bg-jade" : "bg-ink/20",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
                      shared ? "left-[1.4rem]" : "left-0.5",
                    )}
                  />
                </button>
              </div>
              <p data-consent className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink/60">
                {shared
                  ? "Shared with Example Lender · purpose: loan application · expires in 30 days · revoke anytime · logged."
                  : "Nothing is shared with anyone."}
              </p>
            </div>
          </div>
        </div>

        {/* copy */}
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-forest">The Trust Record</p>
          <SplitReveal
            as="h2"
            onScroll
            text="A history you own. A rule anyone can read."
            accent={["own."]}
            accentClass="italic text-forest"
            className="font-display text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[1.02] text-ink"
          />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
            Years of on-time saving finally leave something a bank can read, built from facts it
            can verify, by rules it can read, with your consent. It carries a Reliability Level,
            and every lending decision stays with the lender.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 text-center text-sm">
            {["Facts", "Reliability Level", "Trust Statement"].map((t, i) => (
              <div key={t} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <div className="font-display text-2xl text-forest">{i + 1}</div>
                <div className="font-medium text-ink">{t}</div>
              </div>
            ))}
          </div>

          <h3 className="mb-4 mt-12 font-display text-2xl font-semibold text-ink">What a bank asks</h3>
          <ul data-asks className="divide-y divide-ink/10 border-y border-ink/10">
            {asks.map(([q, a]) => (
              <li data-ask key={q} className="grid gap-1 py-4 sm:grid-cols-[1fr_1.3fr] sm:gap-6">
                <span className="font-medium text-ink">{q}</span>
                <span className="text-ink/60">{a}</span>
              </li>
            ))}
          </ul>

          <h3 className="mb-4 mt-12 font-display text-2xl font-semibold text-ink">The Level, in plain arithmetic</h3>
          <ul className="space-y-2">
            {levels.map((x) => (
              <li
                key={x.l}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border px-4 py-3",
                  x.l === "B" ? "border-forest bg-forest text-sand" : "border-ink/10 bg-white/50 text-ink",
                )}
              >
                <span className="font-display w-8 text-3xl font-semibold">{x.l}</span>
                <span className="flex-1 text-sm">
                  <b className="font-semibold">{x.name}</b>
                  <span className={x.l === "B" ? "text-sand/75" : "text-ink/55"}> · {x.rule}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink/50">
            Proposed cut-offs, to be calibrated with a lender&apos;s data. We have no repayment data
            yet, so a shadow test with a lender comes first.
          </p>
        </div>
      </div>
    </section>
  )
}
