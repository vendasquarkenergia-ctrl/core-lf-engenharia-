import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Users, Briefcase, TrendingUp, TrendingDown, Filter, FileText, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../../core/components/layout/MainLayout';

const CRM_PHASES = ['Contato Inicial', 'Visita Técnica', 'Orçamento Enviado', 'Contrato Assinado'];

const MOCK_PIPELINE = [
  { id: 1, client: 'Grupo Alpha', project: 'Sede Corporativa', phase: 'Contato Inicial', vgv: 15000000, probability: 20 },
  { id: 2, client: 'Construtora Beta', project: 'Residencial', phase: 'Visita Técnica', vgv: 8500000, probability: 40 },
  { id: 3, client: 'Logística SP', project: 'Galpão 3', phase: 'Orçamento Enviado', vgv: 2100000, probability: 70 },
  { id: 4, client: 'Investidor PR', project: 'Prédio Misto', phase: 'Contrato Assinado', vgv: 34000000, probability: 100 },
  { id: 5, client: 'Tech Hub', project: 'Escritórios', phase: 'Orçamento Enviado', vgv: 4500000, probability: 65 },
];

const MOCK_CASHFLOW = [
  { id: 1, date: '17/04/2026', description: 'Medição #04 - Condomínio Vale', type: 'entrada', amount: 450000.00, status: 'Pago', obra: 'Condomínio Vale' },
  { id: 2, date: '16/04/2026', description: 'NF-e 1042 - Votorantim (Cimento)', type: 'saida', amount: 85400.50, status: 'Liquidado', obra: 'Edifício Alpha' },
  { id: 3, date: '15/04/2026', description: 'Folha de Pgmto - Abril', type: 'saida', amount: 210500.00, status: 'Liquidado', obra: 'Rateio Geral' },
  { id: 4, date: '12/04/2026', description: 'Adiantamento Cliente - Sede SP', type: 'entrada', amount: 1200000.00, status: 'Pago', obra: 'Sede Corporativa' },
  { id: 5, date: '10/04/2026', description: 'Aluguel Grua Mensal', type: 'saida', amount: 45000.00, status: 'Aberto', obra: 'Edifício Alpha' },
];

