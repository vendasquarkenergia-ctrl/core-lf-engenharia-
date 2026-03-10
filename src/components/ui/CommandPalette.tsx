import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderKanban, DollarSign, Calendar, Settings, FileText, X } from 'lucide-react';

/**
 * CORE Enterprise: Command Palette (Padrão Apple Spotlight/Linear)
 * 
 * Permite buscar globalmente no sistema através do teclado (Cmd+K).
 * Possui design Glassmorphism translúcido, blur pesado em background (Tailwind premium dark-mode).
 */
export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle do Command Palette com Ctrl+K (Windows/Linux) ou Cmd+K (Mac)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Foca o input sempre que o Cmd+K for aberto
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        } else {
            setQuery('');
        }
    }, [isOpen]);

    // Mock de links e atalhos globais de navegação
    const globalActions = [
        { id: 1, title: 'Ir para Dashboard Financeiro (DRE)', icon: <DollarSign size={18} />, type: 'Acesso Rápido' },
        { id: 2, title: 'Obra Alpha (Gestão e Tarefas)', icon: <FolderKanban size={18} />, type: 'Obras' },
        { id: 3, title: 'Criar novo RDO', icon: <FileText size={18} />, type: 'Ação' },
        { id: 4, title: 'Cronograma Mestre', icon: <Calendar size={18} />, type: 'Obras' },
        { id: 5, title: 'Configurações de Permissão (RBAC)', icon: <Settings size={18} />, type: 'Sistema' },
    ];

    const filteredActions = query === ''
        ? globalActions
        : globalActions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop Escuro (Blurry Background Apple Vibe) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* O Menu "Spotlight" propriamente dito */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none"
                    >
                        <div
                            className="w-full max-w-2xl bg-[#1A1C1E]/90 backdrop-blur-2xl border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col will-change-transform ring-1 ring-white/5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header do Search Input */}
                            <div className="flex items-center px-4 py-3 border-b border-neutral-800/60">
                                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Buscar obras, RDOs, tarefas... ou pular para (Cmd+K)"
                                    className="flex-1 bg-transparent text-neutral-200 outline-none placeholder:text-neutral-500 text-lg w-full font-medium"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors bg-neutral-800/30 border border-neutral-700/50"
                                    title="Fechar (Esc)"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Corpo / Lista de Resultados Animada Otimizada */}
                            <div className="max-h-[60vh] overflow-y-auto w-full p-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                {filteredActions.length > 0 ? (
                                    <div className="space-y-1">
                                        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Sugestões
                                        </p>
                                        {filteredActions.map((action, index) => (
                                            <motion.button
                                                key={action.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="w-full text-left flex items-center px-3 py-3 rounded-lg hover:bg-blue-600/10 hover:border-blue-500/30 border border-transparent text-neutral-300 focus:bg-blue-600/10 focus:outline-none transition-all group"
                                            >
                                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800/50 text-neutral-400 group-hover:text-blue-400 group-hover:bg-blue-500/20 mr-3 transition-colors">
                                                    {action.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium group-hover:text-blue-50">{action.title}</p>
                                                </div>
                                                <span className="text-xs text-neutral-600 font-medium tracking-wide">
                                                    {action.type}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-14 text-center">
                                        <Search className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                                        <p className="text-neutral-400 font-medium">Nenhum resultado encontrado para "{query}"</p>
                                        <p className="text-sm text-neutral-600 mt-1">Tente buscar por "Obra" ou "DRE".</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Apple-feel hint */}
                            <div className="px-4 py-2 border-t border-neutral-800/60 bg-neutral-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                    <span className="flex items-center justify-center bg-neutral-800 rounded text-neutral-400 px-1.5 py-0.5 border border-neutral-700/50 shadow-sm leading-none">
                                        ↑
                                    </span>
                                    <span className="flex items-center justify-center bg-neutral-800 rounded text-neutral-400 px-1.5 py-0.5 border border-neutral-700/50 shadow-sm leading-none">
                                        ↓
                                    </span>
                                    <span>para navegar</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                    <span className="flex items-center justify-center bg-neutral-800 rounded text-neutral-400 px-2 py-0.5 border border-neutral-700/50 shadow-sm leading-none tracking-widest text-[10px]">
                                        ENTER
                                    </span>
                                    <span>para selecionar</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
