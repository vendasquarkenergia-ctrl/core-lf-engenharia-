import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, TrendingUp, AlertCircle, ChevronRight, CheckCircle2,
  Calendar, MoreVertical, Search, Filter, Rocket, HardHat, Hammer, Sparkles
} from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

const STAGES = [
  { id: 'projetos', title: 'Projetos', icon: Rocket },
  { id: 'fundacao', title: 'Fundação', icon: HardHat },
  { id: 'estrutura', title: 'Estrutura', icon: Building2 },
  { id: 'acabamento', title: 'Acabamento', icon: Hammer },
  { id: 'entregue', title: 'Entregue', icon: Sparkles }
];

const INITIAL_OBRAS = [
  { id: '1', title: 'Torre Horizon', stage: 'estrutura', resp: 'Eng. Roberto', burn: 45, noRdo: true, vgv: 'R$ 45M' },
  { id: '2', title: 'Residencial Alpha', stage: 'fundacao', resp: 'Eng. Almeida', burn: 15, noRdo: false, vgv: 'R$ 12M' },
  { id: '3', title: 'Complexo Sul', stage: 'projetos', resp: 'Eng. Marina', burn: 5, noRdo: false, vgv: 'R$ 110M' },
  { id: '4', title: 'Shopping Jardins', stage: 'acabamento', resp: 'Eng. Fernando', burn: 85, noRdo: true, vgv: 'R$ 380M' },
  { id: '5', title: 'Praça Central', stage: 'entregue', resp: 'Eng. Roberto', burn: 98, noRdo: false, vgv: 'R$ 5M' },
];

export const ObrasPipeline = () => {
  const [obras, setObras] = useState(INITIAL_OBRAS);

  const onDragStart = (e: React.DragEvent, obraId: string) => {
    e.dataTransfer.setData('obraId', obraId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, stageId: string) => {
    const obraId = e.dataTransfer.getData('obraId');
    setObras(obras.map(o => o.id === obraId ? { ...o, stage: stageId } : o));
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex flex-col pt-4">
      <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="text-lf-gold" size={24} /> Kanban de Obras
          </h1>
          <p className="text-sm font-bold text-lf-muted mt-1 uppercase tracking-widest">Painel Presidencial de Acompanhamento</p>
        </div>
        
        <div className="flex gap-3">
           <button className="flex items-center gap-2 bg-lf-surface border border-white/10 hover:border-lf-gold text-white px-4 py-2 rounded-xl transition-colors text-sm font-bold uppercase tracking-wider">
             <Filter size={16} /> Filtros
           </button>
           <button className="flex items-center gap-2 bg-lf-gold hover:bg-lf-gold/90 text-black px-4 py-2 rounded-xl transition-colors text-sm font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(212,175,55,0.25)]">
             <Building2 size={16} /> Nova Obra
           </button>
        </div>
      </header>

      {/* HORIZONTAL SCROLL AREA */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-4 md:px-0 pb-4">
        <div className="flex gap-6 h-full min-w-max items-start">
          {STAGES.map(stage => {
            const stageObras = obras.filter(o => o.stage === stage.id);
            const Icon = stage.icon;
            
            return (
              <div 
                key={stage.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage.id)}
                className="w-80 h-full flex flex-col bg-lf-surface/30 border border-white/5 rounded-[24px] overflow-hidden backdrop-blur-md"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 glass-panel border-0 border-b">
                   <div className="flex items-center gap-2">
                     <Icon size={18} className="text-lf-gold" />
                     <h3 className="text-sm font-black text-white uppercase tracking-widest">{stage.title}</h3>
                   </div>
                   <span className="bg-lf-bg text-lf-muted text-xs font-bold px-2 py-1 rounded-md border border-white/5">
                     {stageObras.length}
                   </span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  <AnimatePresence>
                    {stageObras.map(obra => (
                      <motion.div
                        key={obra.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={(e: any) => onDragStart(e, obra.id)}
                        className="bg-lf-surface border border-white/10 hover:border-lf-gold/50 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-lf-gold/5 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-white text-base leading-tight group-hover:text-lf-gold transition-colors">{obra.title}</h4>
                          <button className="text-lf-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                             <MoreVertical size={16} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-lf-muted uppercase tracking-wider">{obra.resp}</span>
                            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-sm border border-emerald-400/20">{obra.vgv}</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-lf-muted">
                              <span>Burn Rate (Orçamento)</span>
                              <span className={obra.burn > 80 ? "text-red-400" : "text-lf-gold"}>{obra.burn}%</span>
                            </div>
                            <div className="h-1.5 bg-lf-bg rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-500", obra.burn > 80 ? "bg-red-500" : "bg-lf-gold")}
                                style={{ width: `${obra.burn}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                             {obra.noRdo ? (
                               <div className="flex items-center gap-1.5 text-xs font-bold text-lf-gold bg-lf-gold/10 border border-lf-gold/20 px-2 pl-1.5 py-1 rounded-md">
                                 <AlertCircle size={14} /> <span>RDO PENDENTE</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                 <CheckCircle2 size={12} /> Dia Sincronizado
                               </div>
                             )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
