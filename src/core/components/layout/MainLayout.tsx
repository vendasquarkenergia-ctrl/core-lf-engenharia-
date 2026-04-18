import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, KanbanSquare, ClipboardCheck, Wallet, UserCircle, Map } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { CommandMenu } from '../ui/CommandMenu';
import { SidebarNavigation } from './SidebarNavigation';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// LF OS MASTER NAV ITEMS
const NAV_ITEMS = [
  { path: '/master', label: 'Command Center', icon: LayoutDashboard, roles: ['ADMIN'] },
  { path: '/portfolio', label: 'Obras Pipeline', icon: KanbanSquare, roles: ['ADMIN'] },
  { path: '/timeline', label: 'RDO Master', icon: ClipboardCheck, roles: ['ADMIN', 'COLABORADOR'] },
  { path: '/dashboard', label: 'Caixa & Compras', icon: Wallet, roles: ['ADMIN'] },
  { path: '/implantacao', label: 'Implantação', icon: Map, roles: ['ADMIN', 'COLABORADOR'] },
  { path: '/profile', label: 'Perfil', icon: UserCircle, roles: ['ADMIN', 'COLABORADOR', 'CLIENTE'] },
];

export const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Force dark mode as default for LF OS Enterprise
    if (!document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-lf-bg text-lf-text font-geist flex flex-col md:flex-row selection:bg-lf-gold/30 selection:text-white transition-colors duration-300">
      <CommandMenu />
      
      {/* Extracted Desktop Sidebar */}
      <SidebarNavigation navItems={allowedNavItems} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative bg-lf-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel pb-safe z-50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center p-2 w-max min-w-full justify-around space-x-1">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/master' && location.pathname === '/');
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center w-[72px] h-14 transition-all shrink-0 rounded-xl",
                  isActive ? "text-lf-text" : "text-lf-muted hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-mobile-bg"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon size={20} className={cn("mb-1 transition-transform duration-300", isActive && "scale-110 text-lf-gold")} />
                  <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px]">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

