/**
 * Fake Sync Queue para PWA Offline-First
 * Salva ações locais se connection = off.
 */
export class SyncQueue {
  private static queue: any[] = [];

  static async addAction(action: { type: string, payload: any }) {
    this.queue.push({ ...action, timestamp: new Date().toISOString() });
    
    if (navigator.onLine) {
      console.log('Online. Syncing immediately...');
      this.sync();
    } else {
      console.warn('Sem conexão! Ação salva localmente.', action);
      // Aqui integrariamos com IndexedDB para PWA
      // E mostrariamos um Toast: "Salvo offline. Envio pendente."
    }
  }

  static async sync() {
    if (this.queue.length === 0) return;
    console.log(`[SyncQueue] Sending ${this.queue.length} actions to server...`);
    
    // Simula network delay
    setTimeout(() => {
      this.queue = [];
      console.log('[SyncQueue] Todas as ações pendentes sincronizadas com sucesso!');
    }, 1500);
  }
}
