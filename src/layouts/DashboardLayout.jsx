import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  Wrench,
  CreditCard,
  BarChart3,
  Smartphone,
  X,
} from 'lucide-react'
import { useMeQuery, useLogoutMutation } from '../services/api/authApi'
import { baseApi } from '../services/api/baseApi'
import { setAccessToken } from '../lib/authToken'
import { useGetNotificationsQuery } from '../services/api/notificationsApi'
import { Button } from '../components/ui/button'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setSidebarOpen, toggleSidebar } from '../features/ui/uiSlice'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/devices', label: 'Devices', icon: Smartphone },
  { to: '/repair-tickets', label: 'Repairs', icon: ClipboardList },
  { to: '/technicians', label: 'Technicians', icon: Wrench },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const techLinks = [
  { to: '/technician', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/technician/repairs', label: 'Assigned Repairs', icon: ClipboardList },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: Settings },
]

export default function DashboardLayout() {
  const { data } = useMeQuery()
  const user = data?.data
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.ui.sidebarOpen)
  const { data: notifData } = useGetNotificationsQuery()
  const unread = notifData?.data?.unreadCount || 0
  const links = user?.role === 'TECHNICIAN' ? techLinks : adminLinks

  const onLogout = async () => {
    try {
      await logout().unwrap()
      toast.success('Logged out')
    } catch {
      // Session may already be gone; still leave this shop's cached data behind.
    } finally {
      setAccessToken(null)
      dispatch(baseApi.util.resetApiState())
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {open ? (
        <button
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-label="Close menu overlay"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[260px] border-r border-line bg-ink-950 text-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <div className="font-display text-xl font-bold tracking-tight">FixFlow</div>
            <div className="text-xs text-white/60">{user?.shop?.name || 'Repair OS'}</div>
          </div>
          <button className="lg:hidden" onClick={() => dispatch(setSidebarOpen(false))}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => dispatch(setSidebarOpen(false))}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-brand-600 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unread > 0 ? (
                <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-ink-950">
                  {unread}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-panel/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => dispatch(toggleSidebar())}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden text-sm text-ink-500 sm:block">Repair shop operations, centralized.</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-lg p-2 hover:bg-brand-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </button>
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-ink-500">{user?.role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
