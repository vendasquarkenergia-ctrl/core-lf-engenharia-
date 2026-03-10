import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { LogOut, Camera, Save, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../core/components/layout/MainLayout';

export const ProfilePage = () => {
  const { user, logout, refreshSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (name !== user.name) {
        await supabase.from('users_profiles').update({ full_name: name }).eq('id', user.id);
      }

      if (newPassword && newPassword.length >= 6) {
        await supabase.auth.updateUser({ password: newPassword });
      }

      await refreshSession(); // Atualiza contexto
      setIsSaved(true);
      setIsEditing(false);
      setTimeout(() => setIsSaved(false), 3000);
      setNewPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0 || !user) {
        throw new Error('Você precisa selecionar uma imagem.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // 1. Upload the file to "avatars" bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update the user_profiles table
      const { error: updateError } = await supabase.from('users_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Force auth context refresh to show new image
      await refreshSession();
      alert("Foto atualizada com sucesso!");
    } catch (error: any) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Meu Perfil</h1>
          <p className="text-slate-400 mt-1">Gerencie suas informações e preferências de conta</p>
        </div>
        <div className="flex bg-[#171717]/80 p-1.5 rounded-xl border border-white/5 w-fit">
          <span className="px-4 py-1.5 bg-white/5 rounded-lg text-sm font-medium text-slate-300 flex items-center gap-2">
            Nível de Acesso: <strong className="text-[#C19A42]">{user?.role}</strong>
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Avatar & Quick Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#171717]/80 border border-white/5 rounded-[32px] p-8 backdrop-blur-2xl flex flex-col items-center text-center shadow-xl shadow-black/20"
          >
            <div className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1A1A1A] shadow-[0_0_0_2px_rgba(193,154,66,0.3)] mb-6 relative bg-black/50">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#C19A42] font-bold text-4xl">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}

                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>

            <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">{user?.name}</h2>
            <p className="text-[#C19A42] text-sm font-medium mt-1">{user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'COLABORADOR' ? 'Engenharia/Operações' : 'Cliente'}</p>

            <div className="w-full h-px bg-white/10 my-6" />

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition-colors"
            >
              <LogOut size={18} /> Encerrar Sessão
            </button>
          </motion.div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSave}
            className="bg-[#171717]/80 border border-white/5 rounded-[32px] p-6 text-2xl shadow-xl shadow-black/20 md:p-8 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-[#C19A42] font-medium hover:text-[#D6AF53] transition-colors"
                >
                  Editar Dados
                </button>
              ) : (
                <span className="text-sm text-slate-400 flex items-center gap-1.5 font-medium">
                  Modo de Edição <div className="w-2 h-2 rounded-full bg-[#C19A42] animate-pulse" />
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Nome Completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-[#2A2A2A]/50 border border-white/5 rounded-xl h-14 pl-12 pr-4 text-[#F5F5F7] outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 disabled:opacity-60 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-[#2A2A2A]/50 border border-white/5 rounded-xl h-14 pl-12 pr-4 text-[#F5F5F7] outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 disabled:opacity-60 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-6 mt-10 border-t border-white/10 pt-8">Segurança</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Senha Atual</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="••••••••"
                    className="w-full bg-[#2A2A2A]/50 border border-white/5 rounded-xl h-14 pl-12 pr-4 text-[#F5F5F7] outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 disabled:opacity-60 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Nova Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="••••••••"
                    className="w-full bg-[#2A2A2A]/50 border border-white/5 rounded-xl h-14 pl-12 pr-4 text-[#F5F5F7] outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 disabled:opacity-60 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-8 flex gap-4"
              >
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl h-14 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold rounded-xl h-14 flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(193,154,66,0.15)]"
                >
                  <Save size={20} /> Salvar Alterações
                </button>
              </motion.div>
            )}

            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium text-sm"
              >
                <CheckCircle2 size={20} />
                <p>Suas informações foram atualizadas com sucesso.</p>
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
};
