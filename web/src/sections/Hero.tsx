import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"
import { Magnet } from "@/components/fx/Magnet"
import { Zellige } from "@/components/fx/Zellige"
import { scrollToTarget } from "@/lib/lenis"
import { HeroOrbit } from "./HeroOrbit"

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from("[data-fade]", {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.9,
      })
      gsap.from("[data-orbit]", { opacity: 0, scale: 0.85, duration: 1.4, ease: "expo.out", delay: 0.4 })
      gsap.to("[data-blob]", {
        x: "random(-60,60)",
        y: "random(-40,40)",
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 2,
      })
      // parallax as you leave the hero
      gsap.to("[data-parallax]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
      gsap.to("[data-arabic]", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="top"
      className="grain relative isolate flex min-h-svh items-center overflow-hidden bg-ink pb-16 pt-28 text-sand"
    >
      {/* backdrop */}
      <Zellige
        id="z-hero"
        className="absolute inset-0 -z-10 text-jade/[0.09] [mask-image:radial-gradient(ellipse_at_70%_45%,black,transparent_72%)]"
      />
      <div data-blob className="absolute -left-32 top-10 -z-10 size-[420px] rounded-full bg-forest/50 blur-[120px]" />
      <div data-blob className="absolute -right-20 bottom-0 -z-10 size-[360px] rounded-full bg-saffron/15 blur-[120px]" />
      <div
        data-arabic
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 select-none font-arabic text-[34vw] font-bold leading-none text-white/[0.025]"
      >
        دارت
      </div>

      <div data-parallax className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div
            data-fade
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-sand/70 backdrop-blur"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-jade" />
            Built in Morocco, made for Africa
          </div>

          <h1 className="font-display text-[clamp(3.2rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-tight">
            <SplitReveal text="Same Daret." delay={0.2} />
            <SplitReveal
              text="Safer."
              delay={0.55}
              className="italic text-saffron"
            />
          </h1>

          <p data-fade className="mt-7 max-w-xl text-lg leading-relaxed text-sand/70">
            Keep the savings circle you already trust. DigiDaret adds verified members,
            automatic payments, a shared Safety Fund and a payment record you own, so one
            missed payment no longer breaks the group.
          </p>

          <div data-fade className="mt-9 flex flex-wrap items-center gap-4">
            <Magnet>
              <button
                onClick={() => scrollToTarget("#safety")}
                className="group flex items-center gap-2 rounded-full bg-saffron px-6 py-3.5 font-semibold text-ink shadow-[0_10px_40px_rgba(242,169,59,.3)] transition-transform hover:scale-[1.03]"
              >
                See a missed payment, covered
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnet>
            <button
              onClick={() => scrollToTarget("#how")}
              className="rounded-full border border-white/15 px-6 py-3.5 font-medium text-sand transition-colors hover:bg-white/10"
            >
              How it works
            </button>
          </div>

          <dl data-fade className="mt-12 flex gap-8 border-t border-white/10 pt-6 text-sm">
            {[
              ["5", "members"],
              ["1,000 MAD", "each, every month"],
              ["5,000 MAD", "pot, in turn"],
            ].map(([a, b]) => (
              <div key={b}>
                <dt className="font-display text-2xl font-semibold text-sand">{a}</dt>
                <dd className="text-sand/50">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-orbit>
          <HeroOrbit />
        </div>
      </div>
    </section>
  )
}
