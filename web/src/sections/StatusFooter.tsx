import { useRef } from "react"
import { ArrowUp } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { Magnet } from "@/components/fx/Magnet"
import { Zellige, Logo } from "@/components/fx/Zellige"
import { scrollToTarget } from "@/lib/lenis"
import { cn } from "@/lib/utils"

const status = [
  ["Software, circle rules, member record", "DigiDaret", "Prototype built", true],
  ["Holds the money, opens accounts, checks identity", "Licensed bank or payment institution", "Not signed", false],
  ["Backs the Safety Fund", "Partner-held reserve, then insurer or bank guarantee", "Not signed", false],
  ["Decides on any loan, sees the record only with consent", "Licensed lender", "Later phase", false],
] as const

export function StatusFooter() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-row]", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-rows]", start: "top 85%", once: true },
      })
      gsap.fromTo(
        "[data-giant]",
        { yPercent: 30, opacity: 0.3 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-giant]", start: "top bottom", end: "bottom bottom", scrub: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="grain relative overflow-hidden bg-ink text-sand">
      <Zellige id="z-foot" className="absolute inset-0 text-jade/[0.06] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-jade">Said plainly</p>
        <SplitReveal
          as="h2"
          onScroll
          text="Concept stage. And we say so."
          accent={["so."]}
          accentClass="italic text-saffron"
          className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] font-semibold leading-[1.02]"
        />
        <p className="mt-6 max-w-2xl text-lg text-sand/70">
          We are a student team with a working prototype. We have no licence, no signed partner
          and no signed insurer yet. A licensed institution would hold the money. We never would.
        </p>

        <div data-rows className="mt-12 overflow-hidden rounded-3xl border border-white/10">
          {status.map(([role, who, state, ok]) => (
            <div
              data-row
              key={role}
              className="grid items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1.2fr_auto] md:gap-6"
            >
              <span className="font-medium">{role}</span>
              <span className="text-sm text-sand/55">{who}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                  ok ? "bg-jade text-ink" : "bg-white/10 text-sand/70",
                )}
              >
                {state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* closing */}
      <div className="relative overflow-hidden border-t border-white/10 pb-10 pt-24 text-center">
        <div className="absolute left-1/2 top-1/2 -z-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest/40 blur-[140px]" />
        <div data-giant className="relative">
          <div className="font-display text-[clamp(3.5rem,15vw,13rem)] font-semibold leading-[0.9] tracking-tight">
            Same Daret.
            <br />
            <span className="italic text-saffron">Safer.</span>
          </div>
          <div className="mt-12">
            <Magnet>
              <button
                onClick={() => scrollToTarget(0)}
                className="inline-flex items-center gap-2 rounded-full bg-saffron px-7 py-4 font-semibold text-ink shadow-[0_10px_50px_rgba(242,169,59,.35)]"
              >
                Back to the top <ArrowUp className="size-4" />
              </button>
            </Magnet>
          </div>
        </div>

        <footer className="relative mx-auto mt-24 flex max-w-6xl flex-col gap-4 px-5 text-left text-xs text-sand/40 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-2 text-sand/70">
            <Logo className="size-6" />
            <span className="font-display text-lg font-semibold">DigiDaret</span>
          </div>
          <p className="max-w-2xl leading-relaxed">
            Concept stage. Licensed partner, fees and approvals are still to be confirmed. Starting
            in Morocco; each country has its own rules. Prototype screens use example data only.
            DigiDaret gives information, not financial or legal advice. HPS ImpactPay Africa
            Hackathon 2026.
          </p>
        </footer>
      </div>
    </section>
  )
}
