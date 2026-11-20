import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-sm text-ink/50">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-3xl border border-ink/10 bg-white/60 p-5 sm:p-6", className)}>{children}</section>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 font-display text-xl font-semibold text-ink">{children}</h2>
}

const tones = {
  green: "bg-jade/15 text-forest",
  amber: "bg-saffron/25 text-[#8a5a06]",
  red: "bg-terracotta/15 text-terracotta",
  grey: "bg-ink/10 text-ink/60",
  dark: "bg-ink text-sand",
}

export function Chip({ tone = "grey", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "accent" }

export function Btn({ variant = "primary", className, ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-forest text-sand hover:bg-ink",
        variant === "accent" && "bg-saffron text-ink hover:brightness-95",
        variant === "secondary" && "border border-ink/15 bg-white text-ink hover:bg-sand-2",
        variant === "danger" && "border border-terracotta/30 bg-white text-terracotta hover:bg-terracotta/10",
        className,
      )}
    />
  )
}

export function Loading() {
  return (
    <div className="flex justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
      {message}
    </div>
  )
}
