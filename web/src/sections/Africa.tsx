import { useRef } from "react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { SpotlightCard } from "@/components/fx/SpotlightCard"
import { CountUp } from "@/components/fx/CountUp"

const names = [
  ["Daret", "Morocco"],
  ["Gameya", "Egypt, North Africa"],
  ["Sanduq", "Sudan"],
  ["Tontine", "Francophone & West Africa"],
  ["Susu", "Ghana, West Africa"],
  ["Esusu · Ajo", "Nigeria"],
  ["Njangi", "Cameroon"],
  ["Chama", "Kenya, East Africa"],
  ["Upatu", "Tanzania"],
  ["Equb", "Ethiopia"],
  ["Hagbad", "Somalia"],
  ["Stokvel", "South Africa"],
  ["Mukando", "Zimbabwe"],
  ["Xitique", "Mozambique"],
]

const path = [
  ["1", "Morocco", "Pilot circles among friends, colleagues and the university, with a licensed partner."],
  ["2", "North Africa & Egypt", "Arabic and Darija already fit. Competition is strongest here."],
  ["3", "Francophone Africa", "The Tontine, with French already in the assistant."],
  ["4", "English-speaking Africa", "Susu, Esusu, Chama and Stokvel, with local partners."],
]

export function Africa() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-name]", {
        opacity: 0,
        y: 40,
        scale: 0.94,
        duration: 0.8,
        ease: "power3.out",
        stagger: { each: 0.05, from: "start" },
        scrollTrigger: { trigger: "[data-names]", start: "top 82%", once: true },
      })
      gsap.from("[data-path]", {
        opacity: 0,
        x: -40,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-paths]", start: "top 82%", once: true },
      })
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: "[data-paths]", start: "top 70%", end: "bottom 60%", scrub: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="africa" className="relative overflow-hidden bg-sand-2 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-forest">Why Africa</p>
        <SplitReveal
          as="h2"
          onScroll
          text="Built in Morocco. Made for Africa."
          accent={["Africa."]}
          accentClass="italic text-forest"
          className="max-w-4xl font-display text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[1] text-ink"
        />
        <p className="mt-6 max-w-2xl text-lg text-ink/70">
          The Daret is not a Moroccan curiosity. The same circle runs under local names across
          the continent, so DigiDaret starts at home and is designed to travel.
        </p>

        <div className="mt-12 grid gap-8 border-y border-ink/10 py-10 sm:grid-cols-2">
          <div>
            <div className="font-display text-6xl font-semibold text-forest">
              <CountUp to={800} suffix="k+" />
            </div>
            <p className="mt-2 text-ink/70">
              stokvels in South Africa, moving about ZAR 50 billion a year across roughly 11
              million members.
            </p>
            <p className="mt-1 text-xs text-ink/40">WeeTracker</p>
          </div>
          <div>
            <div className="font-display text-6xl font-semibold text-forest">
              50<span className="text-3xl text-ink/30"> to </span>95%
            </div>
            <p className="mt-2 text-ink/70">
              of adults join savings groups like these in many African countries.
            </p>
            <p className="mt-1 text-xs text-ink/40">Encyclopedia.com</p>
          </div>
        </div>

        <div data-names className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {names.map(([n, where]) => (
            <div data-name key={n}>
              <SpotlightCard
                glow="rgba(15,92,77,.18)"
                className="h-full rounded-2xl border border-ink/10 bg-white/60 p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="font-display text-2xl font-semibold text-ink">{n}</div>
                <div className="mt-1 text-sm text-ink/55">{where}</div>
              </SpotlightCard>
            </div>
          ))}
        </div>

        <h3 className="mb-8 mt-24 font-display text-3xl font-semibold text-ink">
          A possible path <span className="text-base font-normal text-ink/50">(our reasoning, to validate)</span>
        </h3>
        <div data-paths className="relative max-w-3xl pl-10">
          <div className="absolute bottom-2 left-[13px] top-2 w-px bg-ink/10" />
          <div data-line className="absolute bottom-2 left-[13px] top-2 w-px bg-forest" />
          {path.map(([n, t, d]) => (
            <div data-path key={n} className="relative pb-9 last:pb-0">
              <span className="absolute -left-10 top-0 flex size-7 items-center justify-center rounded-full bg-forest text-sm font-semibold text-sand">
                {n}
              </span>
              <div className="font-display text-2xl font-semibold text-ink">{t}</div>
              <p className="mt-1 text-ink/65">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink/50">
          Each country has its own rules and partners. We claim no operations or licences outside
          Morocco.
        </p>
      </div>
    </section>
  )
}
