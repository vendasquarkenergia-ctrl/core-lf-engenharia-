import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { motion } from 'motion/react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';

export const UpdatePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth(); // Se a sessão já foi estabelecida pelo link

    useEffect(() => {
        // Escuta mudanças no hash (caso a sessão ainda esteja se montando pelo Supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // Fluxo de recuperação de senha normal
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            // O Supabase usa a sessão ativa (recém-criada pelo token do email) para a atualização
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setIsSuccess(true);
            setTimeout(() => {
                navigate('/'); // Redireciona pro Dashboard apó sucesso
            }, 2000);

        } catch (error: any) {
            console.error('Erro ao atualizar senha:', error);
            alert(error.message || 'Falha ao processar o seu convite. O link pode ter expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Apple-style background glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C19A42]/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#171717]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl shadow-black/50 text-center">

                    {isSuccess ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center py-8"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Conta Ativada!</h2>
                            <p className="text-slate-400">Sua senha foi registrada com sucesso no CORE.</p>
                            <div className="mt-8 w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                        </motion.div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-16 h-16 border-[3px] border-emerald-500/80 flex items-center justify-center rounded-2xl mb-4 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-emerald-500">
                                    <Lock size={28} />
                                </div>
                                <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">Criar Senha de Acesso</h1>
                                <p className="text-sm text-slate-400 mt-2 px-4 leading-relaxed">
                                    Você foi convidado para a LF Engenharia.
                                    <br />Crie uma senha segura para entrar.
                                </p>
                                {user?.email && (
                                    <div className="mt-4 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs text-slate-300 font-medium tracking-wide">
                                        {user.email}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-5 text-left">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Nova Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-slate-500" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 text-[#F5F5F7] rounded-xl h-14 pl-11 pr-4 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium placeholder:font-normal placeholder:opacity-50"
                                            placeholder="Mínimo 6 caracteres"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={isLoading || password.length < 6}
                                    className="w-full bg-white text-black font-bold rounded-xl h-14 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors mt-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Ativar e Entrar <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </>
                    )}

                </div>
            </motion.div>
        </div>
    );
};
