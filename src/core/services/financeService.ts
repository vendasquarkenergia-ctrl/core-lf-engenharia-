import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { addToSyncQueue } from '../../lib/offlineSync';

export interface Transaction {
    id: string;
    obra_id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    category: string;
    status: 'pending' | 'paid';
    transaction_date: string;
}

// ==========================================
// MOCK DATA FALLBACK
// ==========================================
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', obra_id: 'obra-1', type: 'income', description: 'Pagamento Cliente A', amount: 150000, category: 'Serviços', status: 'paid', transaction_date: '2023-10-25' },
    { id: '2', obra_id: 'obra-1', type: 'expense', description: 'Compra de Cimento', amount: 45000, category: 'Materiais', status: 'paid', transaction_date: '2023-10-24' },
    { id: '3', obra_id: 'obra-1', type: 'expense', description: 'Folha de Pagamento', amount: 80000, category: 'Mão de Obra', status: 'pending', transaction_date: '2023-10-20' },
];

const checkHasEnv = () => import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('sua-url-aqui');

// ==========================================
// HOOKS (SERVICES)
// ==========================================

export const useTransactions = (obraId?: string) => {
    return useQuery({
        queryKey: ['financial_transactions', obraId],
        queryFn: async () => {
            if (!checkHasEnv()) return MOCK_TRANSACTIONS;

            let query = supabase.from('financial_transactions').select('*');
            if (obraId) query = query.eq('obra_id', obraId);

            const { data, error } = await query.order('transaction_date', { ascending: false });

            if (error) throw error;
            return data as Transaction[];
        },
    });
};

export const useAddTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTx: Omit<Transaction, 'id'>) => {
            // 1. Offline Mode handling
            if (!navigator.onLine || !checkHasEnv()) {
                await addToSyncQueue({
                    action: 'mutation',
                    cacheKey: ['financial_transactions'],
                    data: newTx,
                    table: 'financial_transactions'
                });
                return newTx; // Retorna mock otimista
            }

            // 2. Real Supabase Call
            const { data, error } = await supabase
                .from('financial_transactions')
                .insert(newTx)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        // Optimistic Update Setup
        onMutate: async (newTx) => {
            await queryClient.cancelQueries({ queryKey: ['financial_transactions'] });
            const previousTx = queryClient.getQueryData(['financial_transactions']) || [];

            // Optimisticaly add to UI
            const optimisticObj = { ...newTx, id: `optimistic-${Date.now()}` };
            queryClient.setQueryData(['financial_transactions'], (old: any) => [optimisticObj, ...(old || [])]);

            return { previousTx };
        },
        onError: (err, newTx, context) => {
            // Rollback se a mutation online falhar fatalmente e nao for capturada pela fila
            queryClient.setQueryData(['financial_transactions'], context?.previousTx);
        },
        onSettled: () => {
            // Re-fetch no background dps q acabar
            queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
        },
    });
};
