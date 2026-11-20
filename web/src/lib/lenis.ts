import Lenis from "lenis"
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap"

let instance: Lenis | null = null

export const getLenis = () => instance

export function scrollToTarget(target: string | number) {
  if (instance) instance.scrollTo(target, { offset: -20, duration: 1.4 })
  else if (typeof target === "string")
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" })
  else window.scrollTo({ top: target, behavior: "smooth" })
}

/** Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function initLenis() {
  if (prefersReducedMotion()) return () => {}
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 })
  instance = lenis
  lenis.on("scroll", ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
    instance = null
  }
}
