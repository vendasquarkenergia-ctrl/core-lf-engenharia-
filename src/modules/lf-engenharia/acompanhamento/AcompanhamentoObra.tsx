import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Sun, CloudRain, Cloud, Clock, User, CheckCircle2, MapPin, ChevronLeft, Wallet, Activity } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../core/auth/AuthContext';

const AcompanhamentoObra = () => {
    const { id: obraId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    // ---- 1. STATES ----
    const [obra, setObra] = useState<any>(null);
    const [clima, setClima] = useState('SOL');
    const [efetivoProprio, setEfetivoProprio] = useState(0);
    const [efetivoTerceiros, setEfetivoTerceiros] = useState(0);
    const [atividades, setAtividades] = useState('');
    const [ocorrencias, setOcorrencias] = useState('');

    const [timelineRDOs, setTimelineRDOs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!obraId) {
            navigate('/obras');
            return;
        }
        fetchObraDetails();
        fetchRDOs();
    }, [obraId]);

    const fetchObraDetails = async () => {
        try {
            const { data, error } = await supabase.from('obras').select('*').eq('id', obraId).single();
            if (error) throw error;
            setObra(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRDOs = async () => {
        try {
            const { data, error } = await supabase
                .from('rdo_diarios')
                .select('*, users_profiles(full_name)')
                .eq('obra_id', obraId)
                .order('data_relatorio', { ascending: false });
            if (error) throw error;
            setTimelineRDOs(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // ---- 2. ACTIONS (SALVAR RDO e TIRAR FOTO) ----
    const handleSalvarRDO = async () => {
        if (!atividades.trim()) {
            alert('A descrição das atividades é obrigatória.');
            return;
        }

        try {
            // Mock temporary status since this is an "express RDO"
            const { error } = await supabase.from('rdo_diarios').insert({
                obra_id: obraId,
                condicao_climatica: clima.toUpperCase(),
                efetivo_total: (efetivoProprio + efetivoTerceiros),
                descricao_atividades: atividades,
                ocorrencias: ocorrencias || 'Nenhuma',
                status: 'ASSINADO'
            });

            if (error) throw error;

            alert("RDO Salvo no Banco de Dados!");
            setAtividades('');
            setOcorrencias('');
            setEfetivoProprio(0);
            setEfetivoTerceiros(0);
            fetchRDOs();
        } catch (err: any) {
            alert("Erro: " + err.message);
        }
    };

    const handleNovaFoto = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // FUTURO: Upload no Bucket 'obras_fotos' e vincular tabela Timeline
                alert('O recurso de Upload Remoto de Foto para Obras será implementado em breve! (Integração Storage pendente). RDO Textual funcionando.');
            }
        };
        fileInput.click();
    };

    if (isLoading) return <div className="min-h-screen text-white flex items-center justify-center">Carregando Obra...</div>;
    if (!obra) return <div className="min-h-screen text-white flex items-center justify-center">Obra não encontrada.</div>;

    const formatoDinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="min-h-screen bg-[var(--color-root-bg)] text-[var(--color-text-main)] font-sans p-5 pb-safe selection:bg-[var(--color-accent)]/30">

            {/* Botão Voltar Navbar */}
            <div className="mb-4">
                <button
                    onClick={() => navigate('/obras')}
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Cabeçalho da Obra */}
            <header className="mb-10 mt-2">
                <p className="text-blue-400 font-semibold text-[11px] tracking-widest uppercase mb-1 drop-shadow-sm">
                    Acompanhamento de Obra
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{obra.nome}</h1>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-5 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${obra.status === 'CONCLUIDA' ? 'bg-emerald-400' : 'bg-[#C19A42]'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${obra.status === 'CONCLUIDA' ? 'bg-emerald-500' : 'bg-[#C19A42]'}`}></span>
                    </span>
                    {obra.status.replace('_', ' ')} — {obra.endereco || 'Endereço não informado'}
                </div>

                {/* Bloco Financeiro Express */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#171717]/80 rounded-2xl p-4 border border-white/5 shadow-xl">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5"><Wallet size={12} /> Orçamento Max</span>
                        <p className="text-xl font-bold text-emerald-400 mt-1">{formatoDinheiro.format(obra.orcamento_estimado || 0)}</p>
                    </div>
                    <div className="bg-[#171717]/80 rounded-2xl p-4 border border-white/5 shadow-xl">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5"><Activity size={12} /> Margem Esperada</span>
                        <p className="text-xl font-bold text-white mt-1">20%</p> {/* Será estático por enquanto */}
                    </div>
                </div>
            </header>

            {/* RDO Express - Card com efeito Glassmorphism */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4 text-white">RDO Express</h2>
                <div className="p-5 rounded-3xl glass transition-promax hover-scale">

                    {/* Seleção Rápida de Clima */}
                    <div className="mb-6">
                        <label className="block text-[13px] font-medium text-slate-400 mb-3">Condição Climática</label>
                        <div className="flex justify-between gap-3">
                            {[
                                { id: 'sol', icon: Sun, label: 'Sol' },
                                { id: 'nublado', icon: Cloud, label: 'Nublado' },
                                { id: 'chuva', icon: CloudRain, label: 'Chuva' }
                            ].map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => setClima(w.id)}
                                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 active:scale-95 ${clima === w.id
                                        ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                        : 'bg-slate-800/40 border border-transparent text-slate-500 hover:bg-slate-800/60'
                                        }`}
                                >
                                    <w.icon className={`w-7 h-7 mb-2 ${clima === w.id ? 'text-blue-400' : 'text-slate-400'}`} />
                                    <span className="text-[11px] font-semibold tracking-wide">{w.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Efetivo Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                                Efetivo Próprio
                            </label>
                            <input
                                type="number"
                                value={efetivoProprio}
                                onChange={(e) => setEfetivoProprio(Number(e.target.value))}
                                className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-slate-700"
                            />
                        </div>
                        <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                                Terceiros
                            </label>
                            <input
                                type="number"
                                value={efetivoTerceiros}
                                onChange={(e) => setEfetivoTerceiros(Number(e.target.value))}
                                className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Botão de Salvar RDO */}
                    <button onClick={handleSalvarRDO} className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-4 rounded-2xl transition-promax active:scale-[0.98] shadow-lg hover:shadow-[0_0_20px_var(--color-accent)]">
                        <CheckCircle2 className="w-5 h-5" />
                        Salvar RDO Diário
                    </button>
                </div>
            </section >

            {/* Timeline de Fotos (Anti-Fraude) */}
            < section >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-white">Timeline da Obra</h2>
                </div>

                {/* Câmera Button */}
                <button onClick={handleNovaFoto} className="w-full mb-8 flex items-center justify-center gap-3 glass hover-scale transition-promax text-white py-5 rounded-3xl active:scale-[0.98]">
                    <div className="bg-blue-600 p-2.5 rounded-full shadow-lg">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Nova Foto</span>
                </button>

                {/* Feed Vertical RDOs (Sem foto mockada e com dados do banco) */}
                <div className="space-y-6">
                    {timelineRDOs.map((rdo: any, index: number) => (
                        <motion.div
                            key={rdo.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#171717]/80 border border-white/5 rounded-[2rem] p-6 backdrop-blur-3xl shadow-xl transition-promax group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl text-white ${rdo.condicao_climatica === 'CHUVA' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {rdo.condicao_climatica === 'CHUVA' ? <CloudRain size={20} /> : rdo.condicao_climatica === 'NUBLADO' ? <Cloud size={20} /> : <Sun size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white tracking-tight">{new Date(rdo.data_relatorio).toLocaleDateString('pt-BR')}</h4>
                                        <span className="text-xs font-semibold text-slate-500">Por {rdo.users_profiles?.full_name || 'Desconhecido'}</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white/5 text-slate-300 font-mono text-[10px] rounded-lg tracking-wider font-bold shadow-inner">
                                    EFETIVO: {rdo.efetivo_total}
                                </span>
                            </div>

                            <div className="bg-[#111111]/80 rounded-2xl p-4 mb-4 border border-white/5">
                                <p className="text-sm font-medium leading-relaxed text-slate-300">
                                    {rdo.descricao_atividades}
                                </p>
                            </div>

                            {rdo.ocorrencias && rdo.ocorrencias !== 'Nenhuma' && (
                                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/10 mb-2">
                                    <Activity size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{rdo.ocorrencias}</span>
                                </div>
                            )}
                            <div className="flex justify-end text-[10px] uppercase font-bold text-slate-600 tracking-widest mt-4">
                                STATUS DO RDO: {rdo.status}
                            </div>
                        </motion.div>
                    ))}
                    {timelineRDOs.length === 0 && (
                        <div className="py-12 bg-white/5 rounded-[2rem] border border-white/5 border-dashed text-center text-slate-400 font-medium">
                            Nenhum RDO preenchido para esta obra.
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
};

export default AcompanhamentoObra;
