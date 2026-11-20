import { useRef, type ReactNode } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

/** Pulls its child toward the cursor (React Bits Magnet). */
export function Magnet({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !window.matchMedia("(pointer: fine)").matches) return
      const qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" })
      const qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" })
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        qx((e.clientX - (r.left + r.width / 2)) * strength)
        qy((e.clientY - (r.top + r.height / 2)) * strength)
      }
      const leave = () => {
        qx(0)
        qy(0)
      }
      el.addEventListener("mousemove", move)
      el.addEventListener("mouseleave", leave)
      return () => {
        el.removeEventListener("mousemove", move)
        el.removeEventListener("mouseleave", leave)
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  )
}
