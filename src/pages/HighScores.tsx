import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, RefreshCw, TrendingUp, Eye } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { getHighScoreByLevel } from '../utils/storage';
import GradeBadge from '../components/GradeBadge';
import ReviewSummaryModal from '../components/ReviewSummaryModal';
import { useState, useCallback } from 'react';
import type { ReviewSummary } from '../types';

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

function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '入门',
    2: '简单',
    3: '普通',
    4: '困难',
    5: '地狱',
  };
  return labels[level] || `${level}级`;
}

function getDifficultyColor(level: number): string {
  const colors: Record<number, string> = {
    1: 'text-emerald-400',
    2: 'text-green-400',
    3: 'text-blue-400',
    4: 'text-purple-400',
    5: 'text-red-400',
  };
  return colors[level] || 'text-slate-400';
}

export default function HighScores() {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewSummary | null>(null);
  const [selectedLevelName, setSelectedLevelName] = useState<string>('');

  const handleReload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const handleViewReview = useCallback((review: ReviewSummary | undefined, levelName: string) => {
    if (review) {
      setSelectedReview(review);
      setSelectedLevelName(levelName);
      setModalOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">最高分榜</h1>
              <p className="text-slate-400 text-sm mt-1">各关卡最高得分记录</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="col-span-3 text-slate-400 text-sm font-semibold">关卡名称</div>
            <div className="col-span-2 text-slate-400 text-sm font-semibold">难度</div>
            <div className="col-span-2 text-slate-400 text-sm font-semibold text-right">分数</div>
            <div className="col-span-1 text-slate-400 text-sm font-semibold text-center">评级</div>
            <div className="col-span-2 text-slate-400 text-sm font-semibold text-center">登机口变更</div>
            <div className="col-span-1 text-slate-400 text-sm font-semibold text-center">复盘</div>
            <div className="col-span-1 text-slate-400 text-sm font-semibold text-right">达成时间</div>
          </div>

          <div className="divide-y divide-white/5" key={reloadKey}>
            {LEVELS.map((level, idx) => {
              const record = getHighScoreByLevel(level.id);
              const isGradeS = record?.grade === 'S';
              const hasReview = record?.lastReview !== undefined;

              return (
                <div
                  key={level.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${isGradeS ? 'bg-amber-500/10' : 'hover:bg-white/5'}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Star className={`w-5 h-5 ${isGradeS ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-display font-bold text-lg truncate ${isGradeS ? 'text-amber-200' : 'text-white'}`}>
                        {level.name}
                      </div>
                      <div className="text-xs text-slate-500 md:hidden">{getDifficultyLabel(level.difficulty)}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 hidden md:block">
                    <span className={`font-semibold ${getDifficultyColor(level.difficulty)}`}>
                      {getDifficultyLabel(level.difficulty)}
                    </span>
                  </div>

                  <div className="md:col-span-2 md:text-right">
                    {record ? (
                      <span className={`font-mono font-black text-2xl ${isGradeS ? 'text-amber-400' : 'text-white'}`}>
                        {formatNumber(record.score)}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono text-2xl">—</span>
                    )}
                  </div>

                  <div className="md:col-span-1 flex md:justify-center">
                    {record ? (
                      <GradeBadge grade={record.grade} size="sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-600 font-display font-bold text-xl">
                        -
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex md:justify-center">
                    {record?.gateChangeStats ? (
                      <div className="text-center">
                        <div className="text-xs font-mono text-slate-300">
                          <span className="text-emerald-400">{record.gateChangeStats.confirmCount}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{record.gateChangeStats.triggerCount}</span>
                        </div>
                        {record.gateChangeStats.unconfirmedCount > 0 && (
                          <div className="text-[10px] text-red-400">
                            漏确认 {record.gateChangeStats.unconfirmedCount}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">-</span>
                    )}
                  </div>

                  <div className="md:col-span-1 flex md:justify-center">
                    {hasReview ? (
                      <button
                        onClick={() => handleViewReview(record?.lastReview, level.name)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/60 transition-all text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">查看</span>
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">-</span>
                    )}
                  </div>

                  <div className="md:col-span-1 md:text-right">
                    {record ? (
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDate(record.timestamp)}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ReviewSummaryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          review={selectedReview}
          levelName={selectedLevelName}
        />

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-display font-semibold transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            刷新本地记录
          </button>
        </div>
      </div>
    </div>
  );
}
