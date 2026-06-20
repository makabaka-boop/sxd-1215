import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useKeyboard(): void {
  const status = useGameStore(state => state.status);
  const pause = useGameStore(state => state.pause);
  const resume = useGameStore(state => state.resume);
  const sortSelectedByShortcut = useGameStore(state => state.sortSelectedByShortcut);
  const bulkConfirm = useGameStore(state => state.bulkConfirm);
  const selectBaggage = useGameStore(state => state.selectBaggage);
  const selectedBaggageId = useGameStore(state => state.selectedBaggageId);
  const baggages = useGameStore(state => state.baggages);

  useEffect(() => {
    if (status !== 'playing' && status !== 'paused') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        sortSelectedByShortcut(e.key);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (status === 'playing') {
          pause();
        } else if (status === 'paused') {
          resume();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        bulkConfirm();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const pending = baggages.filter(b => b.status === 'pending');
        if (pending.length === 0) {
          selectBaggage(null);
          return;
        }

        const currentIndex = selectedBaggageId
          ? pending.findIndex(b => b.id === selectedBaggageId)
          : -1;

        let nextIndex: number;
        if (e.shiftKey) {
          nextIndex = currentIndex <= 0 ? pending.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex >= pending.length - 1 ? 0 : currentIndex + 1;
        }

        selectBaggage(pending[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, pause, resume, sortSelectedByShortcut, bulkConfirm, selectBaggage, selectedBaggageId, baggages]);
}