const healthData = [
  { name: 'Margem Realizada', value: 22, color: '#10B981' }, // Verde Vibrante
  { name: 'Custos/Despesas', value: 78, color: '#334155' } // Slate Escuro
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const FinancasCRM = () => {
  const [activeTab, setActiveTab] = useState<'crm' | 'fluxo'>('crm');

  return (
    <div className="space-y-6">
      {/* HEADER & HEALTH SCORE */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex-1">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Motor Financeiro & Comercial</h1>
            <p className="text-slate-400">Gestão de funil de vendas, medições e balancete de fluxo de caixa.</p>
          </header>
        
          <div className="flex bg-lf-surface border border-white/5 p-1 rounded-md w-fit">
            <button 
              onClick={() => setActiveTab('crm')} 
              className={cn("px-5 py-2 font-medium text-sm rounded-md transition-all flex items-center gap-2", activeTab === 'crm' ? "bg-white/10 text-white shadow" : "text-slate-400 hover:text-white")}
            >
              <Users size={16} /> Pipeline (CRM)
            </button>
            <button 
              onClick={() => setActiveTab('fluxo')} 
              className={cn("px-5 py-2 font-medium text-sm rounded-md transition-all flex items-center gap-2", activeTab === 'fluxo' ? "bg-white/10 text-white shadow" : "text-slate-400 hover:text-white")}
            >
              <Wallet size={16} /> Fluxo de Caixa
            </button>
          </div>
        </div>

        {/* Health Score KPI */}
        <div className="xl:w-80 bg-lf-surface border border-white/5 rounded-xl p-5 shadow-xl flex items-center gap-6">
          <div className="w-24 h-24 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={35} outerRadius={48} paddingAngle={2} dataKey="value" stroke="none">
                    {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)'}} itemStyle={{color: '#fff', fontSize: '12px'}} formatter={(val) => `${val}%`}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-xs font-bold text-white">22%</span>
              </div>
          </div>
          <div className="flex-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Health Score</h3>
              <p className="text-xl font-bold text-emerald-400 font-mono tracking-tight leading-none">Saudável</p>
              <p className="text-[10px] text-slate-500 mt-2 leading-snug">Lucro Líquido Realizado<br/>vs. Projetado (25%)</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PIPELINE CRM */}
        {activeTab === 'crm' && (
          <motion.div
            key="crm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-4 overflow-x-auto custom-scrollbar pb-4"
          >
            {CRM_PHASES.map((phase) => (
              <div key={phase} className="flex-1 min-w-[280px] bg-lf-surface/40 border border-white/5 rounded-xl flex flex-col p-3">
                <div className="flex items-center justify-between px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-300">{phase}</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                      {MOCK_PIPELINE.filter(p => p.phase === phase).length}
                    </span>
                </div>
                <div className="flex flex-col gap-3">
                    {MOCK_PIPELINE.filter(p => p.phase === phase).map(item => (
                      <motion.div key={item.id} layoutId={`crm-card-${item.id}`} className="bg-lf-surface border border-white/5 rounded-lg p-4 shadow-md hover:border-lf-gold/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-white text-sm group-hover:text-lf-gold transition-colors">{item.client}</h4>
                          <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">{item.probability}%</div>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4"><Briefcase size={12}/> {item.project}</p>
                        <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">VGV Projetado</span>
                          <span className="text-sm font-mono font-bold text-white tracking-tight">{formatCurrency(item.vgv)}</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 2: FLUXO DE CAIXA */}
        {activeTab === 'fluxo' && (
          <motion.div
            key="fluxo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-lf-surface border border-white/5 rounded-xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="font-semibold text-white">Balancete Executivo</h3>
              <button className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-white/5 border border-white/10 transition-colors">
                <Filter size={14} /> Filtros
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-3 px-4 w-28">Data</th>
                    <th className="py-3 px-4">Descrição / Histórico</th>
                    <th className="py-3 px-4">Centro de Custo</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {MOCK_CASHFLOW.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-400">{tx.date}</td>
                      <td className="py-3.5 px-4 text-white font-medium flex items-center gap-2.5">
                          <div className={cn("p-1 rounded bg-opacity-10 border", tx.type === 'entrada' ? "bg-emerald-500 border-emerald-500/20" : "bg-red-500 border-red-500/20")}>
                              {tx.type === 'entrada' ? <ArrowUpRight size={14} className="text-emerald-500"/> : <ArrowDownRight size={14} className="text-red-500"/>}
                          </div>
                          {tx.description}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">{tx.obra}</td>
                      <td className="py-3.5 px-4 text-center text-[11px] uppercase tracking-wide">
                          {tx.status === 'Pago' || tx.status === 'Liquidado' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                              <CheckCircle2 size={12}/> {tx.status}
                            </span>
                          ) : (
                            <span className="inline-flex text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                              {tx.status}
                            </span>
                          )}
                      </td>
                      <td className={cn("py-3.5 px-4 text-right font-mono font-bold tracking-tight text-sm", tx.type === 'entrada' ? 'text-emerald-400' : 'text-red-400')}>
                        {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Resumo Rodapé */}
            <div className="bg-lf-bg p-4 border-t border-white/5 flex justify-end gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Entradas</p>
                  <p className="font-mono text-emerald-400 font-bold text-sm tracking-tight">{formatCurrency(1650000.00)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Saídas</p>
                  <p className="font-mono text-red-400 font-bold text-sm tracking-tight">{formatCurrency(340900.50)}</p>
                </div>
                <div className="text-right px-4 border-l border-white/10">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Saldo Final</p>
                  <p className="font-mono text-white font-bold text-lg tracking-tight">{formatCurrency(1309099.50)}</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
