import { NavLink, Link, Outlet, useNavigate } from "react-router"
import { BadgeCheck, Bot, LayoutDashboard, LogOut, UsersRound, Wallet } from "lucide-react"
import { useAuth } from "@/auth/context"
import { Logo } from "@/components/fx/Zellige"
import { cn } from "@/lib/utils"

const menu = [
  { to: "/app", label: "Overview", short: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/circles", label: "My circles", short: "Circles", icon: UsersRound },
  { to: "/app/payments", label: "Payments", short: "Payments", icon: Wallet },
  { to: "/app/record", label: "Trust Record", short: "Record", icon: BadgeCheck },
  { to: "/app/assistant", label: "AI assistant", short: "Assistant", icon: Bot },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const onLogout = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-svh bg-sand lg:grid lg:grid-cols-[16rem_1fr]">
      {/* sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-svh flex-col bg-ink p-5 text-sand lg:flex">
        <Link to="/app" className="mb-8 flex items-center gap-2 px-2 font-display text-xl font-semibold">
          <Logo className="size-7" /> DigiDaret
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-white/10 text-saffron" : "text-sand/65 hover:bg-white/5 hover:text-sand",
                )
              }
            >
              <m.icon className="size-[18px]" strokeWidth={1.8} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display font-semibold text-ink">
              {user.fullName[0]}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.fullName}</div>
              <div className="truncate text-xs text-sand/45">{user.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sand/65 transition-colors hover:bg-white/5 hover:text-sand"
          >
            <LogOut className="size-[18px]" strokeWidth={1.8} /> Log out
          </button>
        </div>
      </aside>

      {/* top bar (mobile) */}
      <header className="flex items-center justify-between bg-ink px-5 py-3 text-sand lg:hidden">
        <Link to="/app" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Logo className="size-6" /> DigiDaret
        </Link>
        <button onClick={onLogout} aria-label="Log out" className="rounded-lg p-2 text-sand/70 hover:bg-white/10">
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="px-5 pb-28 pt-8 sm:px-10 lg:pb-10 lg:pt-12">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>

      {/* tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-ink px-2 py-2 lg:hidden">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium",
                isActive ? "text-saffron" : "text-sand/55",
              )
            }
          >
            <m.icon className="size-5" strokeWidth={1.8} />
            {m.short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
