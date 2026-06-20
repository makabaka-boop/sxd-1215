import { motion } from 'framer-motion';
import type { Grade } from '../types';

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
}

const gradeStyles: Record<Grade, { gradient: string; shadow: string; glow: boolean }> = {
  S: {
    gradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
    shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
    glow: true,
  },
  A: {
    gradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600',
    shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    glow: false,
  },
  B: {
    gradient: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600',
    shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.5)]',
    glow: false,
  },
  C: {
    gradient: 'bg-gradient-to-br from-green-400 via-emerald-500 to-green-600',
    shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]',
    glow: false,
  },
  D: {
    gradient: 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600',
    shadow: 'shadow-[0_0_20px_rgba(100,116,139,0.4)]',
    glow: false,
  },
};

const sizeClasses: Record<NonNullable<GradeBadgeProps['size']>, { box: string; text: string }> = {
  sm: { box: 'w-12 h-12 rounded-xl', text: 'text-2xl' },
  md: { box: 'w-16 h-16 rounded-2xl', text: 'text-4xl' },
  lg: { box: 'w-24 h-24 rounded-3xl', text: 'text-6xl' },
};

export default function GradeBadge({ grade, size = 'lg' }: GradeBadgeProps) {
  const style = gradeStyles[grade];
  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      className={`relative flex items-center justify-center ${sizes.box} ${style.gradient} ${style.shadow} ${style.glow ? 'animate-glow' : ''}`}
    >
      <div className="absolute inset-0 rounded-3xl bg-white/20 backdrop-blur-sm opacity-40" />
      <div className="absolute top-1 left-2 right-4 h-1/3 rounded-t-3xl bg-gradient-to-b from-white/40 to-transparent" />
      <span className={`relative font-display font-black ${sizes.text} text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}>
        {grade}
      </span>
    </motion.div>
  );
}
