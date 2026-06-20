interface ScoreCardProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  max: number;
  extra?: string;
  colorClass?: string;
  barColorClass?: string;
}

export default function ScoreCard({
  icon,
  label,
  score,
  max,
  extra,
  colorClass = 'text-emerald-400',
  barColorClass = 'bg-emerald-500',
}: ScoreCardProps) {
  const percent = max > 0 ? Math.min((score / max) * 100, 100) : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur">
      <div className="flex items-center gap-2 mb-3">
        <div className={colorClass}>{icon}</div>
        <span className="text-sm font-medium text-slate-300">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={`text-3xl font-display font-bold ${colorClass}`}>
          {score}
        </span>
        <span className="text-slate-500 font-mono">/ {max}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {extra && (
        <div className="text-xs text-slate-500">{extra}</div>
      )}
    </div>
  );
}
