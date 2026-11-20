import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { useAuth } from "@/auth/context"
import { ApiError, languageLabel, type Language } from "@/lib/api"
import { safeNext } from "@/lib/next"
import { AuthShell } from "./AuthShell"
import { Field, FormError, SelectField, SubmitButton } from "./Field"

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const nextParam = safeNext(useSearchParams()[0].get("next"))
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    preferredLanguage: "ENGLISH" as Language,
  })
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [pending, setPending] = useState(false)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(undefined)
    setFieldErrors({})
    try {
      await signup(form)
      navigate(nextParam ?? "/app", { replace: true })
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null
      setError(apiErr?.message ?? "Something went wrong. Please try again.")
      setFieldErrors(apiErr?.fieldErrors ?? {})
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join a circle, or start your own."
      footer={
        <>
          Already have an account?{" "}
          <Link to={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"} className="font-semibold text-forest hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={set("fullName")}
          error={fieldErrors.fullName?.[0]}
          required
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          error={fieldErrors.email?.[0]}
          required
        />
        <Field
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="+212 6 12 34 56 78"
          value={form.phone}
          onChange={set("phone")}
          error={fieldErrors.phone?.[0]}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={fieldErrors.password?.[0]}
          hint="At least 8 characters, with a letter and a number."
          required
        />
        <SelectField
          label="Assistant language"
          value={form.preferredLanguage}
          onChange={set("preferredLanguage")}
          hint="The language the assistant explains your circle's rules in. You can change it later."
        >
          {(Object.keys(languageLabel) as Language[]).map((l) => (
            <option key={l} value={l}>
              {languageLabel[l]}
            </option>
          ))}
        </SelectField>
        <SubmitButton pending={pending}>Create account</SubmitButton>
        <p className="text-center text-xs text-ink/45">
          Your identity is checked later by a licensed partner, not by DigiDaret.
        </p>
      </form>
    </AuthShell>
  )
}
