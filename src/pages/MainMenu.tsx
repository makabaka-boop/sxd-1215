import { useNavigate } from 'react-router-dom';
import { Plane, Play, Layers, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FLIGHT_DATA = [
  { no: 'CA1001', dest: '北京', gate: 'A01', status: '登机中' },
  { no: 'MU2002', dest: '上海', gate: 'A02', status: '延误' },
  { no: 'CZ3003', dest: '广州', gate: 'B01', status: '准时' },
  { no: 'HU4004', dest: '深圳', gate: 'B02', status: '登机中' },
  { no: 'CA981', dest: '纽约', gate: 'E01', status: '准时' },
  { no: 'MU587', dest: '洛杉矶', gate: 'E03', status: '准备' },
  { no: 'CZ303', dest: '伦敦', gate: 'E05', status: '准时' },
  { no: 'HU495', dest: '巴黎', gate: 'E07', status: '登机中' },
];

const statusColor: Record<string, string> = {
  登机中: 'text-emerald-400',
  延误: 'text-red-400',
  准时: 'text-blue-400',
  准备: 'text-yellow-400',
};

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6"
      >
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <Plane className="w-14 h-14 text-blue-400/60" strokeWidth={1.5} />
        </motion.div>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
          <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-600/40 border border-amber-400/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-amber-300/50" />
          </div>
        </motion.div>
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <div className="w-8 h-10 rounded-md bg-gradient-to-br from-slate-400/40 to-slate-600/40 border border-slate-400/30" />
        </motion.div>
      </motion.div>

      <div className="max-w-2xl w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-10 h-10 text-blue-400 animate-float" />
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-3" style={{ textShadow: '0 0 60px rgba(59, 130, 246, 0.5)' }}>
            行李分拣大师
          </h1>
          <p className="text-slate-400 text-lg tracking-wide">机场行李分拣节奏游戏</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-10 overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2">航班信息显示屏 · FLIGHT INFORMATION</span>
          </div>
          <div className="relative h-40 overflow-hidden">
            <motion.div
              animate={{ y: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="py-2"
            >
              {[...FLIGHT_DATA, ...FLIGHT_DATA].map((f, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2 text-sm font-mono hover:bg-white/5 transition-colors">
                  <span className="text-white w-20 font-bold">{f.no}</span>
                  <span className="text-slate-400 w-16">→ {f.dest}</span>
                  <span className="text-blue-400 w-12">{f.gate}</span>
                  <span className={`${statusColor[f.status]} ml-auto`}>{f.status}</span>
                </div>
              ))}
            </motion.div>
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/game/level-1')}
            className="group relative w-full py-5 px-6 rounded-2xl font-display font-bold text-xl text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg hover:shadow-glow-blue transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="relative flex items-center justify-center gap-3">
              <Play className="w-6 h-6 fill-white" />
              <span>开始游戏</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/levels')}
            className="group relative w-full py-5 px-6 rounded-2xl font-display font-bold text-xl text-white bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 shadow-lg hover:shadow-glow-green transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="relative flex items-center justify-center gap-3">
              <Layers className="w-6 h-6" />
              <span>关卡选择</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/tutorial')}
            className="group relative w-full py-5 px-6 rounded-2xl font-display font-bold text-xl text-white bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 shadow-lg hover:shadow-glow-orange transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="relative flex items-center justify-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span>游戏教程</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/highscores')}
            className="group relative w-full py-5 px-6 rounded-2xl font-display font-bold text-xl text-white bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 shadow-lg hover:shadow-glow-purple transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="relative flex items-center justify-center gap-3">
              <Trophy className="w-6 h-6" />
              <span>最高分榜</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-slate-500 font-mono"
        >
          快捷键: Tab先选中行李 · 1-4分拣 · ESC暂停/恢复 · 空格确认
        </motion.div>
      </div>
    </div>
  );
}
