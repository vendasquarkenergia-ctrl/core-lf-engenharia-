import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, TrendingUp, TrendingDown, Users, AlertCircle, 
  Search, Clock, ArrowUpRight, BarChart2, BellRing, Target, HardHat, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend 
} from 'recharts';
import { cn } from '../../../core/components/layout/MainLayout';

// ==========================================================
// MOCK DATA: COMMAND CENTER
// ==========================================================
const dashboardData = {
  macroFinance: {
    vgvExecucao: 284500000,
    burnRate: 42.5,
    maoDeObraHoje: 412,
    comprasPendentes: 14 // 14 Notas fiscais
  },
  obrasRadar: [
    { name: 'Fundações', count: 2, fill: '#10B981' }, // Verde
    { name: 'Estrutura', count: 4, fill: '#C89B3C' }, // Dourado
    { name: 'Acabamento', count: 1, fill: '#0E3A7E' }, // Azul Escuro
  ],
  obrasCriticas: [
    { id: '1', name: 'Edifício Horizon', status: 'atrasado', diff: '-12 dias' },
    { id: '2', name: 'Complexo Logístico BR', status: 'alerta', diff: '-2 dias' },
    { id: '3', name: 'Residencial Alpha', status: 'alerta', diff: '-1 dia' },
  ],
  efetivoEvolucao: [
    { dia: '01/04', efetivo: 380 }, { dia: '05/04', efetivo: 390 },
    { dia: '10/04', efetivo: 385 }, { dia: '15/04', efetivo: 410 },
    { dia: '20/04', efetivo: 412 },
  ],
  feedAlertas: [
    { id: 1, type: 'danger', icon: AlertCircle, text: 'Obra Alpha: RDO de ontem não enviado.', time: 'Há 10 min' },
    { id: 2, type: 'warning', icon: BellRing, text: 'Suprimentos: Compra de Aço da Obra Beta bloqueada (Acima da Curva ABC).', time: 'Há 45 min' },
    { id: 3, type: 'success', icon: FileText, text: 'Projeto Elétrico "Corporate Tower" revisado e aprovado.', time: 'Há 2h' },
    { id: 4, type: 'info', icon: Users, text: 'Efetivo recorde: 412 operários em campo hoje.', time: 'Há 3h' },
  ]
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
};

// ==========================================================
// SUBCOMPONENTS
// ==========================================================

const KpiCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, isWarning = false }: any) => (
  <div className="bg-lf-surface border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
    <div className="flex justify-between items-start mb-2">
      <div className={cn("p-2.5 rounded-xl border", isWarning ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-lf-gold/10 text-lf-gold border-lf-gold/20")}>
        <Icon size={20} className={isWarning ? "text-red-500" : "text-lf-gold"} />
      </div>
      {trend && (
        <span className={cn("text-xs font-bold px-2 py-1 rounded-md border", trendUp ? "bg-lf-green/10 text-lf-green border-lf-green/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-sm font-bold text-lf-muted uppercase tracking-widest">{title}</h3>
      <p className={cn("text-2xl lg:text-3xl font-black mt-1 tracking-tight", isWarning ? "text-red-500" : "text-white")}>{value}</p>
      {subtitle && <p className="text-xs text-lf-muted mt-1 font-semibold">{subtitle}</p>}
    </div>
  </div>
);

// ==========================================================
// MAIN COMPONENT
// ==========================================================
export const DashboardPage = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen space-y-6 pb-8">
      
      {/* 1. TOP BAR (Header & Search) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-lf-bg/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Target className="text-lf-gold" size={28} />
            Command Center
          </h1>
          <div className="flex items-center gap-2 text-lf-muted mt-1.5 font-bold text-xs uppercase tracking-widest">
            <Clock size={14} />
            <span>{time.toLocaleDateString('pt-BR')} • {time.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lf-muted" size={18} />
          <input 
            type="text" 
            placeholder="Buscar obras, NFs, clientes..." 
            className="w-full bg-lf-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder-lf-muted focus:outline-none focus:border-lf-gold transition-colors"
          />
        </div>
      </header>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ROW 1: MACRO FINANCEIRO (span-full for 4 cards) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <KpiCard 
             title="VGV em Execução" 
             value={formatCurrency(dashboardData.macroFinance.vgvExecucao)} 
             icon={TrendingUp} 
             trend="+1.2%" trendUp={true}
           />
           <KpiCard 
             title="Burn Rate Total" 
             value={`${dashboardData.macroFinance.burnRate}%`} 
             subtitle="Do orçamento total aprovado"
             icon={BarChart2} 
           />
           <KpiCard 
             title="Efetivo Hoje" 
             value={dashboardData.macroFinance.maoDeObraHoje} 
             subtitle="Operários em campo sincronizados"
             icon={HardHat} 
             trend="+22" trendUp={true}
           />
           <KpiCard 
             title="Aprovações Pendentes" 
             value={dashboardData.macroFinance.comprasPendentes} 
             subtitle="NFs aguardando diretoria"
             icon={FileText} 
             isWarning={dashboardData.macroFinance.comprasPendentes > 10}
           />
        </div>

        {/* ROW 2: ESQUERDA (Radar de Obras) - Ocupa 2/4 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Radar Dashboard */}
          <div className="bg-lf-surface border border-white/5 rounded-[24px] p-6 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-black text-white uppercase tracking-wide">Radar de Obras</h2>
               <button className="text-xs font-bold text-lf-gold bg-lf-gold/10 px-3 py-1.5 rounded-lg border border-lf-gold/20 hover:bg-lf-gold/20 transition-colors">
                  Ver Kanban Completo
               </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 h-[200px]">
              {/* Gráfico Radial */}
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={15} 
                    data={dashboardData.obrasRadar} startAngle={90} endAngle={-270}
                  >
                    <RadialBar background clockWise dataKey="count" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                {/* Custom Overlay (Center) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">7</span>
                    <span className="block text-[10px] font-bold text-lf-muted uppercase tracking-widest mt-0.5">Ativas</span>
                  </div>
                </div>
              </div>
              
              {/* Legenda Lateral */}
              <div className="flex-1 flex flex-col justify-center gap-3">
                {dashboardData.obrasRadar.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                       <span className="text-xs font-bold text-lf-muted uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Obras Críticas */}
          <div className="bg-lf-surface border border-white/5 rounded-[24px] p-6 shadow-xl">
             <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4">Atenção Crítica (Atraso)</h2>
             <div className="space-y-3">
               {dashboardData.obrasCriticas.map(obra => (
                 <div key={obra.id} className="flex items-center justify-between p-3 bg-lf-bg border border-white/5 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", obra.status === 'atrasado' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")}>
                        <Building2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-white">{obra.name}</span>
                   </div>
                   <div className={cn("text-xs font-bold px-2 py-1 rounded-md border", obra.status === 'atrasado' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20")}>
                      {obra.diff}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* ROW 2: DIREITA (Feed e Gráfico) - Ocupa 2/4 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Gráfico de Efetivo (Área) */}
          <div className="bg-lf-surface border border-white/5 rounded-[24px] p-6 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-6">Evolução de Mão de Obra (30d)</h2>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.efetivoEvolucao} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEfetivo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-lf-gold)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-lf-gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis tick={{fill: '#8892B0', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--lf-surface)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: 'var(--color-lf-gold)', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="efetivo" stroke="var(--color-lf-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorEfetivo)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feed de Alertas do Sistema */}
          <div className="glass-panel rounded-[24px] p-6 shadow-xl flex-1 flex flex-col">
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4">Feed de Operações</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[300px]">
              {dashboardData.feedAlertas.map(alerta => {
                const Icon = alerta.icon;
                const colors: Record<string, string> = {
                  danger: "bg-red-500/10 text-red-500 border-red-500/20",
                  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  success: "bg-lf-green/10 text-lf-green border-lf-green/20",
                  info: "bg-lf-gold/10 text-lf-gold border-lf-gold/20"
                };
                
                return (
                  <div key={alerta.id} className="relative pl-4">
                    {/* Timeline Line */}
                    <div className="absolute left-[7px] top-6 bottom-[-16px] w-[2px] bg-white/5" />
                    <div className="flex gap-3 relative">
                      <div className={cn("w-4 h-4 rounded-full mt-1 shrink-0 flex items-center justify-center border", colors[alerta.type])} />
                      <div className="flex-1 bg-lf-bg border border-white/5 p-3 rounded-xl">
                        <p className="text-sm font-semibold text-white leading-snug">{alerta.text}</p>
                        <span className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mt-2 block">{alerta.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};