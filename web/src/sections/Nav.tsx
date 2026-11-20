import { useEffect, useState } from "react"
import { Logo } from "@/components/fx/Zellige"
import { scrollToTarget } from "@/lib/lenis"
import { cn } from "@/lib/utils"

const links = [
  { label: "How it works", href: "#how" },
  { label: "Safety Fund", href: "#safety" },
  { label: "Trust Record", href: "#trust" },
  { label: "Assistant", href: "#assistant" },
  { label: "Africa", href: "#africa" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={cn(
          "flex items-center gap-1 rounded-full border border-white/10 bg-ink/70 py-2 pl-4 pr-2 text-sand shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-500",
          scrolled ? "scale-[0.98] bg-ink/85" : "",
        )}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget(0)
          }}
          className="mr-2 flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <Logo />
          DigiDaret
        </a>
        <div className="hidden items-center md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(l.href)
              }}
              className="rounded-full px-3 py-1.5 text-sm text-sand/70 transition-colors hover:bg-white/10 hover:text-sand"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#safety"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget("#safety")
          }}
          className="ml-2 rounded-full bg-saffron px-4 py-1.5 text-sm font-semibold text-ink transition-transform hover:scale-105"
        >
          Try the demo
        </a>
      </nav>
    </header>
  )
}
