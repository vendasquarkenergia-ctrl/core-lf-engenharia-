import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, Search, Moon, Sun } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useAuth } from '../../auth/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SidebarNavigation({ navItems }: { navItems: any[] }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  if (!user) return null;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-lf-surface border-r border-lf-border p-4 sticky top-0 h-screen z-40 transition-colors duration-300">
      
      {/* LF Brand Logo Original */}
      <div className="flex items-center gap-3 mb-8 px-2 mt-2 w-full">
        <img src="/logo.jpeg" alt="LF Soluções em Engenharia" className="w-full max-w-[180px] h-auto object-contain rounded-md" />
      </div>

      {/* Global Search Cmd+K Trigger */}
      <div className="px-2 mb-6 cursor-pointer" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', metaKey: true}))}>
        <div className="bg-lf-bg border border-lf-border hover:border-lf-gold/50 rounded-md px-3 py-2.5 flex items-center justify-between transition-colors text-lf-muted group">
          <div className="flex items-center gap-2">
            <Search size={16} className="group-hover:text-lf-gold transition-colors" />
            <span className="text-sm font-medium">Busca global...</span>
          </div>
          <span className="text-[10px] font-mono border border-lf-border bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-lf-muted">⌘K</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/timeline' && location.pathname === '/');
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 relative overflow-hidden group",
                isActive 
                  ? "text-lf-gold font-semibold" 
                  : "text-lf-muted hover:text-lf-text hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-lf-gold/10 border-l-2 border-lf-gold rounded-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <Icon size={18} className={cn("transition-transform duration-200", isActive ? "" : "group-hover:scale-110")} />
                <span className="text-sm">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-lf-border shrink-0 flex flex-col gap-2">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-2.5 w-full text-left rounded-md text-lf-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-lf-text transition-colors group"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
          </div>
          <div className="w-8 h-4 rounded-full bg-lf-bg border border-lf-border relative transition-colors">
            <div className={cn(
              "absolute top-0.5 w-3 h-3 rounded-full bg-lf-muted transition-transform duration-300",
              isDark ? "left-4 bg-lf-gold" : "left-0.5 bg-slate-500"
            )} />
          </div>
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center justify-between px-2 mb-2 mt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-md bg-lf-bg object-cover border border-lf-border flex items-center justify-center overflow-hidden shrink-0">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-lf-text transition-colors">{user.name}</p>
              <p className="text-[10px] font-inter text-lf-muted truncate uppercase tracking-wider transition-colors">{user.role}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-md text-lf-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
