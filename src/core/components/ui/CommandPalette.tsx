import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
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

    const handleAction = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    const ITEMS = [
        { label: 'Visão Geral (Master)', path: '/master' },
        { label: 'Timeline da Obra', path: '/timeline' },
        { label: 'Painel Financeiro', path: '/dashboard' },
        { label: 'Gestão de Tarefas', path: '/tasks' },
    ];

    const filtered = ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-xl bg-[#171717]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center px-4 border-b border-white/10">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Buscar páginas ou comandos..."
                                    className="w-full bg-transparent border-none text-white h-14 px-4 outline-none placeholder:text-slate-500 font-medium"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-slate-400">
                                    ESC
                                </kbd>
                            </div>

                            <div className="p-2 max-h-[300px] overflow-y-auto">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Sugestões
                                </div>
                                {filtered.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAction(item.path)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-3 group"
                                    >
                                        <Search size={14} className="text-slate-500 group-hover:text-white" />
                                        {item.label}
                                    </button>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="py-6 text-center text-slate-400 text-sm">
                                        Nenhum resultado encontrado.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
