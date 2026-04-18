import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpRight, ArrowDownRight, 
  Search, Filter, CheckCircle2, XCircle, Clock, FileText, ChevronRight
} from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

const MOCK_FLUXO = [
  { id: '1', date: 'Hoje', desc: 'Medição #04 - Corporate Norte', category: 'Receita', val: 450000, type: 'in', status: 'pago' },
  { id: '2', date: 'Hoje', desc: 'Folha de Pagamento', category: 'RH', val: 84000, type: 'out', status: 'pago' },
  { id: '3', date: 'Ontem', desc: 'Concreto - Votorantim', category: 'Material', val: 32000, type: 'out', status: 'pago' },
  { id: '4', date: '12/04', desc: 'Sinal Cliente - Alpha', category: 'Receita', val: 150000, type: 'in', status: 'pago' },
];

const MOCK_APROVACOES = [
  { id: '1', obra: 'Edifício Horizon', desc: 'Aço CA50 10mm (5 Ton)', reqBy: 'Eng. Roberto', val: 42500, status: 'pendente' },
  { id: '2', obra: 'Residencial Alpha', desc: 'Locação Retroescavadeira (30d)', reqBy: 'Eng. Almeida', val: 12000, status: 'pendente' },
  { id: '3', obra: 'Corporate Norte', desc: 'Kit Porcelanato 90x90', reqBy: 'Eng. Felipe', val: 68000, status: 'pendente' },
];

export const CaixaMaster = () => {
  const [activeTab, setActiveTab] = useState<'fluxo' | 'aprovacoes'>('fluxo');
  const [aprovacoes, setAprovacoes] = useState(MOCK_APROVACOES);

  const handleAprovar = (id: string) => {
    setAprovacoes(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="text-lf-gold" size={24} /> Financeiro & Compras
          </h1>
          <p className="text-sm font-bold text-lf-muted mt-1 uppercase tracking-widest">Controle de Caixa e Aprovações Diretoria</p>
        </div>
      </header>

      {/* TABS */}
      <div className="flex px-4 md:px-0 mb-6 font-bold text-sm uppercase tracking-widest gap-2">
        <button 
          onClick={() => setActiveTab('fluxo')}
          className={cn("px-6 py-3 rounded-xl transition-colors border", activeTab === 'fluxo' ? "bg-lf-surface border-lf-gold text-lf-gold" : "bg-lf-bg border-white/5 text-lf-muted hover:border-white/20")}
        >
          Fluxo de Caixa
        </button>
        <button 
          onClick={() => setActiveTab('aprovacoes')}
          className={cn("px-6 py-3 rounded-xl transition-colors border relative", activeTab === 'aprovacoes' ? "bg-lf-surface border-lf-gold text-lf-gold" : "bg-lf-bg border-white/5 text-lf-muted hover:border-white/20")}
        >
          Aprovações Pendentes
          {aprovacoes.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
              {aprovacoes.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-0 pb-12 custom-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* ABA: FLUXO DE CAIXA */}
          {activeTab === 'fluxo' && (
            <motion.div key="fluxo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               
               {/* MACRO METRICS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-lf-surface border border-white/5 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={16}/> Saldo em Caixa</h3>
                    <p className="text-3xl font-black text-white">R$ 1.845.200</p>
                 </div>
                 <div className="bg-lf-surface border border-white/5 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-2 flex items-center gap-2 text-emerald-400"><TrendingUp size={16}/> Entradas (Mês)</h3>
                    <p className="text-3xl font-black text-emerald-400">R$ 600.000</p>
                 </div>
                 <div className="bg-lf-surface border border-white/5 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-2 flex items-center gap-2 text-red-400"><TrendingDown size={16}/> Saídas (Mês)</h3>
                    <p className="text-3xl font-black text-red-400">R$ 116.000</p>
                 </div>
               </div>

               {/* TABELA DE CAIXA */}
               <div className="bg-lf-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h2 className="font-bold text-white uppercase tracking-widest">Lançamentos Recentes</h2>
                    <button className="text-xs font-bold text-lf-gold bg-lf-gold/10 px-3 py-1.5 rounded-lg border border-lf-gold/20 flex items-center gap-2 uppercase tracking-widest hover:bg-lf-gold/20">
                      <Plus size={14} /> Novo Lançamento
                    </button>
                 </div>
                 <div className="p-4 space-y-3">
                   {MOCK_FLUXO.map(f => (
                     <div key={f.id} className="flex items-center justify-between p-3 bg-lf-bg border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", f.type === 'in' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                           {f.type === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                         </div>
                         <div>
                           <p className="font-bold text-white text-sm">{f.desc}</p>
                           <p className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mt-0.5">{f.date} • {f.category}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={cn("font-black text-base", f.type === 'in' ? "text-emerald-400" : "text-red-400")}>
                           {f.type === 'in' ? '+' : '-'} R$ {f.val.toLocaleString('pt-BR')}
                         </p>
                         <p className="text-[10px] font-bold text-lf-green uppercase tracking-widest mt-0.5">Liquidado</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </motion.div>
          )}

          {/* ABA: APROVAÇÕES DE COMPRAS */}
          {activeTab === 'aprovacoes' && (
            <motion.div key="aprov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               {aprovacoes.length === 0 ? (
                 <div className="bg-lf-surface border border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-lf-green/10 text-lf-green rounded-full flex items-center justify-center mb-4 border border-lf-green/20">
                     <CheckCircle2 size={32} />
                   </div>
                   <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">Tudo Limpo!</h2>
                   <p className="text-sm font-bold text-lf-muted">Nenhuma aprovação de suprimentos pendente.</p>
                 </div>
               ) : (
                 aprovacoes.map(aprov => (
                   <div key={aprov.id} className="bg-lf-surface border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-lf-gold/30 transition-colors">
                     
                     <div className="flex gap-4 items-start md:items-center">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-lf-gold bg-lf-gold/10 px-2 py-0.5 rounded-sm border border-lf-gold/20 uppercase tracking-widest">Requer Aprovação</span>
                            <span className="text-[10px] font-bold text-lf-muted uppercase tracking-widest">{aprov.obra}</span>
                          </div>
                          <h3 className="text-base font-black text-white uppercase tracking-wide">{aprov.desc}</h3>
                          <p className="text-sm text-lf-muted font-semibold mt-1">Solicitado por {aprov.reqBy}</p>
                        </div>
                     </div>

                     <div className="flex flex-col md:items-end flex-1 md:flex-none border-t border-white/5 md:border-transparent pt-4 md:pt-0">
                       <span className="text-2xl font-black text-white mb-3">R$ {aprov.val.toLocaleString('pt-BR')}</span>
                       <div className="flex gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => handleAprovar(aprov.id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-lf-gold hover:bg-lf-gold/90 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-lf-gold/10"
                          >
                            <CheckCircle2 size={16} /> Aprovar Liberação
                          </button>
                       </div>
                     </div>

                   </div>
                 ))
               )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
