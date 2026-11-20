import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AuthProvider } from "@/auth/AuthProvider"
import { GuestOnly, RequireAuth } from "@/auth/guards"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { AppLayout } from "@/app/AppLayout"
import { Overview } from "@/app/Overview"
import { Payments } from "@/app/Sections"
import { AssistantChat } from "@/app/AssistantChat"
import { Circles, CreateCircle } from "@/app/Circles"
import { CircleDetail } from "@/app/CircleDetail"
import { TrustRecord } from "@/app/TrustRecord"
import { JoinInvite } from "@/pages/JoinInvite"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join/:token" element={<JoinInvite />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* everything under /app needs a valid session */}
          <Route path="/app" element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Overview />} />
              <Route path="circles" element={<Circles />} />
              <Route path="circles/new" element={<CreateCircle />} />
              <Route path="circles/:id" element={<CircleDetail />} />
              <Route path="payments" element={<Payments />} />
              <Route path="record" element={<TrustRecord />} />
              <Route path="assistant" element={<AssistantChat />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
