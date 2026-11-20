import { useRef } from "react"
import { BadgeCheck, FileCheck2, HandCoins, Repeat, ShieldCheck, UsersRound } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { Zellige } from "@/components/fx/Zellige"

const steps = [
  {
    icon: UsersRound,
    title: "Create",
    body: "One member opens a circle, sets the name, the monthly amount and the number of members, then invites the others with a WhatsApp link.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "Every member is ID-verified. A licensed partner opens each account or wallet, and cash top-up stays possible.",
  },
  {
    icon: FileCheck2,
    title: "Agree",
    body: "Amount, dates, payout order and missed-payment rules are set upfront. Each member accepts them in the app before the circle starts.",
  },
  {
    icon: Repeat,
    title: "Pay",
    body: "The monthly contribution is debited automatically on the agreed date. Nobody chases anybody.",
  },
  {
    icon: HandCoins,
    title: "Receive",
    body: "The member whose turn it is receives the pot, in the order everyone agreed.",
  },
  {
    icon: BadgeCheck,
    title: "Build a record",
    body: "Every on-time payment is recorded. The record belongs to the member and is shared with a lender only with their consent.",
  },
]

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()

      mm.add("(min-width: 900px)", () => {
        const el = track.current!
        const dist = () => el.scrollWidth - window.innerWidth + 80
        gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              gsap.set("[data-progress]", { scaleX: self.progress })
            },
          },
        })
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((card) => {
          gsap.from(card.querySelector("[data-icon]"), {
            rotate: -25,
            scale: 0.6,
            opacity: 0,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: card,
              containerAnimation: gsap.getTweensOf(el)[0],
              start: "left 85%",
              toggleActions: "play none none reverse",
            },
          })
        })
      })

      mm.add("(max-width: 899px)", () => {
        gsap.from("[data-step]", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: track.current, start: "top 80%", once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="how"
      className="grain relative overflow-hidden bg-forest text-sand"
    >
      <Zellige id="z-how" className="absolute inset-0 text-white/[0.05]" />

      <div className="relative h-1 w-full bg-white/10 max-md:hidden">
        <div data-progress className="h-full origin-left scale-x-0 bg-saffron" />
      </div>

      <div className="relative flex flex-col justify-center py-20 md:min-h-svh md:py-0">
        <div
          ref={track}
          className="flex flex-col gap-6 px-5 sm:px-8 md:w-max md:flex-row md:items-stretch md:gap-8 md:px-[8vw]"
        >
          <div className="flex shrink-0 flex-col justify-center md:w-[34vw] md:pr-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-mint/70">
              How it works
            </p>
            <SplitReveal
              as="h2"
              onScroll
              text="Six steps. Same tradition."
              accent={["tradition."]}
              accentClass="italic text-saffron"
              className="font-display text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[1]"
            />
            <p className="mt-6 max-w-sm text-sand/70">
              Our demo circle, Family Daret: 5 members, 1,000 MAD each, a 5,000 MAD pot every
              month. Scroll to follow one circle from first invite to a record you own.
            </p>
          </div>

          {steps.map((s, i) => (
            <article
              data-step
              key={s.title}
              className="relative flex shrink-0 flex-col justify-between rounded-[2rem] border border-white/10 bg-ink/40 p-8 backdrop-blur-sm md:h-[26rem] md:w-[26rem]"
            >
              <span className="absolute right-7 top-6 font-display text-7xl font-semibold text-white/[0.07]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                data-icon
                className="flex size-14 items-center justify-center rounded-2xl bg-saffron text-ink"
              >
                <s.icon className="size-7" strokeWidth={1.7} />
              </div>
              <div className="mt-16 md:mt-0">
                <h3 className="font-display text-4xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-sand/70">{s.body}</p>
              </div>
            </article>
          ))}
          <div className="hidden w-[10vw] shrink-0 md:block" />
        </div>
      </div>
    </section>
  )
}
