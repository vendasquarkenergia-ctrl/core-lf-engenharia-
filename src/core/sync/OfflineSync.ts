/**
 * CORE Enterprise: Offline Sync Manager & Optimistic UI
 * 
 * Este arquivo contém o "Cérebro" do funcionamento offline do sistema.
 * Idealmente integrado via Context API / Zustand e registrado junto do Service Worker (SW).
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Tipagem da Fila de Sincronização Local (IndexedDB/LocalStorage)
 */
export interface SyncAction {
    id: string; // uuid único da transação
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    payload: any;
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
    retryCount: number;
}

/**
 * O Cérebro: Gestor de Requisições Offline-First
 * Quando não há internet confiável, ele captura a requisição e guarda no celular/navegador.
 */
export class OfflineSyncManager {
    private queueKey = 'core_sync_queue';
    private syncing = false;

    constructor() {
        this.listenToNetworkStatus();
    }

    // Se o usuário pedir para "Salvar Tarefa" no canteiro de obras, esta função é chamada
    public async mutateOptimistic(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload: any) {
        const actionId = uuidv4();

        // 1. Prepara o payload para fila
        const action: SyncAction = {
            id: actionId,
            endpoint,
            method,
            payload,
            timestamp: Date.now(),
            status: 'pending',
            retryCount: 0
        };

        // 2. Tenta guardar na fila
        this.enqueue(action);

        // 3. Tenta sincronizar agora mesmo (se tiver um tiquinho de rede)
        if (navigator.onLine) {
            setTimeout(() => this.processQueue(), 100);
        }

        // 4. Retorna um "Fake ID" ou o UUID pro frontend atualizar a UI na hora, sem loading spinners!
        //    Isso que garante a "Optimistic UI" perfeita e instantânea.
        return { optimisticId: payload.id || actionId, status: 'queued' };
    }

    // Lê a fila pendente do cache local (aqui simulamos localStorage, ideal é IndexedDB via idb-keyval)
    private getQueue(): SyncAction[] {
        try {
            const q = localStorage.getItem(this.queueKey);
            return q ? JSON.parse(q) : [];
        } catch {
            return [];
        }
    }

    private saveQueue(queue: SyncAction[]) {
        localStorage.setItem(this.queueKey, JSON.stringify(queue));
    }

    private enqueue(action: SyncAction) {
        const queue = this.getQueue();
        queue.push(action);
        this.saveQueue(queue);

        // Emite um evento que o app React escuta pra mostrar "Sincronização Pendente ⚠️"
        window.dispatchEvent(new CustomEvent('coreSyncEvent', { detail: { count: queue.length } }));
    }

    // O "Carteiro": Tenta entregar tudo pro Supabase quando a internet volta
    public async processQueue() {
        if (this.syncing || !navigator.onLine) return;

        const queue = this.getQueue();
        if (queue.length === 0) return;

        this.syncing = true;
        const pendingActions = queue.filter(a => a.status === 'pending');

        for (const action of pendingActions) {
            try {
                console.log(`[Sync] Enviando tarefa offline para ${action.endpoint}`);
                // Simulando envio real com fetch pro seu backend/Supabase:
                /*
                const response = await fetch(action.endpoint, {
                  method: action.method,
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(action.payload)
                });
                
                if (!response.ok) throw new Error('Falhou pra valer no servidor');
                */

                // Sucesso = Remove da fila local
                this.removeFromQueue(action.id);

            } catch (err) {
                console.log(`[Sync] Falhou de novo para ${action.id}, ficará pendurado.`);
                this.incrementRetry(action.id);
            }
        }

        this.syncing = false;
        // Atualiza React: "Tudo Sincronizado ✔️"
        const newQueue = this.getQueue();
        window.dispatchEvent(new CustomEvent('coreSyncEvent', { detail: { count: newQueue.length } }));
    }

    private removeFromQueue(id: string) {
        const queue = this.getQueue().filter(a => a.id !== id);
        this.saveQueue(queue);
    }

    private incrementRetry(id: string) {
        const queue = this.getQueue().map(a =>
            a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
        );
        this.saveQueue(queue);
    }

    // Listener Master: Reage ao ligar/desligar de 3G/Wifi do aparelho instantaneamente.
    private listenToNetworkStatus() {
        window.addEventListener('online', () => {
            console.log('📡 Internet recuperada! Sincronizando dados offline...');
            this.processQueue();
        });

        window.addEventListener('offline', () => {
            console.log('🗼 Sem sinal. Entrando em Modo Seguro Offline.');
        });
    }
}

// Singleton: Só existe 1 "Cérebro" de sync por abas do app.
export const syncManager = new OfflineSyncManager();

/* =========================================================================================
 * Service Worker: Base de Registro PWA (Geralmente no arquivo public/sw.js ou vite-pwa)
 * Isso permite instalar o App no iPhone/Android (Adicionar à Tela de Início)
 * =========================================================================================

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Instalando CORE Engine...');
  e.waitUntil(
    caches.open('core-static-v1').then((cache) => {
      // Faz cache das cascas (HTML, JS, CSS) para abrir a tela no offline no milisegundo zero
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/vite.svg'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Estratégia Stale-While-Revalidate (Entrega o visual cacheado instantaneo, atualiza do servidor em bg)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        caches.open('core-dynamic').then((cache) => cache.put(e.request, networkResponse.clone()));
        return networkResponse;
      }).catch(() => {
        // Fallback total sem internet
      });
      return cachedResponse || fetchPromise;
    })
  );
});

*/
