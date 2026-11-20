import { Navigate, Outlet, useLocation } from "react-router"
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
  if (user === undefined) return <Splash />
  if (user) return <Navigate to="/app" replace />
  return <Outlet />
}
