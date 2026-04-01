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
    <aside className="h-full w-72 bg-slate-950/60 border-r border-slate-800 px-4 py-5 flex flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
        <div className="leading-tight">
          <div className="text-slate-100 font-semibold">Gym Admin</div>
          <div className="text-xs text-slate-400">{username ?? 'Admin'}</div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-slate-50',
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
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-slate-50 transition"
      >
        {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <button
        onClick={() => dispatch(logout())}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-slate-50 transition"
      >
        <FiLogOut className="text-lg" />
        Logout
      </button>
    </aside>
  )
}

