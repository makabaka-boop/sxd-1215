import type { MistakeRecord, MistakeType } from '../types';
import { XCircle, AlertTriangle, TimerOff, ShieldAlert, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface MistakeTimelineProps {
  mistakes: MistakeRecord[];
  maxItems?: number;
}

const mistakeIcon: Record<MistakeType, React.ReactNode> = {
  wrong_channel: <XCircle className="w-4 h-4" />,
  overweight_ignored: <AlertTriangle className="w-4 h-4" />,
  missed_boarding: <TimerOff className="w-4 h-4" />,
  security_failed: <ShieldAlert className="w-4 h-4" />,
  baggage_expired: <Clock className="w-4 h-4" />,
};

const mistakeSeverity: Record<MistakeType, { dot: string; icon: string; penalty: string }> = {
  wrong_channel: { dot: 'bg-red-500', icon: 'text-red-400', penalty: 'text-red-400' },
  overweight_ignored: { dot: 'bg-orange-500', icon: 'text-orange-400', penalty: 'text-orange-400' },
  missed_boarding: { dot: 'bg-red-500', icon: 'text-red-400', penalty: 'text-red-400' },
  security_failed: { dot: 'bg-orange-500', icon: 'text-orange-400', penalty: 'text-orange-400' },
  baggage_expired: { dot: 'bg-yellow-500', icon: 'text-yellow-400', penalty: 'text-yellow-400' },
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function MistakeTimeline({ mistakes, maxItems = 10 }: MistakeTimelineProps) {
  const sortedMistakes = [...mistakes].sort((a, b) => b.time - a.time).slice(0, maxItems);

  if (sortedMistakes.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-4 backdrop-blur border border-white/10">
        <div className="text-slate-500 text-sm text-center py-4">暂无失分记录</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 backdrop-blur border border-white/10">
      <div className="space-y-1">
        {sortedMistakes.map((mistake, index) => {
          const severity = mistakeSeverity[mistake.type];
          const icon = mistakeIcon[mistake.type];
          return (
            <motion.div
              key={mistake.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 25 }}
              className="relative flex items-start gap-3 pl-6 py-2"
            >
              <div className="absolute left-0 top-3 w-3 h-3 rounded-full -translate-x-0.5 ring-2 ring-slate-800 z-10">
                <div className={`w-full h-full rounded-full ${severity.dot}`} />
              </div>
              {index < sortedMistakes.length - 1 && (
                <div className="absolute left-1.5 top-6 w-px h-full bg-white/10" />
              )}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 w-12 flex-shrink-0">
                  {formatTime(mistake.time)}
                </span>
                <div className={`flex-shrink-0 ${severity.icon}`}>
                  {icon}
                </div>
                <span className="text-sm text-slate-300 flex-1 truncate">
                  {mistake.description}
                </span>
                <span className={`font-mono font-bold text-sm flex-shrink-0 ${severity.penalty}`}>
                  -{mistake.penalty}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
