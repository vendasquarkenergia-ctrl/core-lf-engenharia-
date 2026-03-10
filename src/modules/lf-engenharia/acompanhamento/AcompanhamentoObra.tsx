import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sun, CloudRain, Cloud, Clock, User, CheckCircle2, MapPin } from 'lucide-react';

const AcompanhamentoObra = () => {
    // ---- 1. STATES E PERSISTÊNCIA BÁSICA (MOCK) ----
    const [clima, setClima] = useState('sol');
    const [efetivoProprio, setEfetivoProprio] = useState(14);
    const [efetivoTerceiros, setEfetivoTerceiros] = useState(22);

    const [timelineFotos, setTimelineFotos] = useState(() => {
        const saved = localStorage.getItem('@lf-engenharia:rdo');
        if (saved) return JSON.parse(saved);
        return [
            {
                id: 1,
                img: 'https://images.unsplash.com/photo-1541888081622-1406e9fa2e89?auto=format&fit=crop&q=80&w=800',
                data: '09 Mar 2026',
                hora: '14:20:22 BRT',
                usuario: 'Eng. Arthur LF',
                coord: '-23.5505° S, -46.6333° W',
                info: 'Efetivo: 36 (Sol)'
            }
        ];
    });

    React.useEffect(() => {
        localStorage.setItem('@lf-engenharia:rdo', JSON.stringify(timelineFotos));
    }, [timelineFotos]);

    // ---- 2. ACTIONS (SALVAR RDO e TIRAR FOTO) ----
    const handleSalvarRDO = () => {
        const newItem = {
            id: Date.now(),
            img: clima === 'sol' ? 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800' : 'https://images.unsplash.com/photo-1541888081622-1406e9fa2e89?auto=format&fit=crop&q=80&w=800',
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR') + ' BRT',
            usuario: 'Eng. Arthur LF',
            coord: '-23.5555° S, -46.6666° W',
            info: `Diário: ${Number(efetivoProprio) + Number(efetivoTerceiros)} operando. Clima: ${clima.toUpperCase()}`
        };
        setTimelineFotos([newItem, ...timelineFotos]);
        alert("RDO Salvo localmente! (Sincronização offline-first mockada)");
    };

    const handleNovaFoto = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newFoto = {
                        id: Date.now(),
                        img: reader.result as string,
                        data: new Date().toLocaleDateString('pt-BR'),
                        hora: new Date().toLocaleTimeString('pt-BR') + ' BRT',
                        usuario: 'Eng. Arthur LF',
                        coord: '-22.9068° S, -43.1729° W',
                        info: 'Foto Avulsa Carregada'
                    };
                    setTimelineFotos([newFoto, ...timelineFotos]);
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };

    return (
        <div className="min-h-screen bg-[var(--color-root-bg)] text-[var(--color-text-main)] font-sans p-5 pb-safe selection:bg-[var(--color-accent)]/30">

            {/* Cabeçalho da Obra */}
            <header className="mb-10 mt-2">
                <p className="text-blue-400 font-semibold text-[11px] tracking-widest uppercase mb-1 drop-shadow-sm">
                    Acompanhamento de Obra
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Residencial Infinity</h1>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-5 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Em andamento - Alvenaria
                </div>

                {/* Barra de Progresso Suavizada */}
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-2 shadow-inner overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
                    />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    <span>Progresso Físico</span>
                    <span className="text-blue-400">45%</span>
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
            </section>

            {/* Timeline de Fotos (Anti-Fraude) */}
            <section>
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

                {/* Feed Vertical */}
                <div className="space-y-8">
                    {timelineFotos.map((foto: any, index: number) => (
                        <motion.div
                            key={foto.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative rounded-[2rem] overflow-hidden shadow-2xl glass transition-promax hover-scale group"
                        >
                            <img
                                src={foto.img}
                                alt="Status da obra"
                                className="w-full h-80 object-cover"
                            />

                            {/* Tarja Anti-Fraude Translucida */}
                            <div className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col justify-end">
                                <div className="bg-[#0A0F1C]/80 backdrop-blur-xl p-5 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-400 drop-shadow-md" />
                                            <span className="font-mono font-medium tracking-tight">
                                                {foto.data} <br /> <span className="text-white">{foto.hora}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end text-right">
                                            <User className="w-4 h-4 text-blue-400 drop-shadow-md" />
                                            <span className="font-medium truncate text-[13px]">{foto.usuario}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-between mt-1 py-1.5 px-3 bg-black/30 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-rose-400" />
                                                <span className="font-mono text-[10px] tracking-wider text-slate-400">{foto.coord}</span>
                                            </div>
                                            <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">{foto.info}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AcompanhamentoObra;
