import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Mail,
    PhoneCall,
    Briefcase,
    MapPin,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

// Mock Data
const MOCK_TEAM = [
    { id: 1, name: 'João Mestre', role: 'Mestre de Obras', email: 'joao.mestre@lf.com', phone: '(11) 98888-7777', status: 'active', project: 'Residencial Aurora', avatar: 'https://i.pravatar.cc/150?u=joao' },
    { id: 2, name: 'Pedro Pedreiro', role: 'Pedreiro', email: 'pedro@lf.com', phone: '(11) 97777-6666', status: 'active', project: 'Condomínio Vale Verde', avatar: 'https://i.pravatar.cc/150?u=pedro' },
    { id: 3, name: 'Carlos Engenheiro', role: 'Engenheiro Responsável', email: 'carlos@lf.com', phone: '(11) 96666-5555', status: 'active', project: 'Múltiplos', avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { id: 4, name: 'Ana Arquiteta', role: 'Arquiteta Pleno', email: 'ana@lf.com', phone: '(11) 95555-4444', status: 'away', project: 'Edifício Horizonte', avatar: 'https://i.pravatar.cc/150?u=ana' },
    { id: 5, name: 'Marcos Eletricista', role: 'Eletricista Chefe', email: 'marcos@lf.com', phone: '(11) 94444-3333', status: 'active', project: 'Corporate Building', avatar: 'https://i.pravatar.cc/150?u=marcos' },
    { id: 6, name: 'Julia Segurança', role: 'Técnica de Segurança', email: 'julia@lf.com', phone: '(11) 93333-2222', status: 'offline', project: 'Residencial Aurora', avatar: 'https://i.pravatar.cc/150?u=julia' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const TeamPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter Logic
    const filteredTeam = MOCK_TEAM.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member.role.includes(filterRole);
        return matchesSearch && matchesRole;
    });

    // Unique roles for filter dropdown
    const uniqueRoles = Array.from(new Set(MOCK_TEAM.map(m => m.role.split(' ')[0])));

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] font-sans selection:bg-[#C19A42]/30 p-4 md:p-8 pb-32 md:pb-8">
            <motion.div
                className="max-w-[1600px] mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-8 bg-[#C19A42] rounded-full blur-[2px]" />
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Equipe</h1>
                        </div>
                        <p className="text-[#a1a1aa] mt-1 text-sm md:text-base font-medium tracking-wide">
                            Gestão de funcionários, funções e alocação em obras
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#C19A42] hover:bg-[#D6AF53] text-black px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(193,154,66,0.2)] transition-colors h-12"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Novo Funcionário
                    </motion.button>
                </motion.header>

                {/* Filters Bar */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-[#C19A42] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou função..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121212]/90 backdrop-blur-xl border border-white/10 text-white placeholder:text-[#a1a1aa] rounded-2xl h-14 pl-12 pr-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium hover:border-white/20 shadow-inner"
                        />
                    </div>

                    <div className="relative w-full sm:w-64">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full bg-[#121212]/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl h-14 pl-4 pr-10 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium appearance-none hover:border-white/20 cursor-pointer shadow-inner"
                        >
                            <option value="all">Todas as Funções</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                    </div>
                </motion.div>

                {/* Team Grid (Bento Style) */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredTeam.map((member) => (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden hover:border-white/10 transition-all duration-300"
                            >
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Header: Avatar & Status */}
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="relative">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className={cn(
                                            "absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-[#0f0f0f]",
                                            member.status === 'active' ? "bg-emerald-500" :
                                                member.status === 'away' ? "bg-amber-500" :
                                                    "bg-slate-500"
                                        )} />
                                    </div>
                                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="relative z-10 space-y-1 mb-6">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{member.name}</h3>
                                    <p className="text-[#C19A42] font-semibold text-sm tracking-wide">{member.role}</p>
                                </div>

                                {/* Details list */}
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                        <MapPin size={16} className="text-slate-500 stroke-[2px]" />
                                        <span className="font-medium truncate">{member.project}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                        <PhoneCall size={16} className="text-slate-500 stroke-[2px]" />
                                        <span className="font-medium">{member.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                        <Mail size={16} className="text-slate-500 stroke-[2px]" />
                                        <span className="font-medium truncate">{member.email}</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                    <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                                        <Briefcase size={16} />
                                        Atribuir Tarefa
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTeam.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex w-16 h-16 rounded-3xl bg-white/5 items-center justify-center text-slate-500 mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Nenhum funcionário encontrado</h3>
                            <p className="text-slate-400">Tente ajustar seus filtros ou termo de busca.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#121212] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8 border-b border-white/5">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Novo Cadastro</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-slate-400 mt-2 text-sm">Adicione um novo membro à equipe LF Engenharia</p>
                            </div>

                            <form className="p-6 md:p-8 space-y-5" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Nome Completo</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Função / Cargo</label>
                                    <input type="text" required placeholder="Ex: Mestre de Obras" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Telefone</label>
                                        <input type="tel" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Alocação Atual</label>
                                        <select className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium appearance-none">
                                            <option value="none" className="bg-[#121212]">Sem Alocação</option>
                                            <option value="aurora" className="bg-[#121212]">Residencial Aurora</option>
                                            <option value="horizonte" className="bg-[#121212]">Edifício Horizonte</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold h-12 rounded-2xl transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold h-12 rounded-2xl transition-colors shadow-[0_0_20px_rgba(193,154,66,0.15)] flex justify-center items-center gap-2">
                                        <CheckCircle2 size={18} /> Salvar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChevronDown = ({ className, size }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);
