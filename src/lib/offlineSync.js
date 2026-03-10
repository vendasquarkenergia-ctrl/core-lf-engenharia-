// Dependência recomendada: npm install idb
import { openDB } from 'idb';

const DB_NAME = 'core_lf_offline_db';
const STORE_NAME = 'sync_queue';

/**
 * Inicializa o banco IndexedDB no navegador do usuário
 */
export async function initOfflineDB() {
    if (typeof window === 'undefined') return null;
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

/**
 * Adiciona uma mutação na fila de sincronização offline
 */
export async function addToSyncQueue(requestParams) {
    const db = await initOfflineDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const payload = {
        ...requestParams,
        timestamp: new Date().toISOString(), // Vital registrar a data oficial do aparelho
    };

    await store.add(payload);
    await tx.done;

    // Tenta sincronizar na hora se já ou ainda estiver online
    if (navigator.onLine) {
        processSyncQueue();
    }
}

/**
 * Processa a fila: Tenta enviar tudo que ficou preso offline para o Supabase
 */
export async function processSyncQueue() {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const db = await initOfflineDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const allItems = await store.getAll();

    if (allItems.length === 0) return;

    console.log(`[Sync Queue] Processando ${allItems.length} requisições presas.`);

    for (const item of allItems) {
        try {
            // Exemplo: Supabase client embutido na requisição do objeto -> item
            // await supabase.from(item.table).insert(item.data);
            console.log('[Sync Queue] Mutação sincronizada:', item.table, item.action);

            // Simulação fake para delay de rede
            await new Promise(res => setTimeout(res, 500));

            // Remove da fila se o backend engoliu sucesso (2xx)
            const deleteTx = db.transaction(STORE_NAME, 'readwrite');
            await deleteTx.objectStore(STORE_NAME).delete(item.id);
            await deleteTx.done;
        } catch (error) {
            console.error('[Sync Queue] Falha ao sincronizar item. Manter na fila:', item, error);
            // Fica na base para ser tentado novamente futuramente
        }
    }
}

/**
 * Hook para Optimistic UI
 * Exemplo de abstração que mascara a falha visual e aciona a fila Offline.
 * Pode ser adaptado num Zustand store `useMutation`
 */
export function useOptimisticMutation({ cacheKey, mutationFn, updateCacheFn }) {
    const execute = async (variables) => {
        // 1. Aplica mudança de imediato na interface do usuário (UI Otimista)
        const rollbackData = updateCacheFn(variables);

        try {
            if (typeof window !== 'undefined' && navigator.onLine) {
                // 2. Se tiver com rede, tenta realizar oficial
                await mutationFn(variables);
            } else {
                // 3. Sem rede: Armazena na fila de modo invisível
                await addToSyncQueue({
                    action: 'mutation',
                    cacheKey,
                    data: variables,
                    table: variables.table // Dinâmico de acordo com a mutação
                });
            }
        } catch (error) {
            // 4. Se a API recusar (Erro 40X/50X online), Revertemos a UI Otimista sutilmente
            console.error('Mutação fatal', error);
            if (rollbackData) rollbackData();

            // Dica: Disparar um evento de toast alertando que a atualização falhou (framer-motion toast)
            throw error;
        }
    };

    return { execute };
}

// Configura Listeners de Reconexão para quando o 4G da obra voltar.
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Sync Queue] Internet reconectada. Retomando...');
        processSyncQueue();
    });
}
