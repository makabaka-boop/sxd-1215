import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MousePointerClick, Gauge, Crown, AlertOctagon, Keyboard, CheckCircle } from 'lucide-react';

const weightLegend = [
  { label: '轻量', range: '< 10kg', color: 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400' },
  { label: '正常', range: '10-23kg', color: 'bg-blue-500/30 border-blue-500/50 text-blue-400' },
  { label: '较重', range: '23-32kg', color: 'bg-yellow-500/30 border-yellow-500/50 text-yellow-400' },
  { label: '超重', range: '> 32kg', color: 'bg-red-500/30 border-red-500/50 text-red-400' },
];

const priorityLegend = [
  { label: '普通', desc: '标准行李 +30分', icon: '📦', color: 'text-slate-300' },
  { label: '加急', desc: '橙色标识 +40分', icon: '⚡', color: 'text-orange-400' },
  { label: 'VIP', desc: '金色王冠 +50分', icon: '👑', color: 'text-yellow-400' },
];

const events = [
  { icon: '🔄', title: '登机口变更', desc: '注意通道顶部登机口变化，航班登机口会临时更换' },
  { icon: '⚠️', title: '超重警报', desc: '及时处理超重行李可获得额外加分奖励' },
  { icon: '⏰', title: '提前截载', desc: '对应航班需在倒计时内完成至少3件行李分拣' },
  { icon: '🛡️', title: '安检复核', desc: '未通过安检的行李需先进行复核才能分拣' },
];

const shortcuts = [
  { key: '1-4', desc: '分拣选中行李至对应通道（1-4号）' },
  { key: 'Tab / ⇧Tab', desc: '切换选中下一件 / 上一件行李' },
  { key: '空格', desc: '批量确认已完成分拣的行李' },
  { key: 'ESC', desc: '暂停当前游戏' },
];

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">游戏教程</h1>
            <p className="text-slate-400 text-sm mt-1">掌握核心玩法，成为分拣大师</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500" />
            <div className="flex items-start gap-5 pl-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white shadow-glow-blue">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <MousePointerClick className="w-6 h-6 text-blue-400" />
                  <h2 className="font-display text-2xl font-bold text-white">基础操作</h2>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>每件行李卡片显示<span className="text-white font-semibold">航班号</span>、<span className="text-white font-semibold">重量</span>、<span className="text-white font-semibold">优先级</span>信息</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><span className="text-blue-400 font-medium">拖拽</span>行李到对应航班通道完成分拣</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>或<span className="text-blue-400 font-medium">点击选中</span>行李后，按键盘<span className="font-mono text-amber-400"> 1-4 </span>键分拣到对应通道</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="flex items-start gap-5 pl-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white shadow-glow-green">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Gauge className="w-6 h-6 text-emerald-400" />
                  <h2 className="font-display text-2xl font-bold text-white">重量等级</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {weightLegend.map(w => (
                    <div key={w.label} className={`rounded-xl border p-4 ${w.color} bg-opacity-30`}>
                      <div className="text-sm opacity-80">{w.label}</div>
                      <div className="text-lg font-bold mt-1">{w.range}</div>
                    </div>
                  ))}
                </div>
                <p className="text-slate-300 text-sm">
                  <span className="text-red-400 font-semibold">⚠ 红色超重行李</span>必须先点击<span className="text-amber-400 font-medium">"处理超重"</span>按钮后才能进行分拣，否则会扣分。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-amber-500" />
            <div className="flex items-start gap-5 pl-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white shadow-glow-orange">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h2 className="font-display text-2xl font-bold text-white">优先级</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {priorityLegend.map(p => (
                    <div key={p.label} className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{p.icon}</span>
                        <span className={`font-semibold ${p.color}`}>{p.label}</span>
                      </div>
                      <div className="text-sm text-slate-400">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500" />
            <div className="flex items-start gap-5 pl-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white shadow-glow-red">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <AlertOctagon className="w-6 h-6 text-red-400" />
                  <h2 className="font-display text-2xl font-bold text-white">特殊事件</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map(e => (
                    <div key={e.title} className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{e.icon}</span>
                      <div>
                        <div className="font-semibold text-white mb-1">{e.title}</div>
                        <div className="text-sm text-slate-400 leading-relaxed">{e.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-violet-500" />
            <div className="flex items-start gap-5 pl-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white shadow-glow-purple">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Keyboard className="w-6 h-6 text-purple-400" />
                  <h2 className="font-display text-2xl font-bold text-white">快捷键</h2>
                </div>
                <div className="space-y-2">
                  {shortcuts.map(s => (
                    <div key={s.key} className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
                      <span className="font-mono px-3 py-1.5 rounded-md bg-slate-800 border border-white/10 text-amber-400 text-sm font-bold min-w-[110px] text-center">
                        {s.key}
                      </span>
                      <span className="text-slate-300 text-sm">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/game/level-1')}
            className="px-8 py-4 rounded-2xl font-display font-bold text-lg text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg hover:shadow-glow-blue hover:scale-105 transition-all duration-300"
          >
            开始实践 →
          </button>
        </div>
      </div>
    </div>
  );
}
