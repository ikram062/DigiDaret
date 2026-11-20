import type { ReactNode } from "react"
import { Link } from "react-router"
import { Logo, Zellige } from "@/components/fx/Zellige"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-svh bg-sand lg:grid-cols-[0.8fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-sand lg:flex lg:flex-col lg:justify-between">
        <Zellige id="z-auth" className="absolute inset-0 text-jade/[0.08]" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-forest/50 blur-[110px]" />
        <Link to="/" className="relative flex items-center gap-2 font-display text-xl font-semibold">
          <Logo className="size-8" /> DigiDaret
        </Link>
        <div className="relative">
          <p className="font-display text-5xl font-semibold leading-[1.02]">
            Same Daret.
            <br />
            <span className="italic text-saffron">Safer.</span>
          </p>
          <p className="mt-5 max-w-xs text-sand/60">
            The savings circle you already trust, with verified members, automatic payments and a
            record you own.
          </p>
        </div>
        <p className="relative text-xs text-sand/35">Concept stage · prototype</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="mb-10 flex items-center gap-2 font-display text-lg font-semibold text-ink lg:hidden">
          <Logo className="size-7" /> DigiDaret
        </Link>
        <div className="m-auto w-full max-w-sm">
          <h1 className="font-display text-4xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-ink/60">{footer}</p>
        </div>
      </main>
    </div>
  )
}
