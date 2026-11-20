import { useRef, type ElementType } from "react"
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { cn } from "@/lib/utils"

type Props = {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  /** classes applied to words listed in `accent` */
  accentClass?: string
  accent?: string[]
  delay?: number
  stagger?: number
  /** reveal when scrolled into view instead of on load */
  onScroll?: boolean
}

/** Word-by-word masked rise, in the spirit of React Bits SplitText. */
export function SplitReveal({
  text,
  as = "span",
  className,
  accentClass,
  accent = [],
  delay = 0,
  stagger = 0.07,
  onScroll = false,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      const words = ref.current.querySelectorAll("[data-w]")
      gsap.set(words, { yPercent: 115, rotate: 4 })
      const tween = gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger,
        delay,
        paused: onScroll,
      })
      if (onScroll)
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 90%",
          once: true,
          onEnter: () => {
            tween.play()
          },
        })
    },
    { scope: ref },
  )

  const words = text.split(" ")
  const Tag = as as ElementType
  return (
    <Tag ref={ref} className={cn("block", className)} aria-label={text}>
      {words.map((w, i) => (
      <span
        key={i}
        aria-hidden
        className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
      >
        <span
          data-w
          className={cn(
            "inline-block origin-bottom-left will-change-transform",
            accent.includes(w) && accentClass,
          )}
        >
          {w}
        </span>
        {i < words.length - 1 ? " " : ""}
      </span>
      ))}
    </Tag>
  )
}
