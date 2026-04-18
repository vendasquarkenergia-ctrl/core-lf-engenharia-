import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, AlertTriangle, CloudRain, Clock, Users, DollarSign, Target, ShieldAlert, Activity, CheckCircle2, Factory, Sun, TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell, CartesianGrid } from 'recharts';
import { cn } from '../../../core/components/layout/MainLayout';

// ==========================================
// MOCK DATA (Extremamente realista)
// ==========================================
const dashboardData = {
  kpis: {
    faturamentoPrevisto: 14500000.00,
    despesasComprometidas: 9850000.00,
    margemGlobal: 32.0,
    trabalhadores: 420
  },
  obras: [
    { id: 1, name: 'Corporate Tower', eng: 'Eng. Carlos', progress: 78, weather: 'Sol 28º', weatherIcon: 'sol', lat: 25, lng: 70, status: 'saudavel' },
    { id: 2, name: 'Residencial Grand Jardim', eng: 'Eng. Roberto', progress: 45, weather: 'Tempestade', weatherIcon: 'chuva', lat: 45, lng: 40, status: 'alerta' },
    { id: 3, name: 'Complexo Logístico', eng: 'Engª. Amanda', progress: 12, weather: 'Nublado 22º', weatherIcon: 'nublado', lat: 60, lng: 75, status: 'critico' },
    { id: 4, name: 'Hospital Central', eng: 'Eng. Marcos', progress: 92, weather: 'Sol 25º', weatherIcon: 'sol', lat: 55, lng: 20, status: 'saudavel' },
  ],
  radar: [
    { id: 1, type: 'alerta', icon: CloudRain, title: 'Obra Grand Jardim', text: 'Previsão de Tempestade amanhã. Risco na concretagem da laje 12.', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 2, type: 'critico', icon: ShieldAlert, title: 'Complexo Logístico', text: 'Solicitação de Aço estrutural ultrapassou a Curva ABC do orçamento em 15%.', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 3, type: 'aviso', icon: Clock, title: 'Corporate Tower', text: 'RDO de ontem não foi enviado pelo Mestre responsável até o momento.', color: 'text-lf-gold', bg: 'bg-lf-gold/10', border: 'border-lf-gold/20' },
  ],
  financeChart: [
    { mes: 'Jan', burnRate: 15, avanco: 15 },
    { mes: 'Fev', burnRate: 30, avanco: 28 },
    { mes: 'Mar', burnRate: 45, avanco: 45 },
    { mes: 'Abr', burnRate: 65, avanco: 52 }, // Burn Rate crosses above physical (Hemorrhage)
    { mes: 'Mai', burnRate: 75, avanco: 70 },
    { mes: 'Jun', burnRate: 85, avanco: 88 },
  ],
  workforceChart: [
    { name: 'Própria', value: 280, color: '#10B981' },
    { name: 'Terceirizada', value: 140, color: '#334155' }
  ]
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
};

