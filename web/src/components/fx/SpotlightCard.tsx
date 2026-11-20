import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Card with a cursor-following glow (React Bits SpotlightCard). */
export function SpotlightCard({
  children,
  className,
  glow = "rgba(25,165,138,.28)",
}: {
  children: ReactNode
  className?: string
  glow?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`)
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`)
      }}
      className={cn("group relative overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(380px circle at var(--mx,50%) var(--my,50%), ${glow}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
