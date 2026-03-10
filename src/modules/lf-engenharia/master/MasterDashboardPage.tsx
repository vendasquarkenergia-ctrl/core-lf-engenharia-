import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown,
  Filter,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';

// --- MOCK DATA ---
const MOCK_FINANCIAL_DATA = [
  { month: 'Jan', receitas: 450000, custos: 320000 },
  { month: 'Fev', receitas: 380000, custos: 290000 },
  { month: 'Mar', receitas: 520000, custos: 380000 },
  { month: 'Abr', receitas: 490000, custos: 410000 },
  { month: 'Mai', receitas: 610000, custos: 450000 },
  { month: 'Jun', receitas: 580000, custos: 420000 },
  { month: 'Jul', receitas: 720000, custos: 480000 },
  { month: 'Ago', receitas: 680000, custos: 470000 },
  { month: 'Set', receitas: 810000, custos: 510000 },
  { month: 'Out', receitas: 790000, custos: 530000 },
  { month: 'Nov', receitas: 890000, custos: 580000 },
  { month: 'Dez', receitas: 1050000, custos: 620000 },
];

const MOCK_TASKS_DATA = [
  { name: 'Aurora', concluidas: 45, atrasadas: 12 },
  { name: 'Horizonte', concluidas: 32, atrasadas: 5 },
  { name: 'Vale Verde', concluidas: 28, atrasadas: 18 },
  { name: 'Logístico', concluidas: 56, atrasadas: 2 },
  { name: 'Corporate', concluidas: 74, atrasadas: 8 },
];

const MOCK_ALERTS = [
  { id: 1, type: 'critical', message: 'Obra Residencial Aurora estourou o orçamento de materiais em 15%.', time: 'Há 2h', target: 'Financeiro' },
  { id: 2, type: 'warning', message: 'Tarefa crítica atrasada com João Mestre há 3 dias (Edifício Horizonte).', time: 'Há 5h', target: 'Operacional' },
  { id: 5, type: 'critical', message: 'Licença ambiental do Condomínio Vale Verde expira em 5 dias.', time: 'Há 7h', target: 'Compliance' },
  { id: 3, type: 'info', message: 'Medição da Caixa Econômica aprovada (Condomínio Vale Verde).', time: 'Ontem', target: 'Financeiro' },
  { id: 4, type: 'warning', message: 'RDO não preenchido na obra Galpão Logístico pelo 2º dia consecutivo.', time: 'Ontem', target: 'Qualidade' },
  { id: 6, type: 'info', message: 'Concretagem da laje nível 4 finalizada no Prazo (Corporate).', time: '2 dias atrás', target: 'Engenharia' },
];

const MOCK_LOCATIONS = [
  { id: 1, name: 'Residencial Aurora', lat: -23.5505, lng: -46.6333, status: 'on-track' },
  { id: 2, name: 'Edifício Horizonte', lat: -23.5615, lng: -46.6500, status: 'delayed' },
  { id: 3, name: 'Condomínio Vale Verde', lat: -23.5420, lng: -46.6811, status: 'on-track' },
  { id: 4, name: 'Corporate Building', lat: -23.5899, lng: -46.6711, status: 'on-track' }
];

