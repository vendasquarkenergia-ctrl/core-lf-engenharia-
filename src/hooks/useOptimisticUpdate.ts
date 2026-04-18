import { useState, useCallback } from 'react';

/**
 * Hook para Atualização Otimista (Optimistic UI)
 * Ideal para canteiro de obras com internet instável.
 * 
 * @param initialState O estado inicial sincronizado
 */
export function useOptimisticUpdate<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const update = useCallback(async (
    optimisticValue: T, 
    serverAction: () => Promise<void>, 
    onError?: (err: Error) => void
  ) => {
    // 1. Snapshot da verdade anterior
    const previousState = state;
    
    // 2. Aplica a mudança otimista instantaneamente na tela
    setState(optimisticValue);

    try {
      // 3. Roda a action no background (network request)
      await serverAction();
      // Opcionalmente integrar aqui avisos de offline/queue (SyncQueue)
    } catch (error) {
      // 4. Em caso de falha/timeout, reverte suavemente
      setState(previousState);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [state]);

  return [state, update, setState] as const;
}
