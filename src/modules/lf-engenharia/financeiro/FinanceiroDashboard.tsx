import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Activity, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FinanceiroDashboard = () => {
    // Mock Data Alta Fidelidade
    const barData = [
        { name: 'Out', previsto: 180, realizado: 175 },
        { name: 'Nov', previsto: 220, realizado: 240 },
        { name: 'Dez', previsto: 250, realizado: 245 },
        { name: 'Jan', previsto: 300, realizado: 280 },
        { name: 'Fev', previsto: 280, realizado: 295 },
        { name: 'Mar', previsto: 350, realizado: 310 }
    ];

    const pieData = [
        { name: 'Materiais', value: 45 },
        { name: 'Mão de Obra', value: 35 },
        { name: 'Equipamentos', value: 12 },
        { name: 'Impostos', value: 8 }
    ];
    // Paleta Navy Blue / Deep Charcoal harmonizada
    const pieColors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6'];

    const transactions = [
        { id: 1, data: '09 Mar', desc: 'Concreto Usinado - Cimento&Cia', cat: 'Materiais', valor: 'R$ 14.500,00', status: 'Pago' },
        { id: 2, data: '08 Mar', desc: 'Folha de Pagamento - Equipe A', cat: 'Mão de Obra', valor: 'R$ 42.000,00', status: 'Pago' },
        { id: 3, data: '07 Mar', desc: 'Locação Guindaste', cat: 'Equipamentos', valor: 'R$ 8.500,00', status: 'Pendente' },
        { id: 4, data: '05 Mar', desc: 'Aço CA50 - Siderúrgica', cat: 'Materiais', valor: 'R$ 22.300,00', status: 'Pago' },
        { id: 5, data: '02 Mar', desc: 'ISS Mensal ref. Mão de obra', cat: 'Impostos', valor: 'R$ 5.400,00', status: 'Pendente' }
    ];

    const kpis = [
        { title: 'Saldo Atual', value: 'R$ 1.245.000', trend: '+12.5%', isPositive: true, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Receitas (Mês)', value: 'R$ 850.000', trend: '+8.2%', isPositive: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Despesas (Mês)', value: 'R$ 310.000', trend: '-2.4%', isPositive: false, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-root-bg)] text-[var(--color-text-main)] font-sans p-8 lg:p-12 pb-safe selection:bg-[var(--color-accent)]/30">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Painel Executivo</h1>
                    <p className="text-slate-400 font-medium tracking-wide text-sm flex items-center gap-2">
                        Visão Financeira Consolidada
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        Residencial Infinity
                    </p>
                </div>
                <button className="flex items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all px-5 py-2.5 rounded-xl text-sm font-semibold text-white backdrop-blur-md shadow-sm">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Sincronização Ativa
                </button>
            </div>

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
                            <h3 className="text-4xl font-bold text-white tracking-tight">{kpi.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Gráficos de Alta Fidelidade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                {/* Gráfico de Barras - Previsto vs Realizado */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="lg:col-span-2 glass p-8 rounded-3xl hover-scale transition-promax"
                >
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Previsto vs Realizado</h3>
                            <p className="text-sm font-medium text-slate-400">Comparativo semestral consolidado (em milhares de R$)</p>
                        </div>
                        <button onClick={() => alert("Exportar PDF/Excel em desenvolvimento...")} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={13} fontWeight={500} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={13} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}k`} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '12px 16px' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                    labelStyle={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#CBD5E1', paddingTop: '24px' }} />
                                <Bar dataKey="previsto" name="Previsto (Budget)" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
                                <Bar dataKey="realizado" name="Realizado (Actual)" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
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
                        <p className="text-sm font-medium text-slate-400">Distribuição macro do orçamento</p>
                    </div>
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
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Element on Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-white">100%</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1">Total Obra</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pieColors[index] }}></div>
                                <span className="text-[13px] font-medium text-slate-300">
                                    {item.name} <span className="text-slate-500 ml-1 font-semibold">{item.value}%</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Mini DRE / Tabela Minimalista Apple-Style */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="glass rounded-3xl overflow-hidden"
            >
                <div className="p-8 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Últimas Transações</h3>
                        <p className="text-sm font-medium text-slate-400">Fluxo de caixa recente detalhado</p>
                    </div>
                    <button onClick={() => alert("Módulo completo de DRE será aberto aqui.")} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-semibold tracking-wide">
                        Visualizar DRE Completo
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-transparent text-[11px] uppercase tracking-widest text-slate-500 font-semibold border-b border-white/[0.05]">
                                <th className="px-8 py-5">Data</th>
                                <th className="px-8 py-5">Descrição da Despesa</th>
                                <th className="px-8 py-5">Categoria</th>
                                <th className="px-8 py-5">Valor</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-[14px]">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                                    <td className="px-8 py-5 whitespace-nowrap text-slate-400 font-medium">{tx.data}</td>
                                    <td className="px-8 py-5 text-white font-semibold">{tx.desc}</td>
                                    <td className="px-8 py-5 text-slate-400">
                                        <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05] text-[12px] font-medium">{tx.cat}</span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-200 font-mono tracking-tight font-medium">{tx.valor}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold ${tx.status === 'Pago'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Pago' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`}></span>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
};

export default FinanceiroDashboard;
