import { useEffect, useRef, useState } from "react"
import { Check, Clock, Play, RotateCcw, ShieldCheck } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { cn } from "@/lib/utils"

type Step = { log: string; pot: number }
const steps: Step[] = [
  { log: "Ready. Press play to run the month.", pot: 0 },
  { log: "Auto-debit runs on the due date. Four members pay. Omar's payment fails.", pot: 4000 },
  { log: "A reminder goes out and the debit is retried.", pot: 4000 },
  { log: "The grace period ends. Still unpaid.", pot: 4000 },
  { log: "The Safety Fund covers Omar's 1,000 MAD, up to the cap.", pot: 5000 },
  { log: "Salma, whose turn it is, receives the full 5,000 MAD pot.", pot: 5000 },
  { log: "Omar still owes 1,000 MAD. It is on his record, and he cannot join new circles until it is settled.", pot: 0 },
]

const members = [
  { name: "Yasmine", color: "#19a58a" },
  { name: "Omar", color: "#f2a93b" },
  { name: "Salma", color: "#3b4fd8" },
  { name: "Karim", color: "#d4533a" },
  { name: "Aya", color: "#bfe8d6" },
]

function chip(name: string, step: number) {
  const paid = { text: "Paid", cls: "bg-jade/20 text-mint" }
  if (name === "Omar") {
    if (step === 0) return { text: "Due", cls: "bg-white/10 text-sand/60" }
    if (step === 1) return { text: "Debit failed", cls: "bg-terracotta/25 text-terracotta" }
    if (step === 2) return { text: "Retrying", cls: "bg-saffron/20 text-saffron" }
    if (step === 3) return { text: "Unpaid", cls: "bg-terracotta/25 text-terracotta" }
    if (step === 4 || step === 5) return { text: "Covered by fund", cls: "bg-saffron/25 text-saffron" }
    return { text: "Owes 1,000 MAD", cls: "bg-terracotta text-sand" }
  }
  if (step === 0) return { text: "Due", cls: "bg-white/10 text-sand/60" }
  if (name === "Salma" && step >= 5)
    return { text: step === 5 ? "Receives 5,000 MAD" : "Received 5,000 MAD", cls: "bg-saffron text-ink" }
  return paid
}

export function SafetyDemo() {
  const root = useRef<HTMLElement>(null)
  const potRef = useRef<HTMLSpanElement>(null)
  const potVal = useRef({ v: 0 })
  const fundRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  // auto-advance while playing
  useEffect(() => {
    if (!playing || step >= steps.length - 1) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : 1900)
    return () => clearTimeout(t)
  }, [playing, step])

  // animate pot counter + fund meter on step change
  useEffect(() => {
    const target = steps[step].pot
    const dur = prefersReducedMotion() ? 0 : 0.8
    gsap.to(potVal.current, {
      v: target,
      duration: dur,
      ease: "power2.out",
      onUpdate: () => {
        if (potRef.current)
          potRef.current.textContent = Math.round(potVal.current.v).toLocaleString("en-US")
      },
    })
    if (fundRef.current)
      gsap.to(fundRef.current, {
        scaleX: step >= 4 ? 0.62 : 1,
        duration: dur,
        ease: "power3.inOut",
        transformOrigin: "left",
      })
  }, [step])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-card]", {
        opacity: 0,
        y: 80,
        rotateX: 8,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-card]", start: "top 85%", once: true },
      })
      gsap.from("[data-point]", {
        opacity: 0,
        x: -30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-points]", start: "top 85%", once: true },
      })
    },
    { scope: root },
  )

  const run = () => {
    setStep(0)
    setPlaying(true)
  }
  const done = step === steps.length - 1
  const running = playing && !done

  return (
    <section ref={root} id="safety" className="grain relative overflow-hidden bg-ink py-28 text-sand sm:py-36">
      <div className="absolute left-1/2 top-0 -z-0 size-[600px] -translate-x-1/2 rounded-full bg-forest/30 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-jade">The Safety Fund</p>
          <SplitReveal
            as="h2"
            onScroll
            text="If someone misses, the group still gets paid."
            accent={["paid."]}
            accentClass="italic text-saffron"
            className="font-display text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[1.02]"
          />
          <ul data-points className="mt-8 space-y-4 text-sand/75">
            {[
              "A reminder and a retry come first, then a short grace period.",
              "If it is still unpaid, the Safety Fund covers the gap up to a cap.",
              "The member whose turn it is still gets the full pot.",
              "The member who missed still owes it. It goes on their record.",
              "A civil matter handled by clear rules and records, not by the police.",
            ].map((t) => (
              <li data-point key={t} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-jade" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-sand/60">
            For the pilot, the fund is a reserve held by a partner and funded by a sponsor, capped
            per circle, with insurance as the next step. Nothing is signed yet.
          </p>
        </div>

        {/* interactive card */}
        <div data-card className="[perspective:1200px]">
          <div className="rounded-[2rem] border border-white/10 bg-ink-2/80 p-5 shadow-[0_40px_120px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-sand/40">Family Daret · Month 3</div>
                <div className="mt-1 font-display text-5xl font-semibold">
                  <span ref={potRef}>0</span>
                  <span className="ml-2 text-base font-normal text-sand/50">/ 5,000 MAD</span>
                </div>
              </div>
              <button
                onClick={run}
                disabled={running}
                className="flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-ink transition hover:scale-105 disabled:opacity-60"
              >
                {done ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                {done ? "Replay" : running ? "Running" : "Run the month"}
              </button>
            </div>

            <ul className="mt-6 space-y-2">
              {members.map((m) => {
                const c = chip(m.name, step)
                return (
                  <li
                    key={m.name}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-3 py-2.5 transition-colors",
                      m.name === "Omar" && step >= 3 && "border-terracotta/30",
                    )}
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-full font-display font-semibold text-ink"
                      style={{ background: m.color }}
                    >
                      {m.name[0]}
                    </span>
                    <span className="flex-1 font-medium">{m.name}</span>
                    <span className="hidden text-sm text-sand/40 sm:block">1,000 MAD</span>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", c.cls)}>
                      {c.text}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-sand/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-saffron" /> Safety Fund (pilot reserve, capped)
                </span>
                <span className={cn("transition-opacity", step >= 4 ? "text-saffron opacity-100" : "opacity-0")}>
                  draws 1,000 MAD
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div ref={fundRef} className="h-full origin-left rounded-full bg-gradient-to-r from-jade to-saffron" />
              </div>
            </div>

            <div className="mt-5 flex min-h-[3.5rem] items-start gap-3 text-sm text-sand/80" aria-live="polite">
              <Clock className="mt-0.5 size-4 shrink-0 text-jade" />
              <p key={step} className="animate-[fadein_.5s_ease]">
                {steps[step].log}
              </p>
            </div>
            <div className="mt-3 flex gap-1.5">
              {steps.slice(1).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-500",
                    i < step ? "bg-jade" : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <p className="mt-4 text-[11px] text-sand/30">Prototype · example data</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </section>
  )
}
