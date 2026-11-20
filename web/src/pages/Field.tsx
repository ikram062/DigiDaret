import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const inputClass =
  "h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-jade/30 aria-[invalid=true]:border-terracotta"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, className, type, ...props }: Props) {
  const [shown, setShown] = useState(false)
  const isPassword = type === "password"
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          type={isPassword && shown ? "text" : type}
          aria-invalid={!!error}
          className={cn(inputClass, isPassword && "pr-11", className)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
          >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <span role="alert" className="mt-1.5 block text-sm text-terracotta">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink/45">{hint}</span>
      ) : null}
    </div>
  )
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <select {...props} className={cn(inputClass, "appearance-none")}>
        {children}
      </select>
      {hint && <span className="mt-1.5 block text-xs text-ink/45">{hint}</span>}
    </label>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-3.5 py-2.5 text-sm text-terracotta">
      {message}
    </div>
  )
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-xl bg-forest font-semibold text-sand transition hover:bg-ink disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  )
}
