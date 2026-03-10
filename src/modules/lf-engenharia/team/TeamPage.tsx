import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Briefcase,
    MapPin,
    CheckCircle2,
    DollarSign,
    Hash,
    Receipt
} from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';
import { supabase } from '../../../lib/supabase';

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
    const [isFolhaModalOpen, setIsFolhaModalOpen] = useState(false);

    // Data States
    const [team, setTeam] = useState<any[]>([]);
    const [cargos, setCargos] = useState<any[]>([]);
    const [obras, setObras] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [funcRes, cargosRes, obrasRes] = await Promise.all([
                supabase.from('funcionarios').select('*, cargos(nome), obras(nome)').order('nome_completo'),
                supabase.from('cargos').select('*').order('nome'),
                supabase.from('obras').select('id, nome').order('nome')
            ]);

            if (funcRes.data) setTeam(funcRes.data);
            if (cargosRes.data) setCargos(cargosRes.data);
            if (obrasRes.data) setObras(obrasRes.data);
        } catch (err) {
            console.error("Erro ao puxar dados de RH", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFuncionario = async (novoObj: any) => {
        try {
            const { error } = await supabase.from('funcionarios').insert([novoObj]);
            if (error) throw error;
            setIsAddModalOpen(false);
            fetchInitialData(); // Atualiza a lista após insersão
        } catch (err) {
            console.error("Erro ao inserir", err);
            alert("Erro ao criar funcionário. Confira se o CPF não é repetido.");
        }
    };

    const handleFecharFolha = async () => {
        try {
            const custoGeral = team.reduce((acc, curr) => acc + Number(curr.custo_total_mes), 0);
            if (custoGeral <= 0) return alert("Não há custos na folha.");

            const { error } = await supabase.from('lancamentos_financeiros').insert([{
                obra_id: null,
                descricao: `Folha de Pagamento - ${new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
                tipo: 'DESPESA',
                categoria: 'MÃO_DE_OBRA',
                valor: custoGeral,
                data_vencimento: new Date().toISOString().split('T')[0],
                status: 'PAGO'
            }]);

            if (error) throw error;
            setIsFolhaModalOpen(false);
            alert("Folha fechada com sucesso! O valor foi debitado no Dashboard Financeiro.");
        } catch (err) {
            console.error("Erro ao fechar folha", err);
            alert("Erro ao registrar a despesa financeira.");
        }
    };

    // Filter Logic
    const filteredTeam = team.filter((member: any) => {
        const matchesSearch = member.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase());
        const cargoNome = member.cargos?.nome || '';
        const matchesRole = filterRole === 'all' || cargoNome === filterRole;
        return matchesSearch && matchesRole;
    });

    const uniqueRoles = Array.from(new Set(team.map(m => m.cargos?.nome).filter(Boolean)));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ATIVO': return 'bg-emerald-500';
            case 'FERIAS': return 'bg-amber-500';
            case 'AFASTADO': return 'bg-rose-500';
            case 'DESLIGADO': return 'bg-slate-500';
            default: return 'bg-emerald-500';
        }
    };

    const formatarDinheiro = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] font-sans selection:bg-[#C19A42]/30 p-4 md:p-8 pb-32 md:pb-8">
            <motion.div
                className="max-w-[1600px] mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-8 bg-[#C19A42] rounded-full blur-[2px]" />
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">RH & Pessoal</h1>
                        </div>
                        <p className="text-[#a1a1aa] mt-1 text-sm md:text-base font-medium tracking-wide">
                            Gestão de colaboradores ativos, funções e custos de folha.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsFolhaModalOpen(true)}
                            className="bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 px-5 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors h-12"
                        >
                            <Receipt size={18} />
                            <span className="hidden sm:inline">Fechar</span> Folha
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#C19A42] hover:bg-[#D6AF53] text-black px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(193,154,66,0.2)] transition-colors h-12"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                            Novo Colaborador
                        </motion.button>
                    </div>
                </motion.header>

                {/* Filters Bar */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-[#C19A42] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
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
                            <option value="all">Ver Todos os Cargos</option>
                            {uniqueRoles.map(role => (
                                <option key={role as string} value={role as string}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                    </div>
                </motion.div>

                {/* Team Grid (Bento Style) */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-10 h-10 border-4 border-[#C19A42]/30 border-t-[#C19A42] rounded-full animate-spin"></div>
                    </div>
                ) : (
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
                                    className="group bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div>
                                        <div className="flex justify-between items-start mb-5 relative z-10">
                                            <div className="relative">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome_completo)}&background=1e293b&color=cbd5e1&size=150`}
                                                    alt={member.nome_completo}
                                                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className={cn(
                                                    "absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-[#0f0f0f]",
                                                    getStatusColor(member.status)
                                                )} />
                                            </div>
                                            <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>

                                        <div className="relative z-10 space-y-1 mb-6">
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{member.nome_completo}</h3>
                                            <p className="text-[#C19A42] font-semibold text-sm tracking-wide">{member.cargos?.nome || 'Função Não Definida'}</p>
                                        </div>

                                        <div className="space-y-3 relative z-10 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                                <MapPin size={16} className="text-slate-500 stroke-[2px]" />
                                                <span className="font-medium truncate">{member.obras?.nome || 'Sede / Escritório'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                                <Hash size={16} className="text-slate-500 stroke-[2px]" />
                                                <span className="font-medium">CPF: {member.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                                                <Briefcase size={16} className="text-slate-500 stroke-[2px]" />
                                                <span className="font-medium">Tipo: {member.tipo_contratacao}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Box e Custo */}
                                    <div className="mt-auto pt-5 border-t border-white/5 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <DollarSign size={14} className="text-emerald-500" />
                                                <span className="text-[11px] font-bold uppercase tracking-wider">Custo Mês:</span>
                                            </div>
                                            <span className="text-emerald-400 font-bold font-mono text-sm">{formatarDinheiro(Number(member.custo_total_mes || 0))}</span>
                                        </div>
                                        <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                                            Editar Contrato
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
                                <h3 className="text-xl font-semibold text-white mb-2">Nenhum colaborador na base.</h3>
                                <p className="text-slate-400">Tente ajustar seus filtros ou cadastre seu primeiro membro.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddFuncionarioModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={handleAddFuncionario}
                        cargos={cargos}
                        obras={obras}
                    />
                )}
                {isFolhaModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl p-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <Receipt size={32} />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white text-center mb-2">Fechar Folha de Pagamento</h2>
                            <p className="text-slate-400 text-sm text-center mb-6">Esta ação calculará o custo total de {team.length} funcionários e inserirá uma despesa "Mão de Obra" no Financeiro.</p>
                            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-white/5 flex justify-between items-center">
                                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Custo Total:</span>
                                <span className="text-emerald-400 font-bold text-lg">{formatarDinheiro(team.reduce((acc, curr) => acc + Number(curr.custo_total_mes), 0))}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsFolhaModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">Cancelar</button>
                                <button onClick={handleFecharFolha} className="flex-1 py-3 rounded-xl font-medium text-black bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ==========================================
// SUBCOMPONENTE DE MODAL
// ==========================================
const AddFuncionarioModal = ({ onClose, onAdd, cargos, obras }: { onClose: () => void, onAdd: (obj: any) => void, cargos: any[], obras: any[] }) => {

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [cargoId, setCargoId] = useState('');
    const [obraId, setObraId] = useState('');
    const [tipo, setTipo] = useState('CLT');
    const [salario, setSalario] = useState('');
    const [encargos, setEncargos] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onAdd({
            nome_completo: nome,
            cpf: cpf.replace(/\D/g, ''),
            cargo_id: cargoId || null,
            obra_alocada_id: obraId || null,
            tipo_contratacao: tipo,
            salario_base: parseFloat(salario || '0'),
            encargos_estimados: parseFloat(encargos || '0'),
            status: 'ATIVO'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#121212] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 md:p-8 border-b border-white/5 shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Novo Colaborador</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form className="p-6 md:p-8 space-y-5 overflow-y-auto" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Nome Completo</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">CPF (Apenas Números)</label>
                            <input type="text" maxLength={11} value={cpf} onChange={e => setCpf(e.target.value)} required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Vínculo</label>
                            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium appearance-none">
                                <option value="CLT" className="bg-[#121212]">CLT</option>
                                <option value="PJ" className="bg-[#121212]">PJ / MEI</option>
                                <option value="TERCEIRIZADO" className="bg-[#121212]">Terceirizado Diária</option>
                                <option value="ESTAGIO" className="bg-[#121212]">Estágio</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Cargo</label>
                            <select value={cargoId} onChange={e => setCargoId(e.target.value)} required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 transition-all font-medium appearance-none">
                                <option value="" className="bg-[#121212]">Selec.:</option>
                                {cargos.map(c => <option key={c.id} value={c.id} className="bg-[#121212]">{c.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Alocação Inicial</label>
                            <select value={obraId} onChange={e => setObraId(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 transition-all font-medium appearance-none">
                                <option value="" className="bg-[#121212]">Sede / HQ</option>
                                {obras.map(o => <option key={o.id} value={o.id} className="bg-[#121212]">{o.nome}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Salário Base (R$)</label>
                            <input type="number" step="0.01" value={salario} onChange={e => setSalario(e.target.value)} required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Encargos Totais (R$)</label>
                            <input type="number" step="0.01" value={encargos} onChange={e => setEncargos(e.target.value)} required placeholder="INSS, FGTS, etc..." className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 px-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold h-12 rounded-2xl transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold h-12 rounded-2xl transition-colors shadow-[0_0_20px_rgba(193,154,66,0.15)] flex justify-center items-center gap-2">
                            <CheckCircle2 size={18} /> Cadastrar
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ChevronDown = ({ className, size }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);
