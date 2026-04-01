import { NavLink } from 'react-router-dom'
import {
  FiBarChart2,
  FiUsers,
  FiCalendar,
  FiCreditCard,
  FiMinusCircle,
  FiFileText,
  FiLogOut,
  FiSun,
  FiMoon,
  FiShield,
} from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { toggleTheme } from '../features/ui/uiSlice'

const nav = [
  { to: '/', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/members', label: 'Members', icon: FiUsers },
  { to: '/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/payments', label: 'Payments', icon: FiCreditCard },
  { to: '/expenses', label: 'Expenses', icon: FiMinusCircle },
  { to: '/reports', label: 'Reports', icon: FiFileText },
] as const

export function Sidebar() {
  const dispatch = useAppDispatch()
  const username = useAppSelector((s) => s.auth.username)
  const theme = useAppSelector((s) => s.ui.theme)

  return (
    <aside className="h-screen w-72 bg-slate-950/85 backdrop-blur-xl border-r border-slate-800 px-4 py-5 flex flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <FiShield className="text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-slate-100 font-semibold">Gym Admin</div>
          <div className="text-xs text-slate-400">Owner: {username ?? 'Admin'}</div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        <div className="text-xs text-slate-400">Today</div>
        <div className="mt-1 text-sm font-medium text-slate-100">
          {new Date().toLocaleDateString('en-PK', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1.5">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                isActive
                  ? 'bg-slate-800 border border-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white',
              ].join(' ')
            }
          >
            <item.icon className="text-lg" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => dispatch(toggleTheme())}
        className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
      >
        {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <button
        onClick={() => dispatch(logout())}
        className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
      >
        <FiLogOut className="text-lg" />
        Logout
      </button>
    </aside>
  )
}

