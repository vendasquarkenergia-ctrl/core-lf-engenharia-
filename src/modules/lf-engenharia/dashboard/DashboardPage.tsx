import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Filter, ArrowUpRight, ArrowDownRight, Search, FileText, MoreVertical, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { cn } from '../../../core/components/layout/MainLayout';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data ---
const DRE_DATA = [
  { name: 'Jan', receitas: 400000, custos: 240000 },
  { name: 'Fev', receitas: 300000, custos: 139000 },
  { name: 'Mar', receitas: 200000, custos: 98000 },
  { name: 'Abr', receitas: 278000, custos: 390800 },
  { name: 'Mai', receitas: 189000, custos: 48000 },
  { name: 'Jun', receitas: 239000, custos: 38000 },
  { name: 'Jul', receitas: 349000, custos: 43000 },
];

const CASHFLOW_DATA = [
  { name: 'Sem 1', saldo: 150000 },
  { name: 'Sem 2', saldo: 120000 },
  { name: 'Sem 3', saldo: 180000 },
  { name: 'Sem 4', saldo: 250000 },
];

const EXPENSES_BY_CATEGORY = [
  { name: 'Materiais', value: 120000, color: '#3b82f6' },
  { name: 'Mão de Obra', value: 80000, color: '#C19A42' },
  { name: 'Equipamentos', value: 45000, color: '#8b5cf6' },
  { name: 'Impostos', value: 35000, color: '#ef4444' },
];

