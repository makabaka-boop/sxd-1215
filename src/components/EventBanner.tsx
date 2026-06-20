import type { GameEvent } from '../types';
import { ArrowLeftRight, AlertTriangle, Timer, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

interface EventBannerProps {
  events: GameEvent[];
}

const eventStyles: Record<string, string> = {
  gate_change: 'border-blue-500/60 bg-blue-500/20',
  overweight_alert: 'border-purple-500/60 bg-purple-500/20',
  early_boarding: 'border-orange-500/60 bg-orange-500/20',
  security_recheck: 'border-yellow-500/60 bg-yellow-500/20',
};

const eventTextColors: Record<string, string> = {
  gate_change: 'text-blue-300',
  overweight_alert: 'text-purple-300',
  early_boarding: 'text-orange-300',
  security_recheck: 'text-yellow-300',
};

const EventIcon = ({ type }: { type: string }) => {
  const className = 'w-6 h-6';
  switch (type) {
    case 'gate_change':
      return <ArrowLeftRight className={`${className} text-blue-400`} />;
    case 'overweight_alert':
      return <AlertTriangle className={`${className} text-purple-400`} />;
    case 'early_boarding':
      return <Timer className={`${className} text-orange-400`} />;
    case 'security_recheck':
      return <ShieldAlert className={`${className} text-yellow-400`} />;
    default:
      return null;
  }
};

export default function EventBanner({ events }: EventBannerProps) {
  const gameTimeMs = useGameStore((s) => s.gameTimeMs);
  const activeEvents = events.filter((e) => !e.resolved);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
      <div className="flex flex-wrap gap-3 justify-center pt-20">
        <AnimatePresence mode="popLayout">
          {activeEvents.map((event) => {
            const elapsedSec = gameTimeMs / 1000 - event.triggerTime;
            const remainingSec = Math.max(Math.ceil(event.duration - elapsedSec), 0);
            return (
              <motion.div
                key={event.id}
                initial={{ y: -30, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border-2 backdrop-blur-md min-w-[280px] max-w-[360px] animate-slide-in ${eventStyles[event.type] || ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <EventIcon type={event.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-display font-bold text-base mb-0.5 ${eventTextColors[event.type] || 'text-white'}`}>
                    {event.title}
                  </div>
                  <div className="text-sm text-slate-300/90">{event.message}</div>
                </div>
                <div className="flex-shrink-0 font-mono font-bold text-lg text-white/80">
                  {remainingSec}s
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
