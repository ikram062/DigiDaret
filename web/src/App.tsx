import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AuthProvider } from "@/auth/AuthProvider"
import { GuestOnly, RequireAuth } from "@/auth/guards"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { AppLayout } from "@/app/AppLayout"
import { Overview } from "@/app/Overview"
import { Assistant, Circles, Payments, Record } from "@/app/Sections"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* everything under /app needs a valid session */}
          <Route path="/app" element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Overview />} />
              <Route path="circles" element={<Circles />} />
              <Route path="payments" element={<Payments />} />
              <Route path="record" element={<Record />} />
              <Route path="assistant" element={<Assistant />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
