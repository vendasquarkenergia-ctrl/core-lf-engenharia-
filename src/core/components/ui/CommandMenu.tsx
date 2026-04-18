import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Monitor, Package, FileText, CheckSquare, Activity, Briefcase } from 'lucide-react';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const items = [
    { id: 1, name: 'Visão Geral (Master)', icon: Activity, path: '/master' },
    { id: 2, name: 'Acompanhamento (Timeline / RDO)', icon: Monitor, path: '/timeline' },
    { id: 3, name: 'Tarefas e Pendências', icon: CheckSquare, path: '/tasks' },
    { id: 4, name: 'Suprimentos e Compras', icon: Package, path: '/suprimentos' },
    { id: 5, name: 'Repositório de Projetos', icon: FileText, path: '/projetos' },
    { id: 6, name: 'Portfólio de Obras', icon: Briefcase, path: '/portfolio' },
  ];

  const filtered = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-0 m-auto mt-[15vh] w-full max-w-lg h-fit bg-[#171717] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[201]"
          >
            <div className="flex items-center px-4 border-b border-white/10">
              <Search className="w-5 h-5 text-[#C19A42] mr-3" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O que você procura? (Obras, Tarefas, Projetos...)"
                className="w-full bg-transparent border-none text-[#F5F5F7] h-14 outline-none placeholder:text-slate-500 font-medium"
              />
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <p className="p-6 text-center text-sm font-medium text-slate-500">Nenhum resultado encontrado.</p>
              ) : (
                filtered.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-left group"
                  >
                    <item.icon className="w-5 h-5 text-slate-500 group-hover:text-[#C19A42] transition-colors" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Navegação Rápida</span>
              <div className="flex gap-1.5">
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white shadow-sm border border-white/10">ESC</span>
                <span className="text-xs text-slate-500 pt-0.5">fechar</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
