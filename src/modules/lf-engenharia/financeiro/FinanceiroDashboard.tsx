import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Filter, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const FinanceiroDashboard = () => {
    // ---- 1. STATES ----
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [obras, setObras] = useState<any[]>([]);
    const [selectedObraId, setSelectedObraId] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(true);

    // DRE Modal State
    const [showDRE, setShowDRE] = useState(false);

    // ---- 2. FETCH DATA ----
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // Fetch Obras for filter
            const { data: obrasData } = await supabase.from('obras').select('id, nome').order('nome');
            if (obrasData) setObras(obrasData);

            // Fetch Lancamentos
            const { data: lancamentosData, error } = await supabase
                .from('lancamentos_financeiros')
                .select('*, obras(nome)')
                .order('data_vencimento', { ascending: false });

            if (error) throw error;
            setLancamentos(lancamentosData || []);
        } catch (err) {
            console.error("Erro ao puxar dados financeiros:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // ---- 3. CALCULATIONS (Memoized) ----
    const filteredLancamentos = useMemo(() => {
        if (selectedObraId === 'ALL') return lancamentos;
        return lancamentos.filter(l => l.obra_id === selectedObraId);
    }, [lancamentos, selectedObraId]);

    const kpis = useMemo(() => {
        const receitas = filteredLancamentos.filter(l => l.tipo === 'RECEITA' && l.status === 'PAGO').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const despesas = filteredLancamentos.filter(l => l.tipo === 'DESPESA' && l.status === 'PAGO').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const saldo = receitas - despesas;

        // Dummy trends for visual effect, real would compare with previous month
        return [
            { title: 'Saldo Atual', value: saldo, trend: '+12.5%', isPositive: saldo >= 0, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Receitas Recebidas', value: receitas, trend: '+8.2%', isPositive: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { title: 'Despesas Pagas', value: despesas, trend: '-2.4%', isPositive: false, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ];
    }, [filteredLancamentos]);

    const pieData = useMemo(() => {
        const despesas = filteredLancamentos.filter(l => l.tipo === 'DESPESA');
        const categoriasMap: Record<string, number> = {};

        despesas.forEach(d => {
            const cat = d.categoria || 'Outros';
            categoriasMap[cat] = (categoriasMap[cat] || 0) + Number(d.valor);
        });

        return Object.entries(categoriasMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // top 5
    }, [filteredLancamentos]);

    // Paleta Navy Blue / Deep Charcoal harmonizada
    const pieColors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B'];

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="min-h-screen bg-[var(--color-root-bg)] text-[var(--color-text-main)] font-sans p-8 lg:p-12 pb-safe selection:bg-[var(--color-accent)]/30">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Painel Executivo</h1>
                    <p className="text-slate-400 font-medium tracking-wide text-sm flex items-center gap-2">
                        Visão Financeira Consolidada
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Filtro de Obra */}
                    <div className="flex items-center gap-2 bg-[#171717] border border-white/10 px-4 py-2 rounded-xl">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={selectedObraId}
                            onChange={(e) => setSelectedObraId(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-white outline-none focus:ring-0 cursor-pointer"
                        >
                            <option value="ALL">Todas as Obras (Geral)</option>
                            {obras.map(o => (
                                <option key={o.id} value={o.id}>{o.nome}</option>
                            ))}
                        </select>
                    </div>

                    <button className="flex items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all px-5 py-2.5 rounded-xl text-sm font-semibold text-white backdrop-blur-md shadow-sm">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Live
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-[#C19A42]/30 border-t-[#C19A42] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Top Cards (KPIs) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {kpis.map((kpi, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                                className="group relative glass p-7 rounded-3xl hover-scale transition-promax overflow-hidden"
                            >
                                {/* Soft Glow Effect Background */}
                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${kpi.bg}`}></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`p-3.5 rounded-2xl ${kpi.bg} shadow-inner`}>
                                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                    </div>
                                    <span className={`flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {kpi.trend}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{kpi.title}</p>
                                    <h3 className="text-4xl font-bold text-white tracking-tight">{formatCurrency(kpi.value)}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                        {/* Placeholder para o BarChart Real (Substituido pelo DCTA Call) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-2 glass p-12 rounded-3xl flex flex-col items-center justify-center text-center transition-promax border border-dashed border-white/10"
                        >
                            <Activity className="w-16 h-16 text-slate-600 mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">Gerador de DRE (Demonstrativo de Resultado)</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">Analise as margens brutas, líquidas e a eficiência operacional da obra com o gerador automático a partir dos lançamentos.</p>

                            <button onClick={() => setShowDRE(true)} className="px-8 py-4 bg-[#C19A42] hover:bg-[#D6AF53] text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(193,154,66,0.2)]">
                                Gerar DRE Completo
                            </button>
                        </motion.div>

                        {/* Gráfico de Rosca - Customizado */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="glass p-8 rounded-3xl flex flex-col hover-scale transition-promax"
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">Custo por Categoria</h3>
                                <p className="text-sm font-medium text-slate-400">Distribuição macro (Despesas)</p>
                            </div>

                            {pieData.length > 0 ? (
                                <>
                                    <div className="h-64 w-full flex-grow relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={105}
                                                    paddingAngle={6}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => formatCurrency(value)}
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Centered Element on Donut */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-2xl font-bold text-white">{kpis[2].value > 0 ? 'Total' : '0%'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 space-y-3 mt-6">
                                        {pieData.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pieColors[index] }}></div>
                                                    <span className="text-[13px] font-medium text-slate-300">{item.name}</span>
                                                </div>
                                                <span className="text-white font-mono text-[13px]">{formatCurrency(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-500 font-medium pb-8 text-center px-4">
                                    Nenhuma despesa registrada para o filtro atual.
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Tabela de Lançamentos Recentes */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="glass rounded-3xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Últimos Lançamentos</h3>
                                <p className="text-sm font-medium text-slate-400">Extrato detalhado do sistema</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-transparent text-[11px] uppercase tracking-widest text-slate-500 font-semibold border-b border-white/[0.05]">
                                        <th className="px-8 py-5">Data Venc.</th>
                                        <th className="px-8 py-5">Descrição</th>
                                        <th className="px-8 py-5">Obra / Categoria</th>
                                        <th className="px-8 py-5 text-right">Valor</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05] text-[14px]">
                                    {filteredLancamentos.slice(0, 10).map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap text-slate-400 font-medium">
                                                {new Date(tx.data_vencimento).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-8 py-5 text-white font-semibold">
                                                {tx.descricao}
                                                {tx.tipo === 'RECEITA' ? <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">REC</span> : <span className="ml-2 text-[10px] text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md border border-rose-400/20">DES</span>}
                                            </td>
                                            <td className="px-8 py-5 text-slate-400 font-medium">
                                                <div className="text-xs text-white mb-1">{tx.obras?.nome || 'Geral'}</div>
                                                <span className="px-2 py-0.5 bg-white/[0.03] rounded-md border border-white/[0.05] text-[11px] font-medium text-slate-500">{tx.categoria}</span>
                                            </td>
                                            <td className={`px-8 py-5 font-mono tracking-tight font-bold text-right ${tx.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {tx.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(tx.valor)}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold ${tx.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : tx.status === 'ATRASADO' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'PAGO' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                                                            : tx.status === 'ATRASADO' ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                                                : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                                        }`}></span>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLancamentos.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                                Nenhum lançamento no momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}

            {/* DRE MODAL */}
            <AnimatePresence>
                {showDRE && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowDRE(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111111] border border-white/10 rounded-3xl shadow-2xl z-10 p-8"
                        >
                            <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">Demonstrativo do Resultado do Exercício (DRE)</h2>
                                    <p className="text-slate-400">Visão Analítica de Receitas, Custos e Despesas.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => setShowDRE(false)} className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors">
                                        Fechar
                                    </button>
                                </div>
                            </div>

                            {/* DRE Structure */}
                            <div className="space-y-4">
                                {/* DRE HEADER */}
                                <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-slate-500 font-bold px-4 mb-2">
                                    <div className="col-span-8">Descrição</div>
                                    <div className="col-span-4 text-right">Valores Consolidados</div>
                                </div>

                                {/* 1. Receita Bruta */}
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                                    <div className="grid grid-cols-12 items-center">
                                        <div className="col-span-8 font-bold text-emerald-400 text-lg">1. RECEITA OPERACIONAL BRUTA (ROB)</div>
                                        <div className="col-span-4 text-right font-mono font-bold text-emerald-400 text-lg">{formatCurrency(kpis[1].value)}</div>
                                    </div>
                                </div>

                                {/* 2. Deduções e Impostos */}
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <div className="grid grid-cols-12 items-center mb-2">
                                        <div className="col-span-8 font-bold text-slate-300">2. DEDUÇÕES DA RECEITA BRUTA</div>
                                        <div className="col-span-4 text-right font-mono font-bold text-rose-400">- R$ 0,00</div>
                                    </div>
                                    <div className="pl-6 space-y-2">
                                        <div className="grid grid-cols-12 items-center text-sm text-slate-400">
                                            <div className="col-span-8">Impostos s/ Vendas (PIS, COFINS, ISS)</div>
                                            <div className="col-span-4 text-right font-mono">- R$ 0,00</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Receita Líquida */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="grid grid-cols-12 items-center">
                                        <div className="col-span-8 font-bold text-white">3. RECEITA OPERACIONAL LÍQUIDA (ROL)</div>
                                        <div className="col-span-4 text-right font-mono font-bold text-white">{formatCurrency(kpis[1].value)}</div>
                                    </div>
                                </div>

                                {/* 4. Custos (Despesas) */}
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <div className="grid grid-cols-12 items-center mb-2">
                                        <div className="col-span-8 font-bold text-slate-300">4. CUSTOS DOS SERVIÇOS PRESTADOS (CSP)</div>
                                        <div className="col-span-4 text-right font-mono font-bold text-rose-400">- {formatCurrency(kpis[2].value)}</div>
                                    </div>
                                    <div className="pl-6 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {pieData.map((d, i) => (
                                            <div key={i} className="grid grid-cols-12 items-center text-sm text-slate-400 border-b border-white/5 pb-2 last:border-0 last:pb-0 pt-1">
                                                <div className="col-span-8">{d.name}</div>
                                                <div className="col-span-4 text-right font-mono">- {formatCurrency(d.value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RESULTADO BRUTO */}
                                <div className="bg-[#C19A42]/10 border border-[#C19A42]/30 rounded-xl p-5 mt-4">
                                    <div className="grid grid-cols-12 items-center">
                                        <div className="col-span-8 font-black text-[#C19A42] text-xl">5. RESULTADO BRUTO / MARGEM DE CONTRIBUIÇÃO</div>
                                        <div className="col-span-4 text-right font-mono font-black text-[#C19A42] text-xl">{formatCurrency(kpis[0].value)}</div>
                                    </div>
                                </div>

                                <div className="text-center mt-6">
                                    <p className="text-xs text-slate-500 font-medium tracking-wide">Relatório gerado automaticamente em tempo real a partir do Supabase.</p>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FinanceiroDashboard;