// --- COMPONENTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export const MasterDashboardPage = () => {
  const [selectedObra, setSelectedObra] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] font-sans selection:bg-[#C19A42]/30 p-4 md:p-8 overflow-x-hidden pb-32 md:pb-8">
      <motion.div
        className="max-w-[1600px] mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* 1. GLOBAL HEADER (Filtros) */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-[#C19A42] rounded-full blur-[2px]" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Master Dashboard</h1>
            </div>
            <p className="text-[#a1a1aa] mt-1 text-sm md:text-base font-medium tracking-wide">Visão executiva consolidada de alto nível</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto overflow-hidden rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                <Building2 size={16} className="text-[#a1a1aa]" />
              </div>
              <select
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value)}
                className="relative w-full sm:w-auto bg-[#121212]/90 backdrop-blur-3xl text-white text-sm font-medium rounded-2xl pl-10 pr-10 py-2.5 appearance-none outline-none hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] transition-all cursor-pointer"
              >
                <option value="all">Todas as Obras</option>
                <option value="aurora">Residencial Aurora</option>
                <option value="horizonte">Edifício Horizonte</option>
                <option value="vale">Condomínio Vale Verde</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none z-10">
                <ChevronDown size={16} className="text-[#a1a1aa]" />
              </div>
            </div>

            <div className="relative w-full sm:w-auto overflow-hidden rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                <Filter size={16} className="text-[#a1a1aa]" />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="relative w-full sm:w-auto bg-[#121212]/90 backdrop-blur-3xl text-white text-sm font-medium rounded-2xl pl-10 pr-10 py-2.5 appearance-none outline-none hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] transition-all cursor-pointer"
              >
                <option value="1m">Este Mês</option>
                <option value="3m">Últimos 3 Meses</option>
                <option value="1y">Este Ano</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none z-10">
                <ChevronDown size={16} className="text-[#a1a1aa]" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* 2. TOP LEVEL KPIs (Bento Box Grid) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* KPI 1: Caixa Total */}
          <div className="group relative bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-white/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C19A42]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#C19A42]/20 to-[#C19A42]/5 border border-[#C19A42]/20 text-[#C19A42] shadow-[0_0_15px_rgba(193,154,66,0.2)]">
                <Wallet size={20} className="stroke-[2.5px]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 flex items-center gap-1.5 backdrop-blur-md">
                <TrendingUp size={12} className="stroke-[3px]" /> 8.4%
              </span>
            </div>
            <h4 className="text-[#a1a1aa] text-sm font-medium tracking-wide relative z-10">Caixa Total Consolidado</h4>
            <p className="text-4xl font-bold text-white mt-2 tracking-tighter relative z-10">
              R$ 3.45<span className="text-2xl text-[#a1a1aa] ml-0.5">M</span>
            </p>

            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.15] pointer-events-none group-hover:opacity-30 transition-opacity duration-500">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_FINANCIAL_DATA.slice(-6)}>
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C19A42" stopOpacity={1} />
                      <stop offset="100%" stopColor="#C19A42" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="receitas" stroke="#C19A42" strokeWidth={3} fill="url(#sparklineGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 2: Desvio de Orçamento */}
          <div className="group relative bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-white/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/20 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <TrendingDown size={20} className="stroke-[2.5px]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 backdrop-blur-md">
                Saudável
              </span>
            </div>
            <h4 className="text-[#a1a1aa] text-sm font-medium tracking-wide relative z-10">Desvio de Orçamento</h4>
            <div className="flex items-baseline gap-2 mt-2 relative z-10">
              <p className="text-4xl font-bold text-white tracking-tighter">-2.1%</p>
              <p className="text-xs text-[#a1a1aa] font-medium tracking-wide uppercase">previsto</p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full w-[95%]" />
            </div>
          </div>

          {/* KPI 3: Obras Ativas */}
          <div className="group relative bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-white/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 text-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Building2 size={20} className="stroke-[2.5px]" />
              </div>
            </div>
            <h4 className="text-[#a1a1aa] text-sm font-medium tracking-wide relative z-10">Obras Ativas</h4>
            <div className="flex items-center justify-between mt-2 relative z-10">
              <p className="text-4xl font-bold text-white tracking-tighter">4</p>
              <div className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-widest text-right">
                <span className="text-[#10b981] flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> 3 on-time</span>
                <span className="text-[#ef4444] flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> 1 atrasada</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Índice de RDOs */}
          <div className="group relative bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-white/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 border border-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <FileText size={20} className="stroke-[2.5px]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 backdrop-blur-md">
                Atenção
              </span>
            </div>
            <h4 className="text-[#a1a1aa] text-sm font-medium tracking-wide relative z-10">Cobertura de RDO</h4>
            <div className="flex items-center gap-4 mt-2 relative z-10">
              <p className="text-4xl font-bold text-white tracking-tighter">85<span className="text-2xl text-[#a1a1aa] ml-0.5">%</span></p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] rounded-full w-[85%]" />
            </div>
          </div>
        </motion.div>

        {/* 3. BENTO BOX GRID: GRÁFICOS & FEED (Asymmetric) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 grid-rows-[auto_auto] gap-4 md:gap-6 mt-6">

          {/* Gráfico Principal: Receitas vs Custos (Col: span 3, Row: 1) */}
          <motion.div variants={itemVariants} className="xl:col-span-3 bg-[#0f0f0f]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Receitas vs Custos</h3>
                <p className="text-sm text-[#a1a1aa] font-medium tracking-wide mt-1">Visão consolidada do fluxo financeiro anual</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C19A42]" />
                  <span className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider">Custos</span>
                </div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_FINANCIAL_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceitasMaster" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C19A42" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C19A42" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCustosMaster" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* Clean aesthetics: no grid except highly transparent horizontal ones */}
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />

                  {/* Hide axis lines and ticks, clean text */}
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="#71717a" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} dx={-10} />

                  {/* Premium glassmorphism tooltip */}
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 10, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                      padding: '16px 20px'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '15px', fontWeight: 600, padding: '4px 0' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                    formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />

                  <Area type="monotone" dataKey="receitas" stroke="#C19A42" strokeWidth={4} fillOpacity={1} fill="url(#colorReceitasMaster)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#121212', fill: '#C19A42' }} />
                  <Area type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCustosMaster)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#121212', fill: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Feed de Alertas Críticos (Col: span 1, Row: span 3) */}
          <motion.div variants={itemVariants} className="xl:col-span-1 xl:row-span-3 bg-[#0f0f0f]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-white tracking-tight">Alertas</h3>
              <span className="bg-[#ef4444]/15 text-[#ef4444] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#ef4444]/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {MOCK_ALERTS.filter(a => a.type === 'critical' || a.type === 'warning').length} Críticos
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar -mr-2 pb-4">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id} className="relative flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-b from-[#1a1a1a]/50 to-[#121212]/50 border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]/80 transition-all duration-300 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {alert.type === 'critical' && <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                      {alert.type === 'warning' && <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
                      {alert.type === 'info' && <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa]">{alert.target}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#71717a] whitespace-nowrap">{alert.time}</span>
                  </div>

                  <p className="text-[13px] text-white/80 font-medium leading-relaxed group-hover:text-white transition-colors">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gráfico Secundário: Status de Tarefas (Col: span 3, Row: 2) */}
          <motion.div variants={itemVariants} className="xl:col-span-3 bg-[#0f0f0f]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Status de Tarefas por Obra</h3>
                <p className="text-sm text-[#a1a1aa] font-medium tracking-wide mt-1">Análise de gargalos e pendências operacionais</p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TASKS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={0}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="#71717a" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} dx={-10} />

                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 10, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                      padding: '16px 20px'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '15px', fontWeight: 600, padding: '4px 0' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                  />

                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }}
                  />

                  <Bar dataKey="concluidas" name="Concluídas no Prazo" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="atrasadas" name="Atrasadas / Pendentes" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Mapa Logístico (Col: span 3, Row: 3) */}
          <motion.div variants={itemVariants} className="xl:col-span-3 bg-[#0f0f0f]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  <MapPin size={20} className="text-[#C19A42]" />
                  Logística Operacional
                </h3>
                <p className="text-sm text-[#a1a1aa] font-medium tracking-wide mt-1">Geolocalização das obras ativas e recebimento de materiais</p>
              </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative z-0">
              {/* Using a CartoDB Dark Matter tile layer for a premium dark mode look */}
              <MapContainer
                center={[-23.56, -46.65]}
                zoom={12}
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {MOCK_LOCATIONS.map(loc => (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                    <Popup className="premium-popup">
                      <div className="p-1">
                        <p className="font-bold text-[#121212] mb-1">{loc.name}</p>
                        <span className={loc.status === 'delayed' ? 'text-red-600 font-medium text-xs' : 'text-emerald-600 font-medium text-xs'}>
                          {loc.status === 'delayed' ? 'Atrasada' : 'No Prazo'}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Custom Premium Leaflet CSS Overrides injected just for this component */}
            <style dangerouslySetInnerHTML={{
              __html: `
              .leaflet-container { font-family: 'Inter', sans-serif; }
              .premium-popup .leaflet-popup-content-wrapper { background: #f5f5f7; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
              .premium-popup .leaflet-popup-tip { border-top-color: #f5f5f7; }
              .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: #a1a1aa !important; }
              .leaflet-control-attribution a { color: #C19A42 !important; }
            `}} />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

