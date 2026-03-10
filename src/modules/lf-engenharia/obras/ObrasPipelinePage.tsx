import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Building2, MapPin, CalendarDays, ArrowRight, Wallet, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ObrasPipelinePage = () => {
    const [obras, setObras] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchObras();
    }, []);

    const fetchObras = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('obras')
                .select('*')
                .order('data_inicio', { ascending: false });

            if (error) throw error;
            setObras(data || []);
        } catch (err: any) {
            console.error('Erro ao buscar obras:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLANEJAMENTO': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'EM_ANDAMENTO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'CONCLUIDA': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'PAUSADA': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ');
    };

    const statusColumns = ['PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA'];

    return (
        <div className="w-full mx-auto p-4 md:p-8">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[#C19A42] font-semibold text-[11px] tracking-widest uppercase mb-1 drop-shadow-sm flex items-center gap-2">
                        <Building2 size={12} /> LF ENGENHARIA
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Pipeline de Obras</h1>
                </div>

                <button className="flex items-center gap-2 bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(193,154,66,0.15)] active:scale-95 w-fit">
                    <Plus size={18} />
                    <span>Nova Obra</span>
                </button>
            </header>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-[#C19A42]/30 border-t-[#C19A42] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {statusColumns.map((colStatus) => {
                        const obrasDaColuna = obras.filter(o => o.status === colStatus);

                        return (
                            <div key={colStatus} className="bg-[#171717]/60 border border-white/5 rounded-3xl p-4 flex flex-col gap-4 min-h-[500px]">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-semibold text-white/90 text-sm tracking-wide flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(colStatus).split(' ')[0].replace('text-', 'bg-')}`} />
                                        {getStatusLabel(colStatus)}
                                    </h3>
                                    <span className="text-xs font-mono font-medium text-slate-500 bg-black/50 px-2 py-0.5 rounded-md">
                                        {obrasDaColuna.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex flex-col gap-3">
                                    <AnimatePresence>
                                        {obrasDaColuna.map((obra) => (
                                            <motion.div
                                                key={obra.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                whileHover={{ y: -2 }}
                                                onClick={() => navigate(`/obras/${obra.id}`)}
                                                className="bg-[#222222] border border-white/5 hover:border-[#C19A42]/30 rounded-2xl p-4 cursor-pointer transition-all shadow-lg group relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C19A42]/5 blur-3xl rounded-full group-hover:bg-[#C19A42]/10 transition-colors pointer-events-none" />

                                                <h4 className="font-bold text-[#F5F5F7] text-lg mb-1 group-hover:text-[#C19A42] transition-colors line-clamp-1">{obra.nome}</h4>

                                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 truncate">
                                                    <MapPin size={12} className="shrink-0" />
                                                    <span className="truncate">{obra.endereco || 'Endereço não definido'}</span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center justify-between text-xs font-medium">
                                                        <span className="text-slate-500 flex items-center gap-1.5"><Wallet size={12} /> Orçamento</span>
                                                        <span className="text-emerald-400 font-mono">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.orcamento_estimado || 0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs font-medium">
                                                        <span className="text-slate-500 flex items-center gap-1.5"><CalendarDays size={12} /> Início</span>
                                                        <span className="text-slate-300">
                                                            {obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : 'A definir'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getStatusColor(obra.status)}`}>
                                                        {getStatusLabel(obra.status)}
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C19A42] group-hover:text-black transition-colors">
                                                        <ArrowRight size={14} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {obrasDaColuna.length === 0 && (
                                        <div className="py-8 text-center text-sm font-medium text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                                            Nenhuma obra
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
