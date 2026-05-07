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
    <div className="flex h-screen bg-[#F0F0F0] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar - Technical Grid Rail */}
      <aside className="w-64 flex-col hidden md:flex border-r-2 border-black bg-white">
        <div className="p-8 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-[#FF5C00] text-white">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-black tracking-tighter leading-none">SYNC-EAZY</span>
              <span className="font-mono text-[9px] font-bold text-gray-400 tracking-[0.2em] mt-1">BY SAMAR KHAN</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-6 py-4 font-mono text-xs font-bold tracking-widest transition-all border-2 border-transparent',
                  isActive
                    ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                    : 'text-gray-400 hover:text-black hover:border-black/10'
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t-2 border-black">
          <div className="flex items-center gap-4 bg-gray-50 p-4 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-10 w-10 bg-black flex items-center justify-center text-white font-mono font-bold">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-mono text-[10px] font-bold uppercase tracking-tight">{profile?.displayName}</p>
              <p className="truncate font-mono text-[9px] text-[#FF5C00] font-black uppercase tracking-widest">{profile?.role}</p>
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
        <header className="h-20 flex items-center justify-between px-10 bg-white border-b-2 border-black z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FF5C00] animate-pulse"></div>
            <h2 className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              SYSTEM READY // {profile?.role === 'admin' ? 'ROOT_ACCESS' : 'USER_SESSION'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200">
              <Clock size={12} className="text-gray-400" />
              <span className="font-mono text-[10px] font-bold text-gray-500">UT-08:00</span>
            </div>
            <div className="relative">
              <div className="p-2 border-2 border-black hover:bg-gray-100 cursor-pointer transition-colors">
                <AlertCircle size={20} />
              </div>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#FF5C00] border-2 border-white"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
