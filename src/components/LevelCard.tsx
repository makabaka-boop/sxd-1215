import type { LevelConfig, HighScoreRecord } from '../types';
import { Star, Play, Lock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface LevelCardProps {
  level: LevelConfig;
  highScore?: HighScoreRecord;
  isUnlocked: boolean;
  onClick: () => void;
}

const difficultyGlow: Record<number, string> = {
  1: 'hover:shadow-glow-green',
  2: 'hover:shadow-glow-blue',
  3: 'hover:shadow-glow-purple',
  4: 'hover:shadow-glow-orange',
  5: 'hover:shadow-glow-red',
};

const gradeColors: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-purple-400',
  B: 'text-blue-400',
  C: 'text-green-400',
  D: 'text-gray-400',
};

export default function LevelCard({ level, highScore, isUnlocked, onClick }: LevelCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < level.difficulty);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      onClick={isUnlocked ? onClick : undefined}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-md p-5 transition-all duration-300 ${
        isUnlocked
          ? `bg-white/5 border-white/10 cursor-pointer hover:scale-105 hover:border-white/20 ${difficultyGlow[level.difficulty] || ''}`
          : 'bg-slate-800/60 border-slate-700/50 cursor-not-allowed'
      }`}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <Lock className="w-10 h-10 text-slate-500" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-display font-bold text-xl mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
            {level.name}
          </h3>
          <div className="flex items-center gap-0.5">
            {stars.map((filled, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
              />
            ))}
          </div>
        </div>
        {highScore && isUnlocked && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono text-yellow-400 font-bold">{highScore.score}</span>
          </div>
        )}
      </div>

      <p className={`text-sm mb-4 line-clamp-2 ${isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
        {level.description}
      </p>

      <div className="flex items-center justify-between">
        {highScore ? (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-slate-500">最高:</span>
            <span className={`font-mono font-bold ${gradeColors[highScore.grade] || 'text-slate-300'}`}>
              {highScore.score} {highScore.grade}
            </span>
          </div>
        ) : (
          <span className={`text-sm ${isUnlocked ? 'text-slate-500' : 'text-slate-600'}`}>
            {isUnlocked ? '暂无记录' : `需 ${level.unlockScore} 分解锁`}
          </span>
        )}

        {isUnlocked && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-glow-green">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