// ==========================================
// MOCK MAP SYSTEM (TÁTICO)
// ==========================================
const TacticalMap = ({ obras }: { obras: typeof dashboardData.obras }) => {
  const [hoveredObra, setHoveredObra] = useState<number | null>(null);

  return (
    <div className="relative w-full h-[350px] bg-black/5 dark:bg-[#0A0F1C] rounded-[24px] border border-lf-border overflow-hidden flex items-center justify-center isolation-auto transition-colors">
      {/* Grid Pattern Effect */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--lf-border) 1px, transparent 1px), linear-gradient(90deg, var(--lf-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--lf-bg)_100%)] pointer-events-none transition-colors" />

      {/* Map Nodes (Obras) */}
      {obras.map((obra) => (
        <div key={obra.id} className="absolute" style={{ top: `${obra.lat}%`, left: `${obra.lng}%` }}>
          {/* Pulsing ring */}
          <div className={cn(
            "absolute -inset-4 rounded-full animate-ping opacity-20",
            obra.status === 'saudavel' ? "bg-lf-green" :
            obra.status === 'alerta' ? "bg-amber-500" : "bg-red-500"
          )} style={{ animationDuration: '3s' }} />
          
          {/* Pin */}
          <div 
            onMouseEnter={() => setHoveredObra(obra.id)}
            onMouseLeave={() => setHoveredObra(null)}
            className={cn(
               "relative z-10 w-4 h-4 rounded-full border-2 border-lf-surface shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer transition-transform hover:scale-150",
               obra.status === 'saudavel' ? "bg-lf-green shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
               obra.status === 'alerta' ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            )}
          />

          {/* Tooltip */}
          {hoveredObra === obra.id && (
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className="absolute z-50 bottom-full mb-3 -translate-x-1/2 left-1/2 w-64 bg-lf-surface/90 backdrop-blur-xl border border-lf-border rounded-xl p-4 shadow-2xl pointer-events-none"
            >
               <h4 className="text-lf-text font-bold text-sm tracking-tight mb-1">{obra.name}</h4>
               <p className="text-xs text-lf-muted mb-3">{obra.eng}</p>
               
               <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-black/5 dark:bg-black/30 rounded-md p-2 border border-lf-border">
                   <p className="text-[9px] uppercase tracking-wider text-lf-muted font-bold mb-1">Avanço</p>
                   <p className="text-lf-text font-mono font-bold flex items-center gap-1.5 hover:text-lf-green transition-colors">
                     <Target size={12}/> {obra.progress}%
                   </p>
                 </div>
                 <div className="bg-black/5 dark:bg-black/30 rounded-md p-2 border border-lf-border">
                   <p className="text-[9px] uppercase tracking-wider text-lf-muted font-bold mb-1">Clima</p>
                   <p className={cn("font-bold flex items-center gap-1.5", obra.weatherIcon === 'chuva' ? "text-amber-500" : "text-sky-500")}>
                     {obra.weatherIcon === 'chuva' ? <CloudRain size={12}/> : <Sun size={12}/>}
                     {obra.weather}
                   </p>
                 </div>
               </div>
            </motion.div>
          )}
        </div>
      ))}

      {/* Decorative compass/visor */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-30 text-[10px] font-mono text-lf-green uppercase font-bold tracking-[0.2em]">
        <Activity size={14} /> Sistema Tático Ativo
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
export const ExecutiveDashboard = () => {
  return (
    <div className="min-h-screen bg-lf-bg pb-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER ==================================================================== */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-lf-text uppercase flex items-center gap-3 transition-colors">
              <Factory className="text-lf-gold" size={28} />
              Command Center
            </h1>
            <p className="text-lf-muted text-sm font-medium mt-1 transition-colors">Visão Tática e Financeira Integrada (SaaS LF OS)</p>
          </div>
          <div className="flex items-center gap-3 bg-lf-surface border border-lf-border px-4 py-2 rounded-xl transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lf-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lf-green"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-lf-green tracking-widest uppercase">Live Sync</span>
          </div>
        </header>

        {/* TOP KPIs ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-lf-surface border border-lf-border rounded-[20px] p-6 shadow-xl relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-lf-text"><DollarSign size={80}/></div>
             <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Faturamento Previsto</p>
             <h2 className="text-3xl lg:text-4xl font-mono font-bold text-lf-text tracking-tighter transition-colors">{formatCurrency(dashboardData.kpis.faturamentoPrevisto)}</h2>
          </div>
          
          <div className="bg-lf-surface border border-red-500/20 rounded-[20px] p-6 shadow-xl relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500"><TrendingDown size={80}/></div>
             <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">Despesas Comprometidas</p>
             <h2 className="text-3xl lg:text-4xl font-mono font-bold text-red-500 tracking-tighter transition-colors">{formatCurrency(dashboardData.kpis.despesasComprometidas)}</h2>
          </div>

          <div className="bg-lf-surface border border-lf-gold/30 rounded-[20px] p-6 shadow-xl flex items-center justify-between transition-colors">
             <div>
                <p className="text-[11px] font-bold text-lf-gold uppercase tracking-widest mb-2">Margem Projetada</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl lg:text-5xl font-mono font-black text-lf-text tracking-tighter transition-colors">{dashboardData.kpis.margemGlobal}%</h2>
                  <span className="text-emerald-500 text-sm font-bold flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"><TrendingUp size={14} className="mr-1"/> +2.4%</span>
                </div>
             </div>
          </div>
        </div>

        {/* MIDDLE ROW: MAP (8) + RADAR (4) ========================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Tactical Map */}
          <div className="xl:col-span-8 bg-lf-surface border border-lf-border rounded-[32px] p-2 shadow-sm dark:shadow-2xl transition-colors">
             <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-lf-text flex items-center gap-2 transition-colors"><MapPin size={20} className="text-lf-muted"/> Implantação Tática</h3>
                   <p className="text-xs text-lf-muted font-medium mt-1 transition-colors">Geolocalização das obras ativas e status climático</p>
                </div>
             </div>
             <TacticalMap obras={dashboardData.obras} />
          </div>

          {/* Risk Radar */}
          <div className="xl:col-span-4 flex flex-col bg-lf-surface border border-lf-border rounded-[32px] overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
            <div className="p-6 pb-4 border-b border-lf-border bg-black/5 dark:bg-black/20">
               <h3 className="text-lg font-bold text-lf-text flex items-center gap-2 transition-colors"><ShieldAlert size={20} className="text-red-500"/> Radar de Risco</h3>
               <p className="text-xs text-lf-muted font-medium mt-1 transition-colors">Alertas autônomos do sistema</p>
            </div>
            
            <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {dashboardData.radar.map((alert) => {
                 const Icon = alert.icon;
                 return (
                   <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={alert.id} className={cn("p-4 rounded-2xl border backdrop-blur-sm", alert.bg, alert.border)}>
                      <div className="flex items-start gap-3">
                         <div className={cn("p-2 rounded-xl bg-white/50 dark:bg-black/20 shrink-0 shadow-sm", alert.color)}><Icon size={18}/></div>
                         <div>
                            <h4 className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", alert.color)}>{alert.title}</h4>
                            <p className="text-sm text-lf-text leading-snug transition-colors">{alert.text}</p>
                         </div>
                      </div>
                   </motion.div>
                 )
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: CHARTS (8) + WORKFORCE (4) ================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Burn Rate vs Physical Progress */}
          <div className="xl:col-span-8 bg-lf-surface border border-lf-border rounded-[32px] p-6 shadow-sm dark:shadow-2xl transition-colors">
             <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-lf-text flex items-center gap-2 transition-colors"><Activity size={20} className="text-lf-muted"/> Curva S (Burn Rate vs Avanço)</h3>
                  <p className="text-xs text-lf-muted font-medium mt-1 transition-colors">Hemorragia financeira ocorre se o Consumo (Área) cruzar acima do Avanço (Linha)</p>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                   <div className="flex items-center gap-1.5 text-red-500"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"/> Orçamento Gasto</div>
                   <div className="flex items-center gap-1.5 text-lf-green"><span className="w-3 h-3 rounded-full bg-lf-green"/> Avanço Físico</div>
                </div>
             </div>
             
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={dashboardData.financeChart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" vertical={false} />
                    <XAxis dataKey="mes" stroke="var(--lf-muted)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--lf-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      contentStyle={{backgroundColor: 'var(--lf-surface)', borderColor: 'var(--lf-border)', borderRadius: '12px', color: 'var(--lf-text)'}}
                      itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                    />
                    <Area type="monotone" dataKey="burnRate" name="Orçamento Consumido" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBurn)" />
                    <Line type="monotone" dataKey="avanco" name="Avanço Físico" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 2, stroke:'var(--lf-surface)'}}/>
                 </ComposedChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Realtime Workforce */}
          <div className="xl:col-span-4 bg-lf-surface border border-lf-border rounded-[32px] p-6 shadow-sm dark:shadow-2xl flex flex-col justify-center text-center relative overflow-hidden transition-colors">
             
             <div className="absolute top-0 right-0 opacity-[0.03] dark:opacity-5 -translate-y-4 translate-x-4 pointer-events-none text-lf-text">
                <Users size={200} />
             </div>

             <h3 className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-6 relative z-10 transition-colors">Pulso Operacional Global</h3>
             
             <div className="relative z-10 mb-8">
               <h2 className="text-7xl font-mono font-black text-lf-green tracking-tighter mb-2">{dashboardData.kpis.trabalhadores}</h2>
               <p className="text-lg font-bold text-lf-text tracking-tight transition-colors">Trabalhadores em Campo</p>
               <p className="text-xs text-lf-muted mt-1 transition-colors">Registrados via RDO (Hoje)</p>
             </div>

             <div className="h-12 w-full flex rounded-full overflow-hidden border border-lf-border relative z-10">
                <div className="bg-lf-green h-full flex items-center justify-center font-bold text-xs text-black" style={{ width: '66%' }}>
                   PRÓPRIA (280)
                </div>
                <div className="bg-slate-700 h-full flex items-center justify-center font-bold text-xs text-white" style={{ width: '34%' }}>
                   TERCEIROS (140)
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
