import { useRef } from "react"
import { BookOpen, ShieldAlert, UserX } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { ScrollWords } from "@/components/fx/ScrollWords"
import { SpotlightCard } from "@/components/fx/SpotlightCard"
import { CountUp } from "@/components/fx/CountUp"

const breaks = [
  {
    icon: UserX,
    title: "A missed payment",
    body: "If someone who already received the pot stops paying, the people still waiting lose. Nothing protects them.",
  },
  {
    icon: ShieldAlert,
    title: "Fake circles",
    body: "An organizer can collect contributions and disappear, because nobody checks identity or holds the money.",
  },
  {
    icon: BookOpen,
    title: "No record",
    body: "Years of on-time saving leave nothing a bank can read. These savers stay invisible to formal credit.",
  },
]

export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-break]", {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: "[data-breaks]", start: "top 80%", once: true },
      })
      gsap.from("[data-stat]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-stats]", start: "top 85%", once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative bg-sand py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-forest">
          The problem
        </p>
        <ScrollWords
          className="font-display text-[clamp(2rem,5.2vw,4.4rem)] font-medium leading-[1.08] tracking-tight text-ink"
          text="A Daret works until one person stops paying. Then the whole group carries the loss. No contract. No interest. Only trust."
        />

        <div data-breaks className="mt-20 grid gap-5 md:grid-cols-3">
          {breaks.map((b) => (
            <div data-break key={b.title}>
              <SpotlightCard
                glow="rgba(212,83,58,.18)"
                className="h-full rounded-3xl border border-ink/10 bg-white/50 p-7 backdrop-blur"
              >
                <b.icon className="mb-6 size-8 text-terracotta" strokeWidth={1.5} />
                <h3 className="font-display text-2xl font-semibold text-ink">{b.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/65">{b.body}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>

        <div
          data-stats
          className="mt-20 grid gap-10 border-t border-ink/10 pt-14 md:grid-cols-3"
        >
          <div data-stat>
            <div className="font-display text-7xl font-semibold text-forest">
              <CountUp to={53} suffix="%" />
            </div>
            <p className="mt-2 text-ink/70">of Moroccan adults are financially excluded.</p>
            <p className="mt-1 text-xs text-ink/40">North Africa Post</p>
          </div>
          <div data-stat>
            <div className="font-display text-7xl font-semibold text-forest">
              <CountUp to={35} suffix="%" />
              <span className="mx-2 text-3xl text-ink/30">vs</span>
              <CountUp to={55} suffix="%" />
            </div>
            <p className="mt-2 text-ink/70">
              of Moroccan women versus men had an account in 2024.
            </p>
            <p className="mt-1 text-xs text-ink/40">Findex 2024, via a CGAP-commissioned deck</p>
          </div>
          <div data-stat>
            <div className="font-display text-7xl font-semibold text-forest">
              <CountUp to={122} prefix=">" />
              <span className="text-3xl"> bn</span>
            </div>
            <p className="mt-2 text-ink/70">MAD sent home by Moroccans abroad in 2025.</p>
            <p className="mt-1 text-xs text-ink/40">Office des changes, via Hespress</p>
          </div>
        </div>
      </div>
    </section>
  )
}
