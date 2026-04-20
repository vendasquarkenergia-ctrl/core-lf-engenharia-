import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../core/services/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Timeout de segurança de 10s para casos em que a internet cai ou API trava
      const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
        setTimeout(() => resolve({ error: new Error('O servidor demorou muito para responder. Verifique sua conexão ou tente novamente.') }), 10000);
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      // O roteador (App.tsx) reagirá à mudança no AuthContext e navegará automaticamente,
      // mas podemos forçar também
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Apple-style ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C19A42]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#171717]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-10">
            <div className="w-48 mb-6 relative group">
              <div className="absolute inset-0 bg-[#C19A42]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src="/logo.jpeg" alt="LF Soluções em Engenharia" className="w-full h-auto object-contain relative z-10 drop-shadow-lg rounded-xl" />
            </div>
            <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">CORE Access</h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to your enterprise workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm overflow-hidden"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-[#F5F5F7] rounded-xl h-14 pl-11 pr-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all"
                  placeholder="nome@lfengenharia.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-[#F5F5F7] rounded-xl h-14 pl-11 pr-4 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold rounded-xl h-14 flex items-center justify-center gap-2 transition-colors mt-8 shadow-[0_0_20px_rgba(193,154,66,0.15)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Secure Login <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-slate-600">
             Proteção RLS Ativa. Autenticação via Nuvem.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
