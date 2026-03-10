import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, AlertCircle, CheckCircle2, Plus, X, Search, Filter } from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../core/auth/AuthContext';
import { supabase } from '../../../lib/supabase';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasksAndObras();
  }, []);

  const fetchTasksAndObras = async () => {
    setIsLoading(true);
    try {
      const { data: obrasData } = await supabase.from('obras').select('id, nome');
      if (obrasData) setObras(obrasData);

      const { data: tasksData, error } = await supabase
        .from('tarefas')
        .select('*, obras(nome), users_profiles(full_name)')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Erro ao puxar tarefas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (task: any) => {
    alert("Função de WhatsApp será ativada quando o cadastro completo de usuários via painel de Controle estiver pronto. Por enquanto, a tarefa foi registrada com sucesso.");
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tarefas').update({ status: 'CONCLUIDA' }).eq('id', id);
      if (error) throw error;

      // Optimistic update
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'CONCLUIDA' } : t));
    } catch (err) {
      alert("Erro ao concluir tarefa");
    }
  };

  const handleAddTask = async (newTask: any) => {
    try {
      const { data, error } = await supabase.from('tarefas').insert({
        obra_id: newTask.obra_id,
        titulo: newTask.titulo,
        descricao: newTask.descricao,
        prioridade: newTask.prioridade,
        data_vencimento: newTask.prazo || null,
        status: 'PENDENTE'
      }).select();

      if (error) throw error;
      fetchTasksAndObras(); // reload
      setIsAddModalOpen(false);
    } catch (err) {
      alert("Erro ao criar tarefa");
    }
  };

  const filteredTasks = tasks.filter(task => {
    const taskStatus = task.status || 'PENDENTE';
    const matchesFilter = filter === 'ALL' || taskStatus === filter;

    const obraNome = task.obras?.nome || '';
    const titulo = task.titulo || '';

    const matchesSearch = titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obraNome.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-32 md:pb-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Task Manager</h1>
          <p className="text-slate-400 mt-1">Gestão de Gargalos e Pendências (Integrado)</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#C19A42] hover:bg-[#D6AF53] text-black font-semibold px-5 py-2.5 rounded-xl h-12 flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(193,154,66,0.15)] w-full md:w-auto"
        >
          <Plus size={20} />
          Nova Tarefa
        </motion.button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas ou obras..."
            className="w-full bg-[#171717]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[#F5F5F7] placeholder:text-slate-500 focus:outline-none focus:border-[#C19A42] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#171717]/80 border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors appearance-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluídos</option>
            <option value="BLOQUEADA">Bloqueadas</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-[#C19A42]/30 border-t-[#C19A42] rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-12 bg-[#171717]/50 rounded-3xl border border-white/5"
              >
                <CheckCircle2 size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">Nenhuma tarefa encontrada.</p>
              </motion.div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={task.id}
                  className={cn(
                    "bg-[#171717]/80 border rounded-[20px] p-5 backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg shadow-black/20 transition-colors",
                    task.status === 'CONCLUIDA' ? "border-[#C19A42]/20 opacity-70" : "border-white/5"
                  )}
                >

                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "mt-0.5 p-2.5 rounded-xl",
                      task.status === 'CONCLUIDA' ? "text-[#C19A42] bg-[#C19A42]/10 border border-[#C19A42]/20" :
                        task.status === 'EM_ANDAMENTO' ? "text-blue-400 bg-blue-500/10 border border-blue-500/20" :
                          task.status === 'BLOQUEADA' ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" :
                            "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    )}>
                      {task.status === 'CONCLUIDA' ? <CheckCircle2 size={22} /> :
                        task.status === 'EM_ANDAMENTO' ? <Clock size={22} /> :
                          <AlertCircle size={22} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className={cn("font-semibold text-lg tracking-tight", task.status === 'CONCLUIDA' ? "text-slate-400 line-through" : "text-[#F5F5F7]")}>
                          {task.titulo}
                        </h3>
                        {task.prioridade === 'URGENTE' && task.status !== 'CONCLUIDA' && (
                          <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest border border-red-500/20">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3 font-medium">{task.obras?.nome || 'Obra não especificada'}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">Resp: <span className="text-slate-200">{task.users_profiles?.full_name || 'Desconhecido'}</span></span>
                        <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Clock size={12} /> Prazo: <span className="text-slate-200">{task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'Sem Prazo'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 md:mt-0 w-full md:w-auto">
                    {task.status !== 'CONCLUIDA' && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleWhatsApp(task)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 px-5 py-2.5 rounded-xl h-12 font-medium transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>Cobrar</span>
                      </motion.button>
                    )}
                    {task.status !== 'CONCLUIDA' && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-[#F5F5F7] border border-white/10 px-5 py-2.5 rounded-xl h-12 font-medium transition-colors"
                      >
                        Concluir
                      </motion.button>
                    )}
                  </div>

                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddTaskModal
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddTask}
            obras={obras}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddTaskModal = ({ onClose, onAdd, obras }: { onClose: () => void, onAdd: (task: any) => void, obras: any[] }) => {
  const [titulo, setTitulo] = useState('');
  const [obraId, setObraId] = useState(obras[0]?.id || '');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('NORMAL');
  const [prazo, setPrazo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !obraId) return;

    onAdd({
      titulo,
      obra_id: obraId,
      descricao: descricao,
      prioridade,
      prazo: prazo
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#171717] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#F5F5F7]">Nova Tarefa</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Título da Tarefa</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Comprar material X"
              required
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] placeholder:text-slate-500 focus:outline-none focus:border-[#C19A42] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Obra</label>
            <select
              value={obraId}
              required
              onChange={(e) => setObraId(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors appearance-none"
            >
              <option value="">Selecione a Obra</option>
              {obras.map(o => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição/Observações</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] placeholder:text-slate-500 focus:outline-none focus:border-[#C19A42] transition-colors resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors appearance-none"
              >
                <option value="BAIXA">Baixa</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prazo Estimado</label>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-2.5 text-[#F5F5F7] focus:outline-none focus:border-[#C19A42] transition-colors cursor-text"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-medium bg-[#C19A42] text-black hover:bg-[#b08b3a] transition-colors shadow-lg shadow-[#C19A42]/20"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
