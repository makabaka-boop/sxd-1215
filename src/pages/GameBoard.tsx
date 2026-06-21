import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { useKeyboard } from '../hooks/useKeyboard';
import TimerBar from '../components/TimerBar';
import EventBanner from '../components/EventBanner';
import BaggageCard from '../components/BaggageCard';
import ChannelColumn from '../components/ChannelColumn';
import PauseModal from '../components/PauseModal';
import { CheckCircle2, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DragState {
  isDragging: boolean;
  baggageId: string | null;
  flightId: string | null;
}

export default function GameBoard() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const status = useGameStore((s) => s.status);
  const level = useGameStore((s) => s.level);
  const remainingMs = useGameStore((s) => s.remainingMs);
  const baggages = useGameStore((s) => s.baggages);
  const channels = useGameStore((s) => s.channels);
  const activeEvents = useGameStore((s) => s.activeEvents);
  const toasts = useGameStore((s) => s.toasts);
  const selectedBaggageId = useGameStore((s) => s.selectedBaggageId);

  const startLevel = useGameStore((s) => s.startLevel);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);
  const reset = useGameStore((s) => s.reset);
  const trySortBaggage = useGameStore((s) => s.trySortBaggage);
  const selectBaggage = useGameStore((s) => s.selectBaggage);
  const handleOverweight = useGameStore((s) => s.handleOverweight);
  const handleSecurityRecheck = useGameStore((s) => s.handleSecurityRecheck);
  const dismissToast = useGameStore((s) => s.dismissToast);
  const scoreState = useGameStore((s) => s.scoreState);
  const dismissToastStore = useGameStore((s) => s.dismissToast);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    baggageId: null,
    flightId: null,
  });

  useGameEngine();
  useKeyboard();

  useEffect(() => {
    if (levelId) {
      startLevel(levelId);
    }
    return () => {
      reset();
    };
  }, [levelId, startLevel, reset]);

  useEffect(() => {
    if (status === 'finished' && levelId) {
      navigate(`/result/${levelId}`);
    }
  }, [status, levelId, navigate]);

  const score = scoreState.baseScore - scoreState.penaltyScore;

  const pendingBaggages = baggages.filter((b) => b.status === 'pending');
  const sortedCount = baggages.filter((b) => b.status === 'sorted').length;

  const handleDragStart = useCallback(
    (_e: React.DragEvent, baggageId: string) => {
      const baggage = baggages.find((b) => b.id === baggageId);
      setDragState({
        isDragging: true,
        baggageId,
        flightId: baggage?.flightId || null,
      });
    },
    [baggages]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, baggageId: null, flightId: null });
  }, []);

  useEffect(() => {
    if (!dragState.isDragging) return;
    const handleGlobalDragEnd = () => handleDragEnd();
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => window.removeEventListener('dragend', handleGlobalDragEnd);
  }, [dragState.isDragging, handleDragEnd]);

  const handleChannelDrop = useCallback(
    (e: React.DragEvent, channelId: string) => {
      const baggageId = e.dataTransfer.getData('baggageId');
      if (baggageId) {
        trySortBaggage(baggageId, channelId);
      }
      handleDragEnd();
    },
    [trySortBaggage, handleDragEnd]
  );

  const handleChannelClick = useCallback(
    (channelId: string) => {
      if (selectedBaggageId) {
        trySortBaggage(selectedBaggageId, channelId);
      }
    },
    [selectedBaggageId, trySortBaggage]
  );

  const isChannelHighlighted = useCallback(
    (channelFlightId: string) => {
      return dragState.isDragging && dragState.flightId === channelFlightId;
    },
    [dragState]
  );

  const getChannelBaggageCount = (channelId: string) => {
    return channels.find((c) => c.id === channelId)?.baggageIds.length || 0;
  };

  const toastStyles: Record<string, string> = {
    success: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300',
    error: 'border-red-500/60 bg-red-500/20 text-red-300',
    warning: 'border-amber-500/60 bg-amber-500/20 text-amber-300',
    info: 'border-blue-500/60 bg-blue-500/20 text-blue-300',
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden"
      onDragEnd={handleDragEnd}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <TimerBar
        totalMs={level ? level.duration * 1000 : 0}
        remainingMs={remainingMs}
        score={score}
        onPause={pause}
        isPaused={status === 'paused'}
        levelName={level?.name || ''}
      />

      <EventBanner events={activeEvents} />

      <div className="fixed top-4 right-4 z-40 flex flex-col gap-2 w-72">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 50, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 50, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => dismissToastStore(toast.id)}
              className={`px-4 py-2.5 rounded-xl border backdrop-blur-md cursor-pointer text-sm font-medium ${toastStyles[toast.type] || toastStyles.info}`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-24 sm:pt-28 pb-40 sm:pb-32 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 sm:gap-6 h-full">
          <div className="flex flex-col min-h-0 lg:h-full lg:overflow-hidden">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">待分拣行李</h2>
              <span className="ml-auto px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 text-slate-300 text-xs sm:text-sm font-mono">
                {pendingBaggages.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3">
              <div className="flex flex-wrap gap-2 sm:gap-3 content-start">
                {pendingBaggages.map((baggage) => (
                  <BaggageCard
                    key={baggage.id}
                    baggage={baggage}
                    isSelected={selectedBaggageId === baggage.id}
                    onSelect={selectBaggage}
                    onDragStart={handleDragStart}
                    onHandleOverweight={handleOverweight}
                    onSecurityRecheck={handleSecurityRecheck}
                  />
                ))}
              </div>
              {pendingBaggages.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-slate-500">
                  <div className="text-sm">等待行李到达...</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col min-h-0 lg:h-full lg:overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-full overflow-x-auto lg:overflow-visible">
              {channels.map((channel) => {
                const flight = level?.flights.find((f) => f.id === channel.flightId);
                return (
                  <ChannelColumn
                    key={channel.id}
                    channel={channel}
                    flight={flight}
                    baggageCount={getChannelBaggageCount(channel.id)}
                    isHighlighted={isChannelHighlighted(channel.flightId)}
                    onDrop={(e) => handleChannelDrop(e, channel.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => handleChannelClick(channel.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-display font-bold">
                已分拣 {sortedCount} 件
              </span>
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              快捷键：Tab切换行李 · 先选中再按数字键分拣 · 空格确认 · Esc暂停/恢复
            </div>
          </div>
          <button
            onClick={() => useGameStore.getState().bulkConfirm()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
            确认分拣 (空格)
          </button>
        </div>
      </div>

      <PauseModal
        isOpen={status === 'paused'}
        onResume={resume}
        onRestart={() => levelId && startLevel(levelId)}
        onExit={() => navigate('/levels')}
      />

      {toasts.length > 0 && (() => {
        void dismissToast;
        return null;
      })()}
    </div>
  );
}
