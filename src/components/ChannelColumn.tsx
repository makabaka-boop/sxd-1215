import { useState } from 'react';
import type { Channel, Flight } from '../types';
import { getFlightColor } from '../data/levels';
import { formatSec } from '../utils/baggage';
import { Plane, MapPin, Package, Timer, ArrowRightLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/gameStore';

interface ChannelColumnProps {
  channel: Channel;
  flight: Flight | undefined;
  baggageCount: number;
  isHighlighted: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
}

export default function ChannelColumn({
  channel,
  flight,
  baggageCount,
  isHighlighted,
  onDrop,
  onDragOver,
  onClick,
}: ChannelColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const gameTimeMs = useGameStore((s) => s.gameTimeMs);
  const handleGateChangeConfirm = useGameStore((s) => s.handleGateChangeConfirm);

  const flightColor = getFlightColor(channel.flightId);
  const capacityPercent = channel.capacity > 0 ? (channel.currentLoad / channel.capacity) * 100 : 0;
  const showHighlight = isHighlighted || isDragOver;

  const boardingRemainingSec = channel.isBoarding && channel.boardingDeadline
    ? Math.max(0, Math.ceil((channel.boardingDeadline - gameTimeMs) / 1000))
    : 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      className={cn(
        'h-full rounded-2xl p-2 sm:p-4 flex flex-col gap-2 sm:gap-3 border min-w-[140px] sm:min-w-[160px] md:min-w-[200px] cursor-pointer transition-all duration-200',
        'backdrop-blur-md bg-white/5',
        showHighlight && cn('border-2', flightColor.border, flightColor.glow),
        channel.changedGate && !channel.gateChangeConfirmed && 'border-orange-500/60 border-2'
      )}
    >
      <div className={cn('rounded-xl p-2 sm:p-3', flightColor.bg)}>
        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
          <Plane className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', flightColor.text)} />
          <span className={cn('text-sm sm:text-base font-bold font-display truncate', flightColor.text)}>
            {flight?.flightNo || '----'}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span className="text-xs sm:text-sm text-slate-300 truncate">{flight?.destination || '--'}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-0.5 sm:py-1">
        {channel.changedGate ? (
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm text-slate-500 line-through truncate max-w-[40px] sm:max-w-none">{flight?.gate || '--'}</span>
              <ArrowRightLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
              <span className="text-xs sm:text-sm font-semibold text-orange-400">{channel.changedGate}</span>
            </div>
            {channel.gateChangeConfirmed ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                <span className="text-[9px] sm:text-[10px] font-medium text-emerald-400">已确认</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-orange-400">待确认</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (channel.gateChangeEventId) {
                      handleGateChangeConfirm(channel.gateChangeEventId);
                    }
                  }}
                  className="w-full py-1 px-2 bg-blue-500/80 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  确认新登机口
                </button>
              </>
            )}
          </div>
        ) : (
          <span className="text-xs sm:text-sm text-slate-400 truncate">登机口: {flight?.gate || '--'}</span>
        )}
      </div>

      <div className="w-full">
        <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mb-0.5 sm:mb-1">
          <span>容量</span>
          <span>{channel.currentLoad}/{channel.capacity}</span>
        </div>
        <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', flightColor.bg.replace('/20', ''))}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
      </div>

      {channel.isBoarding && (
        <div
          className={cn(
            'flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-lg bg-red-500/20 border border-red-500/50',
            boardingRemainingSec <= 5 && 'animate-pulse-fast'
          )}
        >
          <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
          <span className="text-xs sm:text-sm font-semibold text-red-400">
            截载: {formatSec(boardingRemainingSec)}
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          className={cn(
            'text-4xl sm:text-5xl md:text-7xl font-bold font-display transition-all',
            showHighlight ? flightColor.text : 'text-slate-700'
          )}
        >
          {channel.shortcutKey}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-1.5 sm:py-2 rounded-xl bg-slate-800/50">
        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
        <span className="text-xs sm:text-sm font-medium text-slate-300">{baggageCount} 件</span>
      </div>
    </motion.div>
  );
}
