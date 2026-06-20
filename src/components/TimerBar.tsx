import { formatSec } from '../utils/baggage';
import { Pause, Clock, Trophy } from 'lucide-react';

interface TimerBarProps {
  totalMs: number;
  remainingMs: number;
  score: number;
  onPause: () => void;
  isPaused: boolean;
  levelName: string;
}

export default function TimerBar({
  totalMs,
  remainingMs,
  score,
  onPause,
  isPaused,
  levelName,
}: TimerBarProps) {
  const progress = Math.max((remainingMs / totalMs) * 100, 0);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const isUrgent = remainingMs < 10000;
  const gradientClass = progress > 30
    ? 'bg-gradient-to-r from-blue-500 to-orange-500'
    : 'bg-gradient-to-r from-orange-500 to-red-500';

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-900/90 to-slate-900/70">
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="text-slate-200 font-display font-bold truncate max-w-[120px]">
              {levelName}
            </div>
            <div className={`flex items-center gap-1.5 text-lg font-mono font-bold ${isUrgent ? 'text-red-400 animate-pulse-fast' : 'text-white'}`}>
              <Clock className="w-4 h-4" />
              <span>{formatSec(remainingSec)}</span>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${gradientClass} ${isUrgent ? 'animate-pulse-fast' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400 font-display font-bold">
              <Trophy className="w-5 h-5" />
              <span className="text-lg min-w-[60px] text-right">{score}</span>
            </div>
            <button
              onClick={onPause}
              disabled={isPaused}
              className="p-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
