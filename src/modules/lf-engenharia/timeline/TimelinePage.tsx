import React, { useState, useRef } from 'react';
import { Camera, Sun, CloudRain, Users, MapPin, Clock, CheckCircle2, AlertTriangle, Send, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { cn } from '../../../core/components/layout/MainLayout';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Carlos Engenheiro',
    role: 'Engenheiro Responsável',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    time: 'Hoje, 14:30',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    description: 'Concretagem da laje do 3º pavimento finalizada com sucesso. Tempo firme ajudou no processo.',
    stage: 'Estrutura',
    status: 'success'
  },
  {
    id: 2,
    author: 'João Mestre',
    role: 'Mestre de Obras',
    avatar: 'https://i.pravatar.cc/150?u=joao',
    time: 'Ontem, 09:15',
    image: 'https://images.unsplash.com/photo-1541888086925-0c670a527004?auto=format&fit=crop&q=80&w=800',
    description: 'Início da alvenaria no 1º pavimento. Atraso na entrega dos blocos cerâmicos.',
    stage: 'Alvenaria',
    status: 'warning'
  }
];

export const TimelinePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'rdo'>('feed');
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const handleAddRDO = (newPost: any) => {
    setPosts([newPost, ...posts]);
    setActiveTab('feed');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Residencial Aurora</h1>
          <p className="text-slate-400 flex items-center gap-1.5 mt-1.5 text-sm font-medium">
            <MapPin size={14} className="text-[#C19A42]" /> São Paulo, SP
          </p>
        </div>
        {user?.role !== 'CLIENTE' && (
          <div className="flex bg-[#171717] p-1 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={cn(
                "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                activeTab === 'feed' ? "text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {activeTab === 'feed' && (
                <motion.div layoutId="timeline-tab" className="absolute inset-0 bg-[#2A2A2A] rounded-xl shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('rdo')}
              className={cn(
                "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                activeTab === 'rdo' ? "text-[#C19A42]" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {activeTab === 'rdo' && (
                <motion.div layoutId="timeline-tab" className="absolute inset-0 bg-[#C19A42]/10 rounded-xl shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">Novo RDO</span>
            </button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <FeedView posts={posts} />
          </motion.div>
        ) : (
          <motion.div
            key="rdo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RDOForm onSubmit={handleAddRDO} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeedView = ({ posts }: { posts: any[] }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {posts.map((post, index) => (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          key={post.id}
          className="bg-[#171717]/80 border border-white/5 rounded-[24px] overflow-hidden backdrop-blur-2xl shadow-xl shadow-black/20"
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img src={post.avatar} alt={post.author} className="w-11 h-11 rounded-full object-cover border border-white/10" />
              <div>
                <h3 className="font-medium text-[#F5F5F7]">{post.author}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{post.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg">
              <Clock size={12} />
              {post.time}
            </div>
          </div>

          {/* Image with Stamp */}
          <div className="relative aspect-square md:aspect-video bg-black">
            {post.image ? (
              <img src={post.image} alt="Progresso da obra" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#2A2A2A]">
                <ImageIcon size={48} className="text-slate-600" />
              </div>
            )}
            {/* Watermark/Stamp */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 text-right shadow-lg">
              <p className="text-[#C19A42] font-mono text-xs font-bold tracking-wider">{post.time}</p>
              <p className="text-white text-[10px] uppercase tracking-widest mt-1.5 font-medium">{post.author}</p>
              <p className="text-slate-300 text-[9px] flex items-center justify-end gap-1 mt-1 font-mono">
                <MapPin size={8} /> -23.5505, -46.6333
              </p>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-xl",
                post.status === 'success' ? "bg-[#C19A42]/20 text-[#C19A42] border border-[#C19A42]/30" :
                  post.status === 'warning' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    "bg-red-500/20 text-red-300 border border-red-500/30"
              )}>
                {post.status === 'success' && <CheckCircle2 size={14} />}
                {post.status === 'warning' && <AlertTriangle size={14} />}
                {post.stage}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-semibold text-white mr-2">{post.author}</span>
              {post.description}
            </p>
            {post.workers && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                <Users size={14} />
                <span>{post.workers} funcionários presentes</span>
              </div>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  );
};

const RDOForm = ({ onSubmit }: { onSubmit: (post: any) => void }) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState('sol');
  const [stage, setStage] = useState('Fundação');
  const [description, setDescription] = useState('');
  const [workers, setWorkers] = useState('');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const newPost = {
      id: Date.now(),
      author: user?.name || 'Usuário',
      role: user?.role === 'ADMIN' ? 'Engenheiro Responsável' : 'Colaborador',
      avatar: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C19A42&color=fff`,
      time: `Hoje, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      image: preview,
      description,
      stage,
      status: 'success',
      workers: workers || '0'
    };

    onSubmit(newPost);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-[#171717]/80 border border-white/5 rounded-[32px] p-5 md:p-8 backdrop-blur-2xl shadow-2xl shadow-black/20"
    >
      <h2 className="text-xl font-semibold text-[#F5F5F7] mb-8">Relatório Diário de Obra</h2>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Registro Fotográfico</label>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handlePhotoClick}
            className={cn(
              "relative w-full aspect-video rounded-3xl border border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all",
              preview ? "border-[#C19A42]/50" : "border-white/20 hover:border-white/40 bg-white/5"
            )}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium flex items-center gap-2">
                    <Camera size={20} /> Trocar Foto
                  </p>
                </div>
                {/* Simulated Stamp */}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xl p-2.5 rounded-xl border border-white/10 text-right pointer-events-none">
                  <p className="text-[#C19A42] font-mono text-[10px] font-bold tracking-wider">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-white text-[8px] uppercase tracking-widest mt-1 font-medium">{user?.name}</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C19A42]">
                  <Camera size={28} />
                </div>
                <p className="text-[#F5F5F7] font-medium">Tirar Foto ou Escolher</p>
                <p className="text-slate-500 text-xs mt-1.5">A foto será carimbada com data/hora e local</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </motion.div>
        </div>

        {/* Weather */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Clima Predominante</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setWeather('sol')}
              className={cn(
                "flex items-center justify-center gap-2.5 py-4 rounded-2xl border transition-all h-16 font-medium",
                weather === 'sol'
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              <Sun size={20} /> Sol / Bom
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setWeather('chuva')}
              className={cn(
                "flex items-center justify-center gap-2.5 py-4 rounded-2xl border transition-all h-16 font-medium",
                weather === 'chuva'
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              <CloudRain size={20} /> Chuva
            </motion.button>
          </div>
        </div>

        {/* Workforce */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Efetivo Presente</label>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#C19A42]/50 focus-within:ring-1 focus-within:ring-[#C19A42]/50 transition-all">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Users size={20} className="text-slate-500" />
              <input
                type="number"
                value={workers}
                onChange={(e) => setWorkers(e.target.value)}
                placeholder="Qtd. Funcionários"
                className="bg-transparent border-none outline-none text-[#F5F5F7] w-full h-12 placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Localização (Coordenadas)</label>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#C19A42]/50 focus-within:ring-1 focus-within:ring-[#C19A42]/50 transition-all">
            <div className="flex-1 flex items-center gap-3 px-3">
              <MapPin size={20} className="text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: -23.5505, -46.6333"
                className="bg-transparent border-none outline-none text-[#F5F5F7] w-full h-12 placeholder:text-slate-600 font-medium"
              />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
                  );
                }
              }}
              className="bg-[#C19A42]/10 text-[#C19A42] px-4 h-12 rounded-xl text-sm font-semibold hover:bg-[#C19A42]/20 transition-colors"
            >
              GPS Atual
            </motion.button>
          </div>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Etapa da Obra</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl h-14 px-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 appearance-none font-medium transition-all"
          >
            <option value="Fundação" className="bg-[#171717]">Fundação</option>
            <option value="Estrutura" className="bg-[#171717]">Estrutura</option>
            <option value="Alvenaria" className="bg-[#171717]">Alvenaria</option>
            <option value="Instalações" className="bg-[#171717]">Instalações (Elétrica/Hidráulica)</option>
            <option value="Acabamento" className="bg-[#171717]">Acabamento</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Observações / Atividades</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que foi feito hoje..."
            required
            className="w-full bg-white/5 border border-white/10 text-[#F5F5F7] rounded-2xl p-5 outline-none focus:border-[#C19A42]/50 focus:ring-1 focus:ring-[#C19A42]/50 resize-none transition-all"
          ></textarea>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!description}
          className="w-full bg-[#C19A42] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D6AF53] text-black font-semibold text-lg rounded-2xl h-14 flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(193,154,66,0.15)] mt-4"
        >
          <Send size={20} />
          Enviar RDO
        </motion.button>
      </form>
    </motion.div>
  );
};
