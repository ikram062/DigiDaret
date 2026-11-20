import { useRef } from "react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"

const members = [
  { name: "Yasmine", color: "#19a58a" },
  { name: "Omar", color: "#f2a93b" },
  { name: "Salma", color: "#3b4fd8" },
  { name: "Karim", color: "#d4533a" },
  { name: "Aya", color: "#bfe8d6" },
]
const R = 40 // orbit radius, % of the container
const pos = (i: number) => {
  const a = (-90 + i * 72) * (Math.PI / 180)
  return { left: 50 + R * Math.cos(a), top: 50 + R * Math.sin(a) }
}
const RING = 2 * Math.PI * 62

/** The circle in motion: five members drop 1,000 MAD each into the pot, which then pays out. */
export function HeroOrbit() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const amount = q("[data-amount]")[0] as HTMLElement
      const ring = q("[data-ring]")[0] as unknown as SVGCircleElement
      const payout = q("[data-payout]")[0] as HTMLElement
      const spin = q("[data-spin]")

      if (prefersReducedMotion()) {
        amount.textContent = "5,000"
        ring.style.strokeDashoffset = "0"
        return
      }

      gsap.to(spin, { rotate: 360, duration: 60, repeat: -1, ease: "none" })
      gsap.to(q("[data-avatar]"), {
        y: -8,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.35, from: "random" },
      })

      const state = { v: 0 }
      const render = () => {
        amount.textContent = Math.round(state.v).toLocaleString("en-US")
        ring.style.strokeDashoffset = String(RING * (1 - state.v / 5000))
      }
      gsap.set(q("[data-coin]"), { opacity: 0, xPercent: -50, yPercent: -50 })
      gsap.set(payout, { opacity: 0, y: 10 })

      const tl = gsap.timeline({ repeat: -1, delay: 1.4 })
      members.forEach((_, i) => {
        const coin = q(`[data-coin="${i}"]`)
        const p = pos(i)
        const t = i * 0.75
        tl.fromTo(
          coin,
          { left: `${p.left}%`, top: `${p.top}%`, opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.2 },
          t,
        )
          .to(coin, { left: "50%", top: "50%", duration: 0.7, ease: "power3.in" }, t + 0.1)
          .to(coin, { opacity: 0, scale: 0.3, duration: 0.15 }, t + 0.75)
          .to(state, { v: (i + 1) * 1000, duration: 0.3, ease: "none", onUpdate: render }, t + 0.7)
          .fromTo(
            q(`[data-avatar-ring="${i}"]`),
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1.15, duration: 0.25, yoyo: true, repeat: 1 },
            t,
          )
      })
      const end = members.length * 0.75 + 0.6
      tl.to(q("[data-pot]"), { scale: 1.07, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, end)
        .to(payout, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, end)
        .to(q("[data-winner]"), { opacity: 1, scale: 1.2, duration: 0.4, yoyo: true, repeat: 1 }, end)
        .to(payout, { opacity: 0, duration: 0.4 }, end + 2.2)
        .to(state, { v: 0, duration: 0.6, ease: "power2.inOut", onUpdate: render }, end + 2.2)
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative mx-auto aspect-square w-[min(92vw,540px)]">
      {/* orbit rings */}
      <div data-spin className="absolute inset-[6%] rounded-full border border-dashed border-jade/40" />
      <div className="absolute inset-[22%] rounded-full border border-white/10" />
      <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(25,165,138,.25),transparent_65%)] blur-2xl" />

      {/* pot */}
      <div
        data-pot
        className="absolute left-1/2 top-1/2 flex size-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-2/90 shadow-[0_0_80px_rgba(25,165,138,.35)] ring-1 ring-white/10"
      >
        <svg viewBox="0 0 140 140" className="absolute inset-0 size-full -rotate-90">
          <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
          <circle
            data-ring
            cx="70"
            cy="70"
            r="62"
            fill="none"
            stroke="#f2a93b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * 0.0}
          />
        </svg>
        <div className="text-center text-sand">
          <div className="text-[10px] uppercase tracking-[0.2em] text-sand/50">Family Daret</div>
          <div className="font-display text-3xl font-semibold leading-none sm:text-4xl">
            <span data-amount>5,000</span>
          </div>
          <div className="mt-1 text-[11px] text-saffron">MAD this month</div>
        </div>
      </div>

      {/* payout pill */}
      <div
        data-payout
        className="absolute left-1/2 top-[82%] -translate-x-1/2 whitespace-nowrap rounded-full bg-saffron px-4 py-1.5 text-xs font-semibold text-ink shadow-lg"
      >
        Pot paid out to Salma
      </div>

      {/* members + coins */}
      {members.map((m, i) => {
        const p = pos(i)
        return (
          <div key={m.name}>
            <div
              data-avatar
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
            >
              <div
                data-avatar-ring={i}
                {...(m.name === "Salma" ? { "data-winner": true } : {})}
                className="absolute -inset-2 rounded-full border-2 border-saffron opacity-0"
              />
              <div
                className="flex size-14 items-center justify-center rounded-full font-display text-lg font-semibold text-ink shadow-xl ring-2 ring-ink sm:size-16"
                style={{ background: m.color }}
              >
                {m.name[0]}
              </div>
              <div className="mt-1.5 text-center text-[11px] font-medium text-sand/70">{m.name}</div>
            </div>
            <div
              data-coin={i}
              className="absolute z-10 flex size-7 items-center justify-center rounded-full bg-saffron text-[8px] font-bold text-ink shadow-[0_0_20px_rgba(242,169,59,.8)]"
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
            >
              1k
            </div>
          </div>
        )
      })}
    </div>
  )
}
