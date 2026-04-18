import React from 'react';
import { motion } from 'motion/react';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';

const KANBAN_COLS = [
  { id: 'solicitado', label: 'Solicitado pela Obra' },
  { id: 'cotacao', label: 'Em Cotação' },
  { id: 'aprovacao', label: 'Aguardando Financeiro' },
  { id: 'caminho', label: 'A Caminho' },
  { id: 'entregue', label: 'Entregue' }
];

const MOCK_PEDIDOS = [
  { id: 1, item: '100 Sacos Cimento CP-II', obra: 'Edifício Alpha', solicitante: 'Carlos Eng.', prazo: 'Urgente (Hoje)', status: 'solicitado', altoValor: true },
  { id: 2, item: '50m Tubo Tigre 100mm', obra: 'Residencial Aurora', solicitante: 'João Mestre', prazo: '2 dias', status: 'cotacao', altoValor: false },
  { id: 3, item: 'Aço CA-50 (5 Toneladas)', obra: 'Edifício Alpha', solicitante: 'Carlos Eng.', prazo: 'Próx. Semana', status: 'aprovacao', altoValor: true },
];

export const SuprimentosBoard = () => {
  const { user } = useAuth();
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Suprimentos & Compras</h1>
          <p className="text-slate-400 mt-1">Gestão inteligente de materiais e insumos</p>
        </div>
        <button className="bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nova Solicitação
        </button>
      </header>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max px-1">
          {KANBAN_COLS.map(col => (
            <div key={col.id} className="w-80 flex flex-col h-full bg-[#171717]/40 rounded-3xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-300">{col.label}</h3>
                <span className="bg-white/5 px-2 py-0.5 rounded-md text-xs font-semibold text-slate-400">
                  {MOCK_PEDIDOS.filter(p => p.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {MOCK_PEDIDOS.filter(p => p.status === col.id).map(pedido => (
                  <motion.div 
                    key={pedido.id}
                    layoutId={`pedido-${pedido.id}`}
                    className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 shadow-lg cursor-grab active:cursor-grabbing hover:border-white/10 transition-colors"
                  >
                    {pedido.altoValor && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md w-fit mb-3">
                        <AlertTriangle size={12} /> Curva ABC / Alta Aprovação
                      </div>
                    )}
                    <h4 className="font-medium text-[#F5F5F7] leading-snug mb-2">{pedido.item}</h4>
                    <p className="text-xs text-slate-400 mb-4">{pedido.obra}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/10">
                          {pedido.solicitante.slice(0,2)}
                        </div>
                        <span className="text-xs text-slate-400">{pedido.prazo}</span>
                      </div>
                      
                      {col.id === 'aprovacao' && user?.role === 'ADMIN' && (
                        <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-semibold transition-colors">
                          Aprovar
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
