import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Falha ao autenticar. Verifique suas credenciais ou configure o .env');
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
            <div className="w-16 h-16 border-[3px] border-[#C19A42] flex items-center justify-center font-bold text-3xl text-[#C19A42] rounded-2xl mb-4 shadow-[0_0_20px_rgba(193,154,66,0.2)]">
              LF
            </div>
            <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">CORE Access</h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              className="w-full bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold rounded-xl h-14 flex items-center justify-center gap-2 transition-colors mt-8 shadow-[0_0_20px_rgba(193,154,66,0.15)] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Dica: Use <span className="text-slate-300">admin@</span>, <span className="text-slate-300">colab@</span> ou <span className="text-slate-300">cliente@</span> para testar os perfis.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
