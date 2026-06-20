import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import LevelCard from '../components/LevelCard';
import { LEVELS } from '../data/levels';
import { getHighScoreByLevel, isLevelUnlocked } from '../utils/storage';
import { useState, useEffect } from 'react';

export default function LevelSelect() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const handleLevelClick = (levelId: string) => {
    if (isLevelUnlocked(levelId)) {
      navigate(`/game/${levelId}`);
    } else {
      const level = LEVELS.find(l => l.id === levelId);
      if (level?.unlockScore) {
        showToast(`🔒 需要累计 ${level.unlockScore} 分解锁此关卡`);
      } else {
        showToast('🔒 此关卡尚未解锁');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-slate-800/90 border border-amber-500/40 backdrop-blur-md text-amber-300 font-medium shadow-lg animate-slide-in">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">选择关卡</h1>
            <p className="text-slate-400 text-sm mt-1">完成关卡获取更高分数解锁新内容</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {LEVELS.map((level, idx) => (
            <div key={level.id} style={{ animationDelay: `${idx * 100}ms` }}>
              <LevelCard
                level={level}
                highScore={getHighScoreByLevel(level.id)}
                isUnlocked={isLevelUnlocked(level.id)}
                onClick={() => handleLevelClick(level.id)}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-4xl mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">解锁提示</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                累计获得足够分数即可自动解锁高级关卡。优先获得 S 评级可大幅增加累计总分，VIP 行李和超重处理会提供额外加分奖励。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
