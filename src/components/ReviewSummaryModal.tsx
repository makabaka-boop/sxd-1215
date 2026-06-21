import { X, Target, Gauge, PlaneTakeoff, Timer, AlertCircle, ArrowLeftRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReviewSummary, ReviewSuggestion, ReviewCategory } from '../types';
import { getPriorityColor, getPriorityBgColor, getPriorityDotColor } from '../utils/review';
import GradeBadge from './GradeBadge';

interface ReviewSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewSummary | null;
  levelName?: string;
}

const categoryIcons: Record<ReviewCategory, React.ReactNode> = {
  accuracy: <Target className="w-4 h-4" />,
  overweight_speed: <Gauge className="w-4 h-4" />,
  gate_change: <ArrowLeftRight className="w-4 h-4" />,
  boarding: <PlaneTakeoff className="w-4 h-4" />,
  time_management: <Timer className="w-4 h-4" />,
  mistake_reduction: <AlertCircle className="w-4 h-4" />,
};

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

function SuggestionCard({ suggestion, index }: { suggestion: ReviewSuggestion; index: number }) {
  const priorityColor = getPriorityColor(suggestion.priority);
  const priorityBg = getPriorityBgColor(suggestion.priority);
  const priorityDot = getPriorityDotColor(suggestion.priority);
  const icon = categoryIcons[suggestion.category];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
      className={`relative pl-6 py-3 border ${priorityBg} rounded-xl`}
    >
      <div className="absolute left-3 top-4 w-2 h-2 rounded-full -translate-x-0.5 z-10">
        <div className={`w-full h-full rounded-full ${priorityDot}`} />
      </div>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${priorityColor}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-display font-bold text-sm ${priorityColor}`}>
              {suggestion.title}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityBg} ${priorityColor} font-semibold`}>
              {suggestion.priority === 'high' ? '高优先' : suggestion.priority === 'medium' ? '中优先' : '低优先'}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            {suggestion.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReviewSummaryModal({
  isOpen,
  onClose,
  review,
  levelName,
}: ReviewSummaryModalProps) {
  if (!review) return null;

  const hasSuggestions = review.suggestions.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-glass"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">复盘摘要</h2>
                    {levelName && (
                      <p className="text-sm text-slate-400">{levelName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <GradeBadge grade={review.grade} size="sm" />
                    </div>
                    <div className="text-2xl font-display font-black text-white">
                      {formatNumber(review.score)}
                    </div>
                    <div className="text-xs text-slate-500">最终得分</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-display font-black ${review.keyStats.accuracyRate >= 85 ? 'text-emerald-400' : review.keyStats.accuracyRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.accuracyRate}%
                    </div>
                    <div className="text-xs text-slate-500">分拣准确率</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-display font-black ${review.keyStats.mistakeCount === 0 ? 'text-emerald-400' : review.keyStats.mistakeCount <= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.mistakeCount}
                    </div>
                    <div className="text-xs text-slate-500">失误次数</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-black text-blue-400">
                      {review.keyStats.remainingTime}s
                    </div>
                    <div className="text-xs text-slate-500">剩余时间</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">主要失分点</span>
                    </div>
                    <p className="text-lg font-display font-bold text-white">{review.topWeakness}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">优先提升方向</span>
                    </div>
                    <p className="text-lg font-display font-bold text-white">{review.topImprovement}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-slate-400">准确率</span>
                    </div>
                    <div className={`font-mono font-bold ${review.keyStats.accuracyRate >= 85 ? 'text-emerald-400' : review.keyStats.accuracyRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.accuracyRate}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-slate-400">超重响应</span>
                    </div>
                    <div className={`font-mono font-bold ${review.keyStats.avgOverweightSpeed === 0 ? 'text-slate-400' : review.keyStats.avgOverweightSpeed <= 5000 ? 'text-emerald-400' : review.keyStats.avgOverweightSpeed <= 7000 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.avgOverweightSpeed === 0 ? '-' : `${review.keyStats.avgOverweightSpeed}ms`}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-slate-400">登机口确认</span>
                    </div>
                    <div className={`font-mono font-bold ${review.keyStats.gateChangeConfirmRate >= 90 ? 'text-emerald-400' : review.keyStats.gateChangeConfirmRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.gateChangeConfirmRate}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <PlaneTakeoff className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-slate-400">截载完成</span>
                    </div>
                    <div className={`font-mono font-bold ${review.keyStats.boardingCompleteRate >= 90 ? 'text-emerald-400' : review.keyStats.boardingCompleteRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                      {review.keyStats.boardingCompleteRate}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                    <h3 className="font-display text-lg font-bold text-white">改进建议</h3>
                    <span className="ml-auto px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-mono">
                      {review.suggestions.length} 条
                    </span>
                  </div>
                  {hasSuggestions ? (
                    <div className="space-y-3">
                      {review.suggestions.map((suggestion, index) => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-emerald-400 font-display font-bold text-lg">表现优秀！</p>
                      <p className="text-slate-400 text-sm mt-1">本局没有明显短板，继续保持</p>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-slate-500 pt-4 border-t border-white/10">
                  复盘时间：{formatDate(review.timestamp)}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
