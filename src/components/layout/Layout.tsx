import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function Layout() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'INDEX', icon: LayoutDashboard, path: '/' },
    { name: 'PROJECTS', icon: Briefcase, path: '/projects' },
    { name: 'TEAM', icon: Users, path: '/team' },
  ];

  return (
    <div className="flex h-screen bg-[#fbfbfb] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar - Clean & Modern */}
      <aside className="w-64 flex-col hidden md:flex border-r border-gray-100 bg-white shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight leading-none text-black">SYNC-EAZY</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider mt-1">BY SAMAR KHAN</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  isActive
                    ? 'bg-black text-white shadow-md shadow-black/10'
                    : 'text-gray-400 hover:text-black hover:bg-gray-50'
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
            <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center text-white font-bold">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold">{profile?.displayName}</p>
              <p className="truncate text-[10px] text-gray-400 font-medium capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 bg-white/50 backdrop-blur-md border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              WORKSPACE ACTIVE // {profile?.role === 'admin' ? 'ADMIN ACCESS' : 'MEMBER ACCESS'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors">
                <AlertCircle size={20} className="text-gray-400" />
              </div>
              <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF5C00] rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
