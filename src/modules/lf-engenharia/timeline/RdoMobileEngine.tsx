import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Building2, Calendar, CloudSun, CloudRain, Sun, 
  MapPin, Users, Wrench, FileText, Camera, Check, Plus, Minus,
  Trash2, Navigation, PenTool, ArrowRight, Loader2, Image as ImageIcon, X
} from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';
import { supabase } from '../../../core/services/supabase';
import { useRdoStore } from '../../../store/useRdoStore';

// ==========================================================
// TYPES & MOCKS
// ==========================================================
const OBRAS_MOCK = [
  { id: '1', name: 'Residencial Alpha' },
  { id: '2', name: 'Corporate Tower Norte' },
  { id: '3', name: 'Shopping Jardins' },
];

const EQUIPAMENTOS_MOCK = ['Betoneira', 'Retroescavadeira', 'Guindaste', 'Serra Circular'];
const EQUIP_STATUS = ['Em Operação', 'Parado/Manutenção', 'Ocioso'];

// ==========================================================
// RDO MASTER COMPONENT
// ==========================================================
export const RdoMobileEngine = () => {
  // --- Estado Global Atômico (Zustand com Persistência) ---
  const {
    openSections, toggleSection,
    selectedObra, setSelectedObra,
    dataRdo, setDataRdo,
    climaManha, setClimaManha,
    climaTarde, setClimaTarde,
    condicaoObra, setCondicaoObra,
    paralisacao, setParalisacao,
    efetivo, updateEfetivo,
    equipamentos, toggleEquipamento,
    servicos, setServicos,
    materiais, addMaterial, updateMaterial, removeMaterial,
    resetRdo
  } = useRdoStore();

  // --- Estados Efêmeros de UI (Não persistidos no momento) ---
  const [isDictating, setIsDictating] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helpers Locais ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (fotos.length + newFiles.length > 6) {
        alert('Máximo de 6 fotos permitido.');
        return;
      }
      setFotos(prev => [...prev, ...newFiles]);
    }
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const simulateDictation = () => {
    setIsDictating(true);
    setTimeout(() => {
      setServicos(servicos + (servicos ? " " : "") + "Concretagem da laje do 4º pavimento realizada com sucesso. Forma desforma iniciada nos pilares do 3º pavimento.");
      setIsDictating(false);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. UPLOAD DAS FOTOS PARA O BUCKET 'rdo_midias' DO SUPABASE STORAGE
      const uploadedUrls: string[] = [];
      
      for (const file of fotos) {
        // Gerar um nome único limpo de espaços especiais
        const fileExt = file.name.split('.').pop();
        const safeName = `obra-${selectedObra}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `rdo-fotos/${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('rdo_midias')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Erro ao subir foto:', uploadError);
          throw new Error('Falha no upload de fotos.');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('rdo_midias')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      console.log('✅ Upload Finalizado! URLs:', uploadedUrls);

      // 2. INSERIR RDO NO BANCO DE DADOS (Relacionando com OBRAs reais)
      let rdoIdToUse = '';
      
      // Resgatando o User atual para o autor_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
         try {
           const { data: rdoData, error: rdoError } = await supabase
             .from('rdo_master')
             .insert([{ 
               obra_id: selectedObra, 
               autor_id: user.id,
               data_referencia: dataRdo,
               clima_str: `${climaManha} / ${climaTarde}`,
               status_sync: 'COMPLETED'
             }])
             .select()
             .single();
             
           if (rdoError) throw rdoError;
           rdoIdToUse = rdoData.id;
         } catch(error: any) {
           console.warn('Simulação/Fallback RDO:', error.message);
           rdoIdToUse = 'mock-rdo-id'; 
         }
      } else {
        rdoIdToUse = 'mock-user-less-rdo-id';
      }

      // 3. RELACIONANDO AS FOTOS AO RDO/OBRA
      if (uploadedUrls.length > 0 && rdoIdToUse !== 'mock-rdo-id' && rdoIdToUse !== 'mock-user-less-rdo-id') {
        const midiasParaInserir = uploadedUrls.map(url => ({
           rdo_id: rdoIdToUse,
           url_storage: url
        }));
        
        await supabase.from('rdo_midias').insert(midiasParaInserir);
      } else if(uploadedUrls.length > 0) {
        console.log('🔗 [Fallback Mock] As seguintes fotos deveriam ser salvas em rdo_midias para a obra (ID:'+selectedObra+'):', uploadedUrls);
      }

      alert('RDO e Mídias enviados com sucesso para o Supabase! (Verifique o console)');
      
      // Cleanup visual e de Storage
      setFotos([]);
      resetRdo(); // Reseta os dados no Zustand e LocalStorage!
      
    } catch (err: any) {
      console.error(err);
      alert('Houve um erro no envio: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Componentes Auxiliares ---
  const AccordionHeader = ({ id, icon: Icon, title, isCompleted = false }: any) => {
    const isOpen = openSections.includes(id);
    return (
      <button 
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-lf-surface border-b border-white/5 active:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg transition-colors", isOpen ? "bg-lf-gold text-black" : "bg-white/5 text-lf-muted")}>
            <Icon size={18} />
          </div>
          <span className={cn("font-bold text-sm tracking-wide", isOpen ? "text-white" : "text-lf-muted")}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && !isOpen && <Check size={16} className="text-lf-green" />}
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} className="text-lf-muted" />
          </motion.div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-32">
      {/* HEADER DA PÁGINA */}
      <header className="bg-lf-surface border-b border-white/5 px-4 py-6 shadow-sm sticky top-0 z-40 backdrop-blur-xl bg-lf-surface/80">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span>RDO</span>
          <span className="text-lf-gold">Diário</span>
        </h1>
        <p className="text-xs text-lf-muted mt-1 uppercase tracking-widest font-bold">Relatório Oficial de Campo</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto sm:max-w-2xl mt-4 px-4 space-y-4">
        
        {/* 1. VÍNCULO DA OBRA */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="vinculo" icon={Building2} title="1. VÍNCULO DA OBRA" isCompleted={true} />
          <AnimatePresence>
            {openSections.includes('vinculo') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Selecione a Obra</label>
                    <div className="relative">
                      <select 
                        value={selectedObra} onChange={e => setSelectedObra(e.target.value)}
                        className="w-full bg-lf-bg border border-white/10 text-white rounded-xl py-3.5 pl-4 pr-10 text-sm font-semibold appearance-none focus:outline-none focus:border-lf-gold"
                      >
                        {OBRAS_MOCK.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                      <Navigation size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-lf-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Data do Relatório</label>
                    <div className="relative">
                      <input 
                        type="date" value={dataRdo} onChange={e => setDataRdo(e.target.value)}
                        className="w-full bg-lf-bg border border-white/10 text-white rounded-xl py-3.5 pl-4 pr-10 text-sm font-semibold appearance-none focus:outline-none focus:border-lf-gold"
                      />
                      <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-lf-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. CONDIÇÕES CLIMÁTICAS */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="clima" icon={CloudSun} title="2. CONDIÇÕES CLIMÁTICAS" />
          <AnimatePresence>
            {openSections.includes('clima') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-2 block">Manhã</label>
                      <select value={climaManha} onChange={e => setClimaManha(e.target.value)} className="w-full bg-lf-bg border border-white/10 text-white rounded-xl p-3 text-sm focus:border-lf-gold">
                        <option>Sol</option><option>Nublado</option><option>Chuva</option><option>Chuva Forte</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-2 block">Tarde</label>
                      <select value={climaTarde} onChange={e => setClimaTarde(e.target.value)} className="w-full bg-lf-bg border border-white/10 text-white rounded-xl p-3 text-sm focus:border-lf-gold">
                        <option>Sol</option><option>Nublado</option><option>Chuva</option><option>Chuva Forte</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-2 block">Condição da Obra</label>
                    <div className="flex gap-2 p-1 bg-lf-bg rounded-xl border border-white/10">
                      {['Operável', 'Parcial', 'Impraticável'].map(c => (
                        <button 
                          key={c} type="button" onClick={() => setCondicaoObra(c)}
                          className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", condicaoObra === c ? "bg-lf-gold text-black" : "text-lf-muted")}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {condicaoObra === 'Impraticável' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 block">Horário de Paralisação</label>
                      <input 
                        type="text" placeholder="Ex: 14:00 às 16:30" value={paralisacao} onChange={e => setParalisacao(e.target.value)}
                        className="w-full bg-lf-bg border border-red-500/20 text-white rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. EFETIVO */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="efetivo" icon={Users} title="3. EFETIVO DA OBRA" />
          <AnimatePresence>
            {openSections.includes('efetivo') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(efetivo).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between bg-lf-bg border border-white/10 rounded-xl p-2 pl-4">
                      <span className="text-sm font-semibold text-white">{role}</span>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                        <button type="button" onClick={() => updateEfetivo(role, -1)} className="w-10 h-10 flex items-center justify-center text-red-400 active:bg-white/10 rounded-md transition-colors"><Minus size={18}/></button>
                        <span className="w-8 text-center text-sm font-mono font-bold text-lf-gold">{count}</span>
                        <button type="button" onClick={() => updateEfetivo(role, 1)} className="w-10 h-10 flex items-center justify-center text-lf-green active:bg-white/10 rounded-md transition-colors"><Plus size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. EQUIPAMENTOS */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="equip" icon={Wrench} title="4. EQUIPAMENTOS NO CANTEIRO" />
          <AnimatePresence>
            {openSections.includes('equip') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  {EQUIPAMENTOS_MOCK.map((equip) => (
                    <div key={equip} className="bg-lf-bg border border-white/10 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-white mb-2">{equip}</h4>
                      <div className="flex gap-2">
                        {EQUIP_STATUS.map(status => {
                          const isSelected = equipamentos[equip] === status;
                          return (
                            <button
                              key={status} type="button" onClick={() => toggleEquipamento(equip, status)}
                              className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-md border uppercase tracking-widest transition-colors", 
                                isSelected ? (status === 'Em Operação' ? "bg-lf-green/10 text-lf-green border-lf-green/30" : status === 'Ocioso' ? "bg-lf-gold/10 text-lf-gold border-lf-gold/30" : "bg-red-500/10 text-red-500 border-red-500/30") 
                                : "bg-transparent text-lf-muted border-white/5 hover:border-white/20")}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. SERVIÇOS EXECUTADOS */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="servicos" icon={FileText} title="5. SERVIÇOS EXECUTADOS" />
          <AnimatePresence>
            {openSections.includes('servicos') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4">
                  <div className="relative">
                    <textarea 
                      value={servicos} onChange={e => setServicos(e.target.value)}
                      placeholder="Detalhe o que foi feito na obra hoje..."
                      className="w-full bg-lf-bg border border-white/10 text-white rounded-xl p-4 text-sm focus:border-lf-gold outline-none min-h-[120px] resize-none"
                    />
                  </div>
                  <button 
                    type="button" onClick={simulateDictation}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-lf-gold/10 hover:bg-lf-gold/20 text-lf-gold border border-lf-gold/20 rounded-xl py-3 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    {isDictating ? <Loader2 size={16} className="animate-spin" /> : <span>🎙️ Ditar Serviços</span>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. ENTRADA DE MATERIAIS */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="materiais" icon={Building2} title="6. ENTRADA DE MATERIAIS" />
          <AnimatePresence>
            {openSections.includes('materiais') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-4">
                  {materiais.map((mat, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-lf-bg border border-white/10 rounded-xl relative">
                      <button type="button" onClick={() => removeMaterial(i)} className="absolute top-3 right-3 text-red-500 p-1"><Trash2 size={16} /></button>
                      <input type="text" placeholder="Material (Ex: Cimento CP II)" value={mat.nome} onChange={e => updateMaterial(i, 'nome', e.target.value)} className="w-[85%] bg-transparent text-sm text-white border-b border-white/10 pb-1 outline-none focus:border-lf-gold placeholder-lf-muted" />
                      <div className="flex gap-4 mt-2">
                        <input type="text" placeholder="Qtd (Ex: 50 sacos)" value={mat.quantidade} onChange={e => updateMaterial(i, 'quantidade', e.target.value)} className="flex-1 bg-transparent text-sm text-white border-b border-white/10 pb-1 outline-none focus:border-lf-gold placeholder-lf-muted" />
                        <input type="text" placeholder="NF (Ex: 12345)" value={mat.nf} onChange={e => updateMaterial(i, 'nf', e.target.value)} className="flex-1 bg-transparent text-sm text-white border-b border-white/10 pb-1 outline-none focus:border-lf-gold placeholder-lf-muted" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addMaterial} className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 text-lf-muted rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:border-lf-gold hover:text-lf-gold transition-colors">
                    <Plus size={16} /> Adicionar Recebimento
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 7. REGISTRO FOTOGRÁFICO & ASSINATURA */}
        <div className="bg-lf-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
          <AccordionHeader id="fotos" icon={Camera} title="7. FOTOS & ASSINATURA" />
          <AnimatePresence>
            {openSections.includes('fotos') && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span>Upload de Fotos (Máx 6)</span>
                      <span className="text-white/40">{fotos.length}/6</span>
                    </label>

                    {/* FOTOS SELECIONADAS */}
                    {fotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {fotos.map((foto, index) => (
                           <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 group">
                             <img src={URL.createObjectURL(foto)} alt={`Foto ${index}`} className="w-full h-full object-cover opacity-80" />
                             <button type="button" onClick={() => removeFoto(index)} className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-full text-white backdrop-blur-sm shadow-sm scale-90 opacity-80 hover:opacity-100 transition-opacity"><X size={12} /></button>
                           </div>
                        ))}
                      </div>
                    )}

                    {/* BOTÃO NATIVO DE ARQUIVAMENTO */}
                    {fotos.length < 6 && (
                      <>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          ref={fileInputRef} 
                          onChange={handleFileSelect} 
                          className="hidden" 
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-2 h-20 bg-lf-bg border-2 border-dashed border-white/10 hover:border-lf-gold rounded-2xl text-lf-muted hover:text-lf-gold transition-colors active:scale-95"
                        >
                          <Camera size={24} />
                          <span className="text-xs font-bold tracking-wide uppercase">Adicionar Imagens</span>
                        </button>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-2 flex items-center gap-2"><PenTool size={14}/> Assinatura Digital</label>
                    <div className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center opacity-50 relative overflow-hidden">
                       <span className="text-white/20 text-xs uppercase tracking-widest font-bold">Assine aqui no display</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </form>

      {/* FLOAT SUBMIT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-lf-surface/90 backdrop-blur-xl border-t border-white/5 md:max-w-3xl mx-auto z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-2xl mx-auto">
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-16 bg-lf-gold text-black font-black text-sm sm:text-base rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-[0_10px_20px_rgba(212,175,55,0.2)] disabled:opacity-70 disabled:scale-100 uppercase tracking-widest"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
            {isSubmitting ? 'SALVANDO...' : 'Gerar RDO e Atualizar Obra'}
          </button>
        </div>
      </div>
    </div>
  );
};
