import React from 'react';
import { useAuth, Role } from '../../../core/auth/AuthContext';
import { Camera, Save, Shield } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Meu Perfil</h1>
        <p className="text-slate-400 mt-1">Gerencie suas informações e acesso</p>
      </header>

      <div className="bg-[#171717]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-xl shadow-black/20">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#171717] shadow-[0_0_0_2px_rgba(193,154,66,0.5)]" />
            <button className="absolute bottom-0 right-0 bg-[#C19A42] text-black p-2.5 rounded-full hover:bg-[#D6AF53] transition-colors shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">{user.name}</h2>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-slate-300">
              <Shield size={14} className="text-[#C19A42]" />
              Nível de Acesso: {user.role}
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Nome Completo</label>
              <input 
                type="text" 
                defaultValue={user.name}
                className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl h-14 px-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                defaultValue={user.email}
                className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl h-14 px-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Nova Senha</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl h-14 px-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Confirmar Senha</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl h-14 px-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold px-8 py-3.5 rounded-2xl h-14 flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(193,154,66,0.15)] w-full md:w-auto">
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
