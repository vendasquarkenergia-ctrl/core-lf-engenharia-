import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Substitua por sua biblioteca de ícones favorita, ex: lucide-react
import { Search, Folder, CheckSquare, DollarSign, FileText } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
    const [search, setSearch] = useState('');

    // Exemplos de itens estáticos - em um app real, seriam derivados de rotas, dados e permissões RBAC
    const items = [
        { id: 1, name: 'Obra Alpha - Visão Geral', icon: Folder, shortcut: 'O A' },
        { id: 2, name: 'Nova Tarefa', icon: CheckSquare, shortcut: 'N T' },
        { id: 3, name: 'DRE Financeiro', icon: DollarSign, shortcut: 'D R' },
        { id: 4, name: 'Preencher RDO', icon: FileText, shortcut: 'R D' },
    ];

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Abre e fecha com Cmd+K ou Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // Em um caso de state global, dispararia uma action aqui. Se via props:
                    if (typeof onClose === 'function') onClose(true);
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm"
                onClick={() => onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="w-full max-w-xl bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()} // Evita fechar ao clicar no palette
                >
                    {/* Header de Busca */}
                    <div className="flex items-center px-4 py-3 border-b border-white/10">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="O que você precisa acessar? (Ex: Obra Alpha, DRE...)"
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg focus:ring-0"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded shadow-sm px-1.5 py-0.5 pointer-events-none">
                            ESC
                        </span>
                    </div>

                    {/* Resultados */}
                    <div className="max-h-80 overflow-y-auto p-2 scrollbar-none">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Nenhum resultado encontrado para "{search}".
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        className="flex items-center w-full px-3 py-3 rounded-xl hover:bg-white/10 transition-colors group text-left focus:outline-none focus:bg-white/10"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 mr-3 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:text-blue-400 text-gray-400 transition-colors">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="flex-1 text-gray-200 group-hover:text-white transition-colors">{item.name}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.shortcut.split(' ').map(key => (
                                                <span key={key} className="text-xs text-gray-400 bg-black/30 rounded px-1.5 py-0.5 border border-white/10">
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Informativo */}
                    <div className="bg-[#151516] px-4 py-2 text-[11px] text-gray-500 flex justify-between items-center border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="flex flex-row items-center gap-1">Navegue com <kbd className="font-sans border border-gray-700 bg-gray-800 rounded px-1 py-0.5 text-gray-400">↑</kbd> <kbd className="font-sans border border-gray-700 bg-gray-800 rounded px-1 py-0.5 text-gray-400">↓</kbd></span>
                            <span className="flex flex-row items-center gap-1">Selecione com <kbd className="font-sans border border-gray-700 bg-gray-800 rounded px-1 py-0.5 text-gray-400">↵</kbd></span>
                        </div>
                        <span className="font-medium text-gray-600">C.O.R.E. OS</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
