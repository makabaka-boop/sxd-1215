import { useState, useEffect } from 'react';
import type { Baggage } from '../types';
import { getFlightColor } from '../data/levels';
import { getWeightLevelColor, getPriorityLabel, getPriorityColor, getWeightLevelBgColor } from '../utils/baggage';
import { AlertTriangle, ShieldAlert, GripVertical, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/gameStore';

interface BaggageCardProps {
  baggage: Baggage;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onHandleOverweight?: (id: string) => void;
  onSecurityRecheck?: (id: string) => void;
}

export default function BaggageCard({
  baggage,
  isSelected,
  onSelect,
  onDragStart,
  onHandleOverweight,
  onSecurityRecheck,
}: BaggageCardProps) {
  const [now, setNow] = useState(Date.now());
  const level = useGameStore((s) => s.level);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const flight = level?.flights.find((f) => f.id === baggage.flightId);
  const flightColor = getFlightColor(baggage.flightId);
  const weightPercent = Math.min((baggage.weight / 45) * 100, 100);
  const totalDuration = baggage.expiresAt - baggage.createdAt;
  const remaining = baggage.expiresAt - now;
  const expirePercent = Math.max((remaining / totalDuration) * 100, 0);
  const isExpiring = expirePercent < 30;
  const isOverweight = baggage.weightLevel === 'overweight';
  const needsSecurity = !baggage.isSecurityChecked;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('baggageId', baggage.id);
    onDragStart?.(e, baggage.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(baggage.id)}
      className={cn(
        'relative backdrop-blur-md bg-white/5 border rounded-xl p-3 w-[180px] cursor-grab active:cursor-grabbing transition-all duration-200 select-none',
        isSelected && 'border-2 shadow-glow-blue',
        baggage.status === 'sorted' && 'border-green-500 border-2',
        baggage.status === 'rejected' && 'animate-shake',
        isExpiring && baggage.status === 'pending' && 'border-red-500/80 animate-pulse-fast'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn('text-lg font-bold font-display', flightColor.text)}>
          {flight?.flightNo || '----'}
        </div>
        <GripVertical className="w-4 h-4 text-slate-500" />
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.5 rounded border font-medium',
            getPriorityColor(baggage.priority)
          )}
        >
          {getPriorityLabel(baggage.priority)}
        </span>
        <span className={cn('text-[10px] font-medium', getWeightLevelColor(baggage.weightLevel))}>
          {baggage.weight}kg
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-800 mb-2 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getWeightLevelBgColor(baggage.weightLevel))}
          style={{ width: `${weightPercent}%` }}
        />
      </div>

      <div className="text-[11px] text-slate-400 mb-2 truncate">{baggage.passengerName}</div>

      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
        <Clock className="w-3 h-3" />
        <span>{Math.ceil(remaining / 1000)}s</span>
      </div>

      {baggage.status === 'sorted' && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
      )}

      {baggage.status === 'rejected' && (
        <div className="absolute top-2 right-2">
          <XCircle className="w-5 h-5 text-red-400" />
        </div>
      )}

      {isOverweight && onHandleOverweight && baggage.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHandleOverweight(baggage.id);
          }}
          className="w-full mt-1 py-1 px-2 bg-purple-500/80 hover:bg-purple-500 text-white text-[11px] rounded-md flex items-center justify-center gap-1 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          处理超重
        </button>
      )}

      {needsSecurity && onSecurityRecheck && baggage.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSecurityRecheck(baggage.id);
          }}
          className="w-full mt-1 py-1 px-2 bg-orange-500/80 hover:bg-orange-500 text-white text-[11px] rounded-md flex items-center justify-center gap-1 transition-colors"
        >
          <ShieldAlert className="w-3 h-3" />
          安检复核
        </button>
      )}
    </div>
  );
}
