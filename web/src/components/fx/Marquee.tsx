import { useRef, type ReactNode } from "react"
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { cn } from "@/lib/utils"

/**
 * Infinite marquee that speeds up with scroll velocity
 * (the React Bits ScrollVelocity idea, on GSAP + ScrollTrigger).
 */
export function Marquee({
  children,
  reverse = false,
  duration = 40,
  className,
}: {
  children: ReactNode
  reverse?: boolean
  duration?: number
  className?: string
}) {
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!track.current || prefersReducedMotion()) return
      const tween = gsap.fromTo(
        track.current,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration, ease: "none", repeat: -1 },
      )
      ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 400, 6)
          gsap.killTweensOf(tween)
          gsap
            .timeline()
            .to(tween, { timeScale: 1 + boost, duration: 0.15 })
            .to(tween, { timeScale: 1, duration: 1.2 })
        },
      })
    },
    { scope: track },
  )

  return (
    <div className="overflow-hidden">
      <div
        ref={track}
        className={cn("flex w-max items-center whitespace-nowrap", className)}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
