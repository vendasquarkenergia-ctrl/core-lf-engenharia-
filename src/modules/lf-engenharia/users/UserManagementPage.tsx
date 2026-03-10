import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, MoreVertical, Search, Filter, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const UserManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data para Gestão
    const [users, setUsers] = useState([
        { id: 1, name: 'Eng. Arthur LF', email: 'arthur@lfsym.com', role: 'ADMIN', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', lastLogin: 'Agora' },
        { id: 2, name: 'João Silva', email: 'joao.obra@lfsym.com', role: 'COLABORADOR', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150', lastLogin: 'Há 2h' },
        { id: 3, name: 'Maria Souza', email: 'maria.arquiteta@lfsym.com', role: 'COLABORADOR', status: 'Pendente', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', lastLogin: 'Nunca' },
        { id: 4, name: 'Construtora Beta', email: 'contato@beta.com.br', role: 'CLIENTE', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150', lastLogin: 'Ontem' },
        { id: 5, name: 'Pedro Santos', email: 'pedro@teceiro.com', role: 'COLABORADOR', status: 'Bloqueado', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', lastLogin: 'Há 15 dias' }
    ]);

    const handleRoleChange = (id: number, newRole: string) => {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--color-root-bg)] text-[var(--color-text-main)] font-sans p-8 lg:p-12 pb-safe selection:bg-[var(--color-accent)]/30">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Gestão de Acessos</h1>
                    <p className="text-slate-400 font-medium tracking-wide text-sm flex items-center gap-2">
                        Controle de Permissões e Perfis
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        {users.length} Registros
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 glass px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover-scale transition-promax">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        Auditoria (Logs)
                    </button>
                    <button className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-promax shadow-[0_0_15px_var(--color-accent)]">
                        <UserPlus className="w-4 h-4" />
                        Convidar Usuário
                    </button>
                </div>
            </div>

            {/* Toolbar & Busca */}
            <div className="glass p-4 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center transition-promax hover-scale group">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.05] transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-slate-300 hover:bg-white/[0.08] transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Listagem de Usuários */}
            <div className="glass rounded-3xl overflow-hidden shadow-2xl transition-promax">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-transparent text-[11px] uppercase tracking-widest text-slate-500 font-semibold border-b border-white/[0.05]">
                                <th className="px-8 py-5">Perfil</th>
                                <th className="px-8 py-5">Identificação</th>
                                <th className="px-8 py-5">Permissão (Role)</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-[14px]">
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="hover:bg-white/[0.03] transition-colors group"
                                >
                                    {/* Perfil (Avatar + Info) */}
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#111827] ${user.status === 'Ativo' ? 'bg-emerald-500' :
                                                        user.status === 'Pendente' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}></div>
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{user.name}</p>
                                                <p className="text-slate-400 text-xs mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Último Login */}
                                    <td className="px-8 py-5 text-slate-400 text-sm">
                                        <p className="text-[11px] uppercase tracking-wider mb-1">Último Acesso:</p>
                                        <span className="font-medium text-slate-200">{user.lastLogin}</span>
                                    </td>

                                    {/* Role Selection */}
                                    <td className="px-8 py-5">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`bg-white/[0.03] border text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none appearance-none cursor-pointer transition-colors ${user.role === 'ADMIN' ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' :
                                                    user.role === 'CLIENTE' ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' :
                                                        'border-slate-500/30 text-slate-400 hover:bg-slate-500/10'
                                                }`}
                                        >
                                            <option value="ADMIN" className="bg-[#111827]">ADMIN</option>
                                            <option value="COLABORADOR" className="bg-[#111827]">COLABORADOR</option>
                                            <option value="CLIENTE" className="bg-[#111827]">CLIENTE</option>
                                        </select>
                                    </td>

                                    {/* Status Indicator & Action */}
                                    <td className="px-8 py-5">
                                        {user.status === 'Pendente' ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleStatusChange(user.id, 'Ativo')} className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                                                </button>
                                                <button onClick={() => handleStatusChange(user.id, 'Bloqueado')} className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-rose-500/20">
                                                    <XCircle className="w-3.5 h-3.5" /> Recusar
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold ${user.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}></span>
                                                {user.status}
                                            </span>
                                        )}
                                    </td>

                                    {/* Configurações Extra */}
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <MoreVertical className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default UserManagementPage;
