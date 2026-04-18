import React from 'react';
import { motion } from 'motion/react';
import { FileText, Folder, CheckCircle, AlertOctagon, Download, Eye } from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

const MOCK_FILES = [
  { id: 1, name: 'ARQ_Implantacao_Geral.pdf', rev: '03', status: 'aprovado', date: '10 Out 2026', size: '4.2 MB' },
  { id: 2, name: 'EST_Formas_Pav1.pdf', rev: '01', status: 'aprovado', date: '05 Out 2026', size: '2.1 MB' },
  { id: 3, name: 'ELE_Diagrama_Unifilar.pdf', rev: '00', status: 'obsoleto', date: '01 Out 2026', size: '1.5 MB' },
];

export const VaultProjetos = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Repositório de Projetos</h1>
          <p className="text-slate-400 mt-1">Acesso único à verdade para a equipe de campo</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar Disciplinas */}
        <div className="w-full lg:w-64 shrink-0 bg-[#171717] rounded-3xl border border-white/5 p-4 flex flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
             <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C19A42]/10 text-[#C19A42] font-medium text-sm">
              <Folder size={18} /> Arquitetura
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 transition-colors text-sm">
              <Folder size={18} /> Estrutural
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 transition-colors text-sm">
              <Folder size={18} /> Instalações (MEP)
            </button>
          </div>
         
        </div>

        {/* Lista de Arquivos */}
        <div className="flex-1 bg-[#171717]/80 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col min-w-0">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Arquivo</div>
            <div className="col-span-2">Rev</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Ação</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {MOCK_FILES.map((file) => (
              <motion.div 
                key={file.id}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center p-4 rounded-2xl border transition-all",
                  file.status === 'obsoleto' ? "bg-red-500/5 border-red-500/10 opacity-70" : "bg-white/5 border-white/5 hover:border-white/10"
                )}
              >
                <div className="col-span-1 md:col-span-5 flex items-center gap-3 overflow-hidden">
                  <div className={cn("p-2 rounded-lg shrink-0", file.status === 'obsoleto' ? "bg-red-500/10 text-red-400" : "bg-[#C19A42]/10 text-[#C19A42]")}>
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className={cn("font-medium text-sm truncate", file.status === 'obsoleto' ? "text-red-200 line-through" : "text-white")}>{file.name}</h4>
                    <p className="text-[10px] text-slate-500">{file.date} • {file.size}</p>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex justify-between md:block">
                  <span className="md:hidden text-xs text-slate-500">Revisão:</span>
                  <span className="font-mono text-xs bg-black/40 px-2 py-1 rounded text-slate-300">R{file.rev}</span>
                </div>

                <div className="col-span-1 md:col-span-3 flex justify-between md:block">
                   <span className="md:hidden text-xs text-slate-500 line-clamp-1">Status:</span>
                  {file.status === 'aprovado' ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit">
                      <CheckCircle size={14} /> Liberado p/ Obra
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest">
                      <AlertOctagon size={14} /> Obsoleto
                    </span>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 md:border-transparent mt-2 md:mt-0">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50" disabled={file.status === 'obsoleto'}>
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50" disabled={file.status === 'obsoleto'}>
                    <Download size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
