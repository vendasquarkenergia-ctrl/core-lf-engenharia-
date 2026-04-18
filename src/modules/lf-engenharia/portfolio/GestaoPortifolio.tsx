import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, AlertTriangle, CheckCircle2, Search, SlidersHorizontal, BellRing, User, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

// ============================================================================
// MOCK DATA: Esteira de Produção de Obras (Alta Densidade)
// ============================================================================
type ObraStatus = 'no_prazo' | 'atencao' | 'atrasado';

interface Obra {
  id: string;
  title: string;
  status: ObraStatus;
  burnRate: number; // Porcentagem do orçamento consumido
  engineer: string;
  avatar: string;
  alerts: string[]; // Ex: ['rdo_pendente', 'suprimento_bloqueado']
  vgv: number; // Valor Geral em Milhões
  diasRestantes: number;
}

interface Column {
  id: string;
  title: string;
  obras: Obra[];
}

const initialColumns: Column[] = [
  {
    id: 'pre-obra',
    title: 'Pré-Obra / Projetos',
    obras: [
      { id: '1', title: 'Residencial Alphaville', status: 'no_prazo', burnRate: 8, engineer: 'Eng. Roberto', avatar: 'https://i.pravatar.cc/150?u=roberto', alerts: [], vgv: 45.5, diasRestantes: 720 },
      { id: '2', title: 'Corporate Tower Norte', status: 'atencao', burnRate: 15, engineer: 'Engª. Amanda', avatar: 'https://i.pravatar.cc/150?u=amanda', alerts: ['licenca_ambiental'], vgv: 120.0, diasRestantes: 850 },
    ]
  },
  {
    id: 'fundacoes',
    title: 'Fundações & Infra',
    obras: [
      { id: '3', title: 'Edifício Horizon', status: 'atrasado', burnRate: 35, engineer: 'Eng. Marcos', avatar: 'https://i.pravatar.cc/150?u=marcos', alerts: ['rdo_pendente', 'suprimento_bloqueado'], vgv: 65.2, diasRestantes: 430 },
      { id: '4', title: 'Hospital Central', status: 'no_prazo', burnRate: 22, engineer: 'Eng. Roberto', avatar: 'https://i.pravatar.cc/150?u=roberto2', alerts: [], vgv: 210.0, diasRestantes: 600 },
    ]
  },
  {
    id: 'superestrutura',
    title: 'Superestrutura',
    obras: [
      { id: '5', title: 'Shopping Plaza Sul', status: 'no_prazo', burnRate: 52, engineer: 'Engª. Juliana', avatar: 'https://i.pravatar.cc/150?u=juliana', alerts: [], vgv: 340.0, diasRestantes: 310 },
    ]
  },
  {
    id: 'acabamentos',
    title: 'Acabamentos',
    obras: [
      { id: '6', title: 'Complexo Logístico BR', status: 'atencao', burnRate: 88, engineer: 'Eng. Carlos', avatar: 'https://i.pravatar.cc/150?u=carlos', alerts: ['rdo_pendente'], vgv: 85.0, diasRestantes: 45 },
    ]
  },
  {
    id: 'vistoria',
    title: 'Vistoria / Entrega Final',
    obras: [
      { id: '7', title: 'Condomínio Vale Verde', status: 'no_prazo', burnRate: 97, engineer: 'Eng. Carlos', avatar: 'https://i.pravatar.cc/150?u=carlos2', alerts: [], vgv: 28.0, diasRestantes: 12 },
    ]
  }
];

const formatCurrency = (val: number) => `R$ ${val.toFixed(1)}M`;