const INITIAL_TRANSACTIONS = [
  { id: '1', type: 'income', description: 'Pagamento Cliente A - Obra X', amount: 150000, date: '2023-10-25', category: 'Serviços', status: 'paid' },
  { id: '2', type: 'expense', description: 'Compra de Cimento e Areia', amount: 45000, date: '2023-10-24', category: 'Materiais', status: 'paid' },
  { id: '3', type: 'expense', description: 'Folha de Pagamento - Outubro', amount: 80000, date: '2023-10-20', category: 'Mão de Obra', status: 'pending' },
  { id: '4', type: 'income', description: 'Adiantamento Cliente B', amount: 50000, date: '2023-10-15', category: 'Serviços', status: 'paid' },
  { id: '5', type: 'expense', description: 'Aluguel de Betoneira', amount: 5000, date: '2023-10-10', category: 'Equipamentos', status: 'paid' },
];

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Financeiro</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gestão de fluxo de caixa e DRE</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#C19A42] hover:bg-[#b08b3a] text-black px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-[#171717]/80 backdrop-blur-2xl border border-white/5 rounded-2xl w-full md:w-fit mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all relative",
            activeTab === 'overview' ? "text-black" : "text-slate-400 hover:text-white"
          )}
        >
          {activeTab === 'overview' && (
            <motion.div
              layoutId="financeTab"
              className="absolute inset-0 bg-[#C19A42] rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Visão Geral</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all relative",
            activeTab === 'transactions' ? "text-black" : "text-slate-400 hover:text-white"
          )}
        >
          {activeTab === 'transactions' && (
            <motion.div
              layoutId="financeTab"
              className="absolute inset-0 bg-[#C19A42] rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Transações</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Saldo em Caixa"
                value="R$ 1.250.000"
                trend="+12%"
                trendUp={true}
                icon={Wallet}
                color="gold"
              />
              <StatCard
                title="Receitas (Mês)"
                value="R$ 450.000"
                trend="+5%"
                trendUp={true}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Despesas (Mês)"
                value="R$ 280.000"
                trend="-2%"
                trendUp={false}
                icon={TrendingDown}
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* DRE Chart */}
              <div className="lg:col-span-2 bg-[#171717]/80 border border-white/5 rounded-[24px] p-6 backdrop-blur-2xl shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#F5F5F7]">Receitas x Despesas</h3>
                  <select className="bg-[#2A2A2A] border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#C19A42]">
                    <option>2023</option>
                    <option>2022</option>
                  </select>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DRE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2A2A2A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F5F7', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#F5F5F7' }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="receitas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" />
                      <Area type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCustos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expenses by Category */}
              <div className="bg-[#171717]/80 border border-white/5 rounded-[24px] p-6 backdrop-blur-2xl shadow-xl shadow-black/20 flex flex-col">
                <h3 className="text-lg font-semibold text-[#F5F5F7] mb-6">Despesas por Categoria</h3>
                <div className="flex-1 min-h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={EXPENSES_BY_CATEGORY}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {EXPENSES_BY_CATEGORY.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2A2A2A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F5F7', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-xs text-slate-400">Total</span>
                    <span className="text-lg font-bold text-[#F5F5F7]">R$ 280k</span>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {EXPENSES_BY_CATEGORY.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-300">{cat.name}</span>
                      </div>
                      <span className="font-medium text-[#F5F5F7]">R$ {(cat.value / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  className="w-full bg-[#171717]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[#F5F5F7] placeholder:text-slate-500 focus:outline-none focus:border-[#C19A42] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select className="bg-[#171717]/80 border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors">
                  <option value="all">Todas Categorias</option>
                  <option value="materiais">Materiais</option>
                  <option value="servicos">Serviços</option>
                  <option value="maodeobra">Mão de Obra</option>
                </select>
                <select className="bg-[#171717]/80 border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors">
                  <option value="all">Status</option>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-[#171717]/80 border border-white/5 rounded-[24px] overflow-hidden backdrop-blur-2xl shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-sm">
                      <th className="p-4 font-medium">Descrição</th>
                      <th className="p-4 font-medium">Categoria</th>
                      <th className="p-4 font-medium">Data</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Valor</th>
                      <th className="p-4 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={t.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              t.type === 'income' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                            )}>
                              {t.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                              <p className="font-medium text-[#F5F5F7]">{t.description}</p>
                              <p className="text-xs text-slate-400 md:hidden">{t.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-slate-300 text-sm">{t.category}</td>
                        <td className="p-4 text-slate-300 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-500" />
                            {new Date(t.date).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border",
                            t.status === 'paid'
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className={cn(
                          "p-4 text-right font-semibold whitespace-nowrap",
                          t.type === 'income' ? "text-blue-400" : "text-red-400"
                        )}>
                          {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#171717] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-[#F5F5F7]">Nova Transação</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                {/* Type Selection */}
                <div className="flex gap-2 p-1 bg-[#2A2A2A] rounded-xl">
                  <button className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-medium text-sm border border-blue-500/30">
                    Receita
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-medium text-sm transition-colors">
                    Despesa
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor (R$)</label>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-3 text-2xl font-semibold text-[#F5F5F7] placeholder:text-slate-600 focus:outline-none focus:border-[#C19A42] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
                    <input
                      type="text"
                      placeholder="Ex: Pagamento Cliente X"
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] placeholder:text-slate-500 focus:outline-none focus:border-[#C19A42] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Data</label>
                      <input
                        type="date"
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
                      <select className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors appearance-none">
                        <option>Serviços</option>
                        <option>Materiais</option>
                        <option>Mão de Obra</option>
                        <option>Equipamentos</option>
                        <option>Impostos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" defaultChecked className="accent-[#C19A42]" />
                        <span className="text-[#F5F5F7] text-sm">Pago/Recebido</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" className="accent-[#C19A42]" />
                        <span className="text-[#F5F5F7] text-sm">Pendente</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 shrink-0 flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-[#C19A42] text-black hover:bg-[#b08b3a] transition-colors shadow-lg shadow-[#C19A42]/20"
                >
                  Salvar Transação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: any) => {
  const colorMap: Record<string, string> = {
    gold: "text-[#C19A42] bg-[#C19A42]/10 border border-[#C19A42]/20",
    blue: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
    red: "text-red-400 bg-red-500/10 border border-red-500/20",
  };

  return (
    <div className="bg-[#171717]/80 border border-white/5 rounded-[24px] p-6 backdrop-blur-2xl flex flex-col shadow-xl shadow-black/20">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", colorMap[color])}>
          <Icon size={24} />
        </div>
        <span className={cn(
          "text-xs font-semibold px-3 py-1.5 rounded-lg border",
          trendUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        )}>
          {trend}
        </span>
      </div>
      <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-[#F5F5F7] mt-1 tracking-tight">{value}</p>
    </div>
  );
};
