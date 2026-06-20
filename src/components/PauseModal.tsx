import { Play, RotateCcw, LogOut, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export default function PauseModal({
  isOpen,
  onResume,
  onRestart,
  onExit,
}: PauseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/80 backdrop-blur-xl shadow-glass p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <PauseCircle className="w-12 h-12 text-amber-400" />
                </div>
                <h2 className="text-4xl font-display font-bold text-white mb-2">
                  已暂停
                </h2>
                <p className="text-slate-400 mb-8">游戏已暂停，选择一个操作继续</p>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={onResume}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    继续游戏
                  </button>

                  <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold text-lg transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    重新开始
                  </button>

                  <button
                    onClick={onExit}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-display font-bold text-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    退出关卡
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