// ============================================================================
// MAIN PIPELINE COMPONENT
// ============================================================================
export const GestaoPortifolio = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedObraId, setDraggedObraId] = useState<string | null>(null);

  // Totais do Header
  const totalObras = columns.reduce((acc, col) => acc + col.obras.length, 0);
  const totalVgv = columns.reduce((acc, col) => acc + col.obras.reduce((sum, obra) => sum + obra.vgv, 0), 0);

  // ==================== DRAG & DROP LOGIC (HTML5 API) ====================
  const handleDragStart = (e: React.DragEvent, obraId: string) => {
    setDraggedObraId(obraId);
    e.dataTransfer.setData('obraId', obraId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const obraId = e.dataTransfer.getData('obraId');
    if (!obraId) return;

    let movedObra: Obra | undefined;
    let sourceColId = '';

    // Encontra e remove da coluna de origem
    const newColumns = columns.map(col => {
      const obraIndex = col.obras.findIndex(o => o.id === obraId);
      if (obraIndex > -1) {
        movedObra = col.obras[obraIndex];
        sourceColId = col.id;
        const newObras = [...col.obras];
        newObras.splice(obraIndex, 1);
        return { ...col, obras: newObras };
      }
      return col;
    });

    if (!movedObra || sourceColId === targetColId) {
      setDraggedObraId(null);
      return;
    }

    // Adiciona na coluna de destino
    const finalColumns = newColumns.map(col => {
      if (col.id === targetColId) {
        return { ...col, obras: [...col.obras, movedObra!] };
      }
      return col;
    });

    setColumns(finalColumns);
    setDraggedObraId(null);
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] flex flex-col space-y-6 pt-2 pb-6 px-1 transition-colors duration-300">
      
      {/* HEADER TÁTICO (Glassmorphism) */}
      <header className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-lf-surface/80 backdrop-blur-xl border border-lf-border p-4 sm:p-5 rounded-2xl shadow-sm z-20 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-lf-text flex items-center gap-3 transition-colors">
            <Building2 className="text-lf-green" size={24} />
            Pipeline de Obras
          </h1>
          <p className="text-lf-muted text-[11px] font-bold uppercase tracking-widest mt-1 transition-colors">Visão Macro • Esteira de Produção LF</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lf-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar obra ou engenheiro..." 
              className="w-full bg-black/5 dark:bg-black/20 border border-lf-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-lf-text placeholder-lf-muted focus:outline-none focus:border-lf-gold transition-colors block"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-lf-border rounded-xl text-sm font-bold text-lf-text transition-colors">
              <SlidersHorizontal size={16} /> Filtros
            </button>
            <div className="hidden sm:flex h-8 w-px bg-lf-border mx-2" />
            <div className="flex-1 sm:flex-none flex flex-col items-center sm:items-end justify-center px-4 py-2 bg-lf-surface border border-lf-border rounded-xl min-w-[140px] transition-colors">
               <span className="text-[10px] text-lf-muted uppercase tracking-widest font-bold">VGV Total</span>
               <span className="text-base font-mono font-black text-lf-gold">{formatCurrency(totalVgv)}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-lf-green/10 border border-lf-green/20 rounded-xl min-w-[100px] transition-colors">
               <span className="text-[10px] text-lf-green uppercase tracking-widest font-bold opacity-80">Ativas</span>
               <span className="text-base font-mono font-black text-lf-green">{totalObras}</span>
            </div>
          </div>
        </div>
      </header>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-6 h-full items-start min-w-max">
          {columns.map((column) => (
            <div 
              key={column.id}
              className="flex flex-col w-[340px] max-h-full bg-black/5 dark:bg-lf-surface/40 border border-lf-border rounded-2xl overflow-hidden transition-colors duration-300"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="shrink-0 p-4 border-b border-lf-border bg-lf-surface transition-colors flex items-center justify-between">
                <h3 className="font-bold text-sm text-lf-text uppercase tracking-wide flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-lf-muted" />
                   {column.title}
                </h3>
                <span className="bg-lf-bg text-lf-muted text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-lf-border">
                  {column.obras.length}
                </span>
              </div>

              {/* Column Body / Cards Area */}
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                {column.obras.map((obra) => (
                  <motion.div 
                    layout
                    layoutId={obra.id}
                    key={obra.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, obra.id)}
                    onDragEnd={() => setDraggedObraId(null)}
                    className={cn(
                      "group bg-lf-surface border rounded-[16px] p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-lg transition-all duration-200 relative overflow-hidden",
                      draggedObraId === obra.id ? "opacity-50 scale-95 border-dashed" : "border-lf-border hover:border-lf-border/80",
                      obra.status === 'atrasado' && "border-l-4 border-l-red-500",
                      obra.status === 'atencao' && "border-l-4 border-l-amber-500",
                      obra.status === 'no_prazo' && "border-l-4 border-l-lf-green"
                    )}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-lf-green/0 via-lf-green/0 to-lf-green/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />

                    {/* Top Row: Alerts & Title */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                       <h4 className="font-bold text-sm text-lf-text leading-tight group-hover:text-lf-green transition-colors">{obra.title}</h4>
                       {obra.alerts.length > 0 && (
                         <div className="flex -mr-1">
                           <div className="bg-red-500/10 text-red-500 p-1.5 rounded-lg border border-red-500/20 animate-pulse">
                              <BellRing size={14} />
                           </div>
                         </div>
                       )}
                    </div>

                    {/* VGV and Deadline */}
                    <div className="flex items-center gap-3 mb-4">
                       <div className="bg-black/5 dark:bg-black/20 px-2 py-1 rounded border border-lf-border text-[10px] font-mono font-bold text-lf-muted">
                         VGV: <span className="text-lf-text">{formatCurrency(obra.vgv)}</span>
                       </div>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-lf-muted uppercase tracking-wider">
                         <Clock size={12} className={obra.status === 'atrasado' ? "text-red-500" : ""} /> {obra.diasRestantes}d
                       </div>
                    </div>

                    {/* Burn Rate Mini-Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-lf-muted">Budget Consumido</span>
                        <span className="text-lf-text font-mono">{obra.burnRate}%</span>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            obra.burnRate > 80 ? "bg-red-500" : obra.burnRate > 50 ? "bg-amber-500" : "bg-lf-green"
                          )} 
                          style={{width: `${obra.burnRate}%`}} 
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Engineer */}
                    <div className="flex items-center justify-between pt-3 border-t border-lf-border">
                       <div className="flex items-center gap-2">
                          <img src={obra.avatar} alt={obra.engineer} className="w-6 h-6 rounded-full object-cover border border-lf-border" />
                          <span className="text-xs font-bold text-lf-muted">{obra.engineer}</span>
                       </div>
                       <ArrowRight size={14} className="text-lf-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
                
                {/* Empty Drop Zone Helper */}
                {column.obras.length === 0 && (
                   <div className="h-24 border-2 border-dashed border-lf-border rounded-[16px] flex items-center justify-center text-xs font-bold text-lf-muted uppercase tracking-widest">
                      Solte as obras aqui
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
