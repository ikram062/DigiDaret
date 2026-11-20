import { Navigate, Outlet, useLocation, useSearchParams } from "react-router"
import { safeNext } from "@/lib/next"
import { useAuth } from "./context"

function Splash() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-sand">
      <div className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
    </div>
  )
}

/** Only logged-in users get through. Everyone else is sent to the login page. */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (user === undefined) return <Splash />
  if (user === null) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Login and signup pages: logged-in users are sent straight to the app. */
export function GuestOnly() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const from = (useLocation().state as { from?: string } | null)?.from
  if (user === undefined) return <Splash />
  // As soon as login or signup succeeds this runs, so it must honour "go back to where you were"
  if (user) return <Navigate to={safeNext(params.get("next")) ?? safeNext(from) ?? "/app"} replace />
  return <Outlet />
}
