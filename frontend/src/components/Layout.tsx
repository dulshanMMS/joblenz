import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BriefcaseIcon,
  PlusCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard', label: 'Jobs', icon: BriefcaseIcon },
  { to: '/jobs/new', label: 'New Job', icon: PlusCircleIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 px-4 py-6">
        {/* Logo */}
        <div className="mb-8 px-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Job<span className="text-violet-400">Lenz</span>
          </span>
          <p className="mt-0.5 text-xs text-slate-500 font-mono">
            service manager
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-400 font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-slate-800 pt-4 mt-4">
          <p className="px-3 text-xs text-slate-500 truncate font-mono">
            {user?.email}
          </p>
          <p className="px-3 text-sm text-slate-300 truncate mb-2">
            {user?.name}
          </p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
