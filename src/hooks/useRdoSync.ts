import { useState, useEffect, useCallback } from 'react';

const QUEUE_KEY = 'lf_os_sync_queue';
const DRAFT_KEY = 'lf_os_rdo_draft';

export function useRdoSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'PENDING' | 'COMPLETED'>('IDLE');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine && JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]').length > 0) {
      setSyncStatus('PENDING');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveDraft = useCallback((data: any) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
  }, []);

  const getDraft = useCallback(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const addToQueue = useCallback((data: any) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ id: Date.now(), data, timestamp: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    setSyncStatus('PENDING');
  }, []);

  const syncQueue = useCallback(async () => {
    if (!isOnline) return;
    
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    setSyncStatus('SYNCING');
    
    try {
      // Mock API post (Wait 1.5s to simulate network latency on site)
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real prod environment we send the queue items to Supabase PostgreSQL here
      localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
      setSyncStatus('COMPLETED');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    } catch (err) {
      console.error('Failed to sync queue', err);
      setSyncStatus('PENDING');
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  const submitRdo = useCallback(async (data: any) => {
    if (!navigator.onLine) {
      addToQueue(data);
      clearDraft();
      return { success: true, queued: true };
    }

    setSyncStatus('SYNCING');
    try {
      // Mock instant API post (Send RDO to the cloud)
      await new Promise(resolve => setTimeout(resolve, 800));
      clearDraft();
      setSyncStatus('COMPLETED');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
      return { success: true, queued: false };
    } catch (error) {
      addToQueue(data);
      clearDraft();
      return { success: true, queued: true };
    }
  }, [addToQueue, clearDraft]);

  return {
    isOnline,
    syncStatus,
    saveDraft,
    getDraft,
    submitRdo
  };
}
