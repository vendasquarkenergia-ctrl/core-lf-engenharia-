import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Material {
  nome: string;
  quantidade: string;
  nf: string;
}

interface RdoState {
  // 1. Formulário Layout
  openSections: string[];
  toggleSection: (id: string) => void;

  // 2. Vínculo da Obra
  selectedObra: string;
  dataRdo: string;
  setSelectedObra: (id: string) => void;
  setDataRdo: (date: string) => void;

  // 3. Clima
  climaManha: string;
  climaTarde: string;
  condicaoObra: string;
  paralisacao: string;
  setClimaManha: (val: string) => void;
  setClimaTarde: (val: string) => void;
  setCondicaoObra: (val: string) => void;
  setParalisacao: (val: string) => void;

  // 4. Efetivo
  efetivo: Record<string, number>;
  updateEfetivo: (role: string, delta: number) => void;

  // 5. Equipamentos
  equipamentos: Record<string, string>;
  toggleEquipamento: (equip: string, status: string) => void;

  // 6. Servicos
  servicos: string;
  setServicos: (txt: string) => void;

  // 7. Materiais
  materiais: Material[];
  addMaterial: () => void;
  updateMaterial: (index: number, field: keyof Material, value: string) => void;
  removeMaterial: (index: number) => void;

  // Utilidade: Limpar tudo (ao enviar form)
  resetRdo: () => void;
}

const defaultInitialState = {
  openSections: ['vinculo', 'servicos'],
  selectedObra: '1', // Hardcoded fallback until dynamic props
  dataRdo: new Date().toISOString().split('T')[0],
  climaManha: 'Sol',
  climaTarde: 'Nublado',
  condicaoObra: 'Operável',
  paralisacao: '',
  efetivo: {
    'Engenheiro': 1,
    'Mestre': 1,
    'Pedreiro': 4,
    'Servente': 6,
    'Armador': 2,
    'Carpinteiro': 0,
    'Eletricista': 0,
    'Encanador': 0
  },
  equipamentos: {},
  servicos: '',
  materiais: []
};

export const useRdoStore = create<RdoState>()(
  persist(
    (set) => ({
      ...defaultInitialState,

      toggleSection: (id) =>
        set((state) => ({
          openSections: state.openSections.includes(id)
            ? state.openSections.filter((s) => s !== id)
            : [...state.openSections, id],
        })),

      setSelectedObra: (id) => set({ selectedObra: id }),
      setDataRdo: (date) => set({ dataRdo: date }),

      setClimaManha: (val) => set({ climaManha: val }),
      setClimaTarde: (val) => set({ climaTarde: val }),
      setCondicaoObra: (val) => set({ condicaoObra: val }),
      setParalisacao: (val) => set({ paralisacao: val }),

      updateEfetivo: (role, delta) =>
        set((state) => ({
          efetivo: {
            ...state.efetivo,
            [role]: Math.max(0, (state.efetivo[role] || 0) + delta),
          },
        })),

      toggleEquipamento: (equip, status) =>
        set((state) => ({
          equipamentos: {
            ...state.equipamentos,
            [equip]: status,
          },
        })),

      setServicos: (txt) => set({ servicos: txt }),

      addMaterial: () =>
        set((state) => ({
          materiais: [...state.materiais, { nome: '', quantidade: '', nf: '' }],
        })),

      updateMaterial: (index, field, value) =>
        set((state) => {
          const newMats = [...state.materiais];
          newMats[index] = { ...newMats[index], [field]: value };
          return { materiais: newMats };
        }),

      removeMaterial: (index) =>
        set((state) => ({
          materiais: state.materiais.filter((_, i) => i !== index),
        })),

      resetRdo: () => set({ ...defaultInitialState }),
    }),
    {
      name: 'core-rdo-storage',
      // whitelist ou blacklist de persistência (vamos persistir tudo no momento)
    }
  )
);
