import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameEngine(): void {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const tick = useGameStore(state => state.tick);
  const status = useGameStore(state => state.status);

  useEffect(() => {
    if (status !== 'playing' && status !== 'paused') return;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaMs = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (status === 'playing') {
        tick(deltaMs);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [status, tick]);
}
