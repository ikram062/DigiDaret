import { useRef } from "react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { cn } from "@/lib/utils"

/** Words light up one by one as you scroll (React Bits ScrollReveal). */
export function ScrollWords({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      const words = ref.current.querySelectorAll("[data-sw]")
      gsap.fromTo(
        words,
        { opacity: 0.14, filter: "blur(4px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      )
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={cn(className)} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-sw aria-hidden className="inline-block">
          {w}
          {" "}
        </span>
      ))}
    </p>
  )
}
