import { useRef } from "react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  className,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (v: number) =>
    prefix +
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const o = { v: 0 }
      el.textContent = fmt(0)
      gsap.to(o, {
        v: to,
        duration,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = fmt(o.v)
        },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  )
}
