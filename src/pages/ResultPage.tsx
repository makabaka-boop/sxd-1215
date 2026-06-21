import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLastResult, getHighScoreByLevel, saveHighScore, isLevelUnlocked, getLastReview } from '../utils/storage';
import GradeBadge from '../components/GradeBadge';
import ScoreCard from '../components/ScoreCard';
import MistakeTimeline from '../components/MistakeTimeline';
import { ArrowLeft, RotateCcw, Layers, Home, Target, Gauge, PlaneTakeoff, AlertCircle, Timer, TrendingUp, Award, ArrowLeftRight, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { generateReviewSuggestions, getPriorityColor, getPriorityBgColor, getPriorityDotColor } from '../utils/review';
import type { ReviewSuggestion, ReviewCategory } from '../types';

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function AnimatedScore({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const display = useTransform(rounded, (v) => formatNumber(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [motionValue, value]);

  return <motion.span>{display}</motion.span>;
}

const suggestionIcons: Record<ReviewCategory, React.ReactNode> = {
  accuracy: <Target className="w-4 h-4" />,
  overweight_speed: <Gauge className="w-4 h-4" />,
  gate_change: <ArrowLeftRight className="w-4 h-4" />,
  boarding: <PlaneTakeoff className="w-4 h-4" />,
  time_management: <Timer className="w-4 h-4" />,
  mistake_reduction: <AlertCircle className="w-4 h-4" />,
};

function SuggestionItem({ suggestion, index }: { suggestion: ReviewSuggestion; index: number }) {
  const priorityColor = getPriorityColor(suggestion.priority);
  const priorityBg = getPriorityBgColor(suggestion.priority);
  const priorityDot = getPriorityDotColor(suggestion.priority);
  const icon = suggestionIcons[suggestion.category];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
      className="relative flex items-start gap-3 pl-6 py-2"
    >
      <div className="absolute left-0 top-3 w-3 h-3 rounded-full -translate-x-0.5 ring-2 ring-slate-800 z-10">
        <div className={`w-full h-full rounded-full ${priorityDot}`} />
      </div>
      <div className={`flex-shrink-0 mt-0.5 ${priorityColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
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
    </motion.div>
  );
}

export default function ResultPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const storeResult = useGameStore((s) => s.lastResult);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [prevHighScore, setPrevHighScore] = useState<number | null>(null);

  const rawLastResult = getLastResult();
  const matchedLastResult = rawLastResult && levelId && rawLastResult.levelId === levelId ? rawLastResult : null;
  const result = storeResult || matchedLastResult;

  const suggestions = useMemo(() => {
    if (!result) return [];
    return generateReviewSuggestions(result);
  }, [result]);

  const reviewSummary = useMemo(() => {
    if (!result) return null;
    return getLastReview();
  }, [result]);

  useEffect(() => {
    if (result && levelId) {
      const existing = getHighScoreByLevel(levelId);
      if (existing) {
        setPrevHighScore(existing.score);
      }
      const saved = saveHighScore(result);
      if (saved) {
        setIsNewRecord(true);
      }
      void isLevelUnlocked;
    }
  }, [result, levelId]);

  if (!result) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-6">暂无结算数据</div>
          <button
            onClick={() => navigate('/levels')}
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold transition-colors"
          >
            返回关卡选择
          </button>
        </div>
      </div>
    );
  }

  const { breakdown, grade, totalScore, sortedCount, totalBaggageCount, playTime, mistakes, overweightHandles, boardingCompletions, gateChangeHandles } = result;

  const accuracyRate = breakdown.accuracy.max > 0 ? Math.round(breakdown.accuracy.rate * 100) : 0;
  const avgSpeed = breakdown.overweight.avgSpeed;
  const completeRate = breakdown.boarding.max > 0 ? Math.round(breakdown.boarding.completeRate * 100) : 100;
  const mistakeCount = breakdown.mistakes.count;
  const gateChangeTriggerCount = gateChangeHandles.length;
  const gateChangeConfirmCount = gateChangeHandles.filter(h => h.confirmedAt !== undefined).length;
  const gateChangeUnconfirmCount = gateChangeHandles.reduce((sum, h) => sum + h.unconfirmedMistakes, 0);

  const isBeaten = prevHighScore !== null && totalScore > prevHighScore;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/levels')}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">关卡结算</h1>
            <p className="text-slate-400 text-sm mt-1">查看本局表现与评分详情</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center min-w-[320px]">
            <div className="mb-6">
              <GradeBadge grade={grade} size="lg" />
            </div>

            <div className="text-center mb-6">
              <div className="text-slate-400 text-sm mb-2">最终得分</div>
              <div className="font-display font-black text-5xl md:text-6xl text-white mb-2">
                <AnimatedScore value={totalScore} />
              </div>
              {isBeaten && prevHighScore !== null && (
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">超越历史最高 {formatNumber(totalScore - prevHighScore)} 分</span>
                </div>
              )}
              {!isBeaten && prevHighScore !== null && (
                <div className="text-slate-500 text-sm">
                  历史最高: {formatNumber(prevHighScore)} 分
                </div>
              )}
              {isNewRecord && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-semibold text-sm">
                  <Award className="w-4 h-4" />
                  新纪录!
                </div>
              )}
            </div>

            <div className="w-full space-y-3 pt-6 border-t border-white/10">
              <div className="text-slate-300 font-display font-semibold text-lg mb-3">本局统计</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">分拣进度</span>
                </div>
                <span className="font-mono font-bold text-white">{sortedCount}/{totalBaggageCount} 件</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">用时</span>
                </div>
                <span className="font-mono font-bold text-white">{formatTime(playTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">正确率</span>
                </div>
                <span className="font-mono font-bold text-white">{accuracyRate}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreCard
                icon={<Target className="w-6 h-6" />}
                label="分拣正确率"
                score={breakdown.accuracy.score}
                max={breakdown.accuracy.max}
                extra={`正确率 ${accuracyRate}%`}
                colorClass="text-emerald-400"
                barColorClass="bg-emerald-500"
              />
              <ScoreCard
                icon={<Gauge className="w-6 h-6" />}
                label="超重处理速度"
                score={breakdown.overweight.score}
                max={breakdown.overweight.max}
                extra={overweightHandles.length > 0 ? `平均 ${avgSpeed.toFixed(0)}ms` : '无超重行李'}
                colorClass="text-purple-400"
                barColorClass="bg-purple-500"
              />
              <ScoreCard
                icon={<PlaneTakeoff className="w-6 h-6" />}
                label="截载完成率"
                score={breakdown.boarding.score}
                max={breakdown.boarding.max}
                extra={boardingCompletions.length > 0 ? `完成率 ${completeRate}%` : '无截载事件'}
                colorClass="text-orange-400"
                barColorClass="bg-orange-500"
              />
              <ScoreCard
                icon={<ArrowLeftRight className="w-6 h-6" />}
                label="登机口变更处理"
                score={breakdown.gateChange.score}
                max={breakdown.gateChange.max}
                extra={gateChangeTriggerCount > 0 ? `触发 ${gateChangeTriggerCount} 次 · 确认 ${gateChangeConfirmCount} 次 · 漏确认 ${gateChangeUnconfirmCount} 次` : '无登机口变更'}
                colorClass="text-blue-400"
                barColorClass="bg-blue-500"
              />
              <ScoreCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="错分惩罚"
                score={breakdown.mistakes.score}
                max={breakdown.mistakes.max}
                extra={mistakeCount > 0 ? `错分 ${mistakeCount} 次` : '无错分记录'}
                colorClass="text-red-400"
                barColorClass="bg-red-500"
              />
              <ScoreCard
                icon={<Timer className="w-6 h-6" />}
                label="剩余时间奖励"
                score={breakdown.timeBonus.score}
                max={breakdown.timeBonus.max}
                extra={`剩余 ${breakdown.timeBonus.remaining}s`}
                colorClass="text-blue-400"
                barColorClass="bg-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <h3 className="font-display text-xl font-bold text-white">失分原因时间线</h3>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-mono">
              {mistakes.length} 条
            </span>
          </div>
          <MistakeTimeline mistakes={mistakes} maxItems={15} />
        </div>

        {reviewSummary && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">主要失分点</span>
                </div>
                <p className="text-xl font-display font-bold text-white">{reviewSummary.topWeakness}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">优先提升方向</span>
                </div>
                <p className="text-xl font-display font-bold text-white">{reviewSummary.topImprovement}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-xl font-bold text-white">赛后改进建议</h3>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-mono">
              {suggestions.length} 条
            </span>
          </div>
          {suggestions.length > 0 ? (
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur border border-white/10">
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem key={suggestion.id} suggestion={suggestion} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-display font-bold text-lg">表现优秀！</p>
              <p className="text-slate-400 text-sm mt-1">本局没有明显短板，继续保持</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => levelId && navigate(`/game/${levelId}`)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            再来一次
          </button>
          <button
            onClick={() => navigate('/levels')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold text-lg transition-colors"
          >
            <Layers className="w-5 h-5" />
            返回关卡
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-display font-bold text-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
