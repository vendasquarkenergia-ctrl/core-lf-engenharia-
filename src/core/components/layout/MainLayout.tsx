import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, CheckSquare, Settings, User as UserIcon, LogOut, Activity, Users } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { CommandPalette } from '../ui/CommandPalette';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { path: '/master', label: 'Visão Geral', icon: Activity, roles: ['ADMIN'] },
  { path: '/timeline', label: 'Obras/RDO', icon: Home, roles: ['ADMIN', 'COLABORADOR', 'CLIENTE'] },
  { path: '/dashboard', label: 'Financeiro', icon: LayoutDashboard, roles: ['ADMIN'] },
  { path: '/users', label: 'Equipe', icon: Users, roles: ['ADMIN'] },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare, roles: ['ADMIN', 'COLABORADOR'] },
  { path: '/profile', label: 'Perfil', icon: UserIcon, roles: ['ADMIN', 'COLABORADOR', 'CLIENTE'] },
];

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] font-sans flex flex-col md:flex-row selection:bg-[#C19A42]/30">
      <CommandPalette />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#171717]/80 backdrop-blur-2xl border-r border-white/5 p-4 sticky top-0 h-screen z-40">
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="w-11 h-11 border-[3px] border-[#C19A42] flex items-center justify-center font-bold text-2xl text-[#C19A42] shrink-0 rounded-xl shadow-[0_0_15px_rgba(193,154,66,0.15)]">
            LF
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-xl leading-none tracking-tight text-white mb-1">LF</h1>
            <h2 className="font-semibold text-[10px] leading-none tracking-wide text-white/80 mb-0.5">SOLUÇÕES EM</h2>
            <h2 className="font-bold text-[11px] leading-none tracking-widest text-white/80">ENGENHARIA</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/timeline' && location.pathname === '/');
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group",
                  isActive
                    ? "text-[#C19A42] font-medium"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-[#C19A42]/10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon size={20} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full bg-black object-cover border border-white/10" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-0 relative bg-gradient-to-br from-[#0A0A0A] to-[#050505]">
        <div className="w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Glassmorphism + Safe Area) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#171717]/85 backdrop-blur-3xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center px-2 py-3">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/timeline' && location.pathname === '/');
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center w-[72px] h-[52px] rounded-2xl transition-all",
                  isActive ? "text-[#C19A42]" : "text-[#71717a] hover:text-[#a1a1aa]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-bg"
                    className="absolute inset-0 bg-gradient-to-b from-[#C19A42]/15 to-transparent rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon size={24} className={cn("mb-1 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_12px_rgba(193,154,66,0.6)]" : "scale-95")} />
                  <span className={cn("text-[10px] font-semibold transition-all duration-300", isActive ? "opacity-100" : "opacity-0 -translate-y-2 h-0")}>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
