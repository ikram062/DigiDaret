import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { useAuth } from "@/auth/context"
import { ApiError } from "@/lib/api"
import { AuthShell } from "./AuthShell"
import { Field, FormError, SubmitButton } from "./Field"

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/app"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(undefined)
    setFieldErrors({})
    try {
      await login(email, password)
      navigate(from, { replace: true })
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
      title="Welcome back"
      subtitle="Log in to your circles."
      footer={
        <>
          New to DigiDaret?{" "}
          <Link to="/signup" className="font-semibold text-forest hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email?.[0]}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
          required
        />
        <SubmitButton pending={pending}>Log in</SubmitButton>
      </form>
    </AuthShell>
  )
}
