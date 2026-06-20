import type { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    id: 'level-1',
    name: '新手训练',
    description: '欢迎来到行李分拣中心！学习基本操作，熟悉4条分拣通道。',
    difficulty: 1,
    duration: 90,
    flights: [
      { id: 'f1', flightNo: 'CA1001', gate: 'A01', destination: '北京' },
      { id: 'f2', flightNo: 'MU2002', gate: 'A02', destination: '上海' },
      { id: 'f3', flightNo: 'CZ3003', gate: 'B01', destination: '广州' },
      { id: 'f4', flightNo: 'HU4004', gate: 'B02', destination: '深圳' },
    ],
    baggageSpawnRate: 3500,
    maxConcurrentBaggage: 4,
    overweightChance: 0.05,
    expressChance: 0.1,
    baggageExpireTime: 20000,
    events: [
      { type: 'gate_change', startTime: 30, endTime: 80, probability: 0.3, minInterval: 20 },
    ],
    unlocked: true,
  },
  {
    id: 'level-2',
    name: '早高峰',
    description: '清晨繁忙时段，行李数量增加，偶尔出现超重行李需要特殊处理。',
    difficulty: 2,
    duration: 100,
    flights: [
      { id: 'f1', flightNo: 'CA1234', gate: 'A05', destination: '成都' },
      { id: 'f2', flightNo: 'MU5678', gate: 'A08', destination: '杭州' },
      { id: 'f3', flightNo: 'CZ9012', gate: 'B03', destination: '重庆' },
      { id: 'f4', flightNo: 'HU3456', gate: 'B06', destination: '西安' },
    ],
    baggageSpawnRate: 2800,
    maxConcurrentBaggage: 5,
    overweightChance: 0.15,
    expressChance: 0.15,
    baggageExpireTime: 18000,
    events: [
      { type: 'gate_change', startTime: 20, endTime: 90, probability: 0.5, minInterval: 18 },
      { type: 'overweight_alert', startTime: 15, endTime: 90, probability: 0.7, minInterval: 15 },
    ],
    unlocked: true,
  },
  {
    id: 'level-3',
    name: '国际航班',
    description: '国际航班密集时段，航班可能提前截载，安检复核增加难度。',
    difficulty: 3,
    duration: 110,
    flights: [
      { id: 'f1', flightNo: 'CA981', gate: 'E01', destination: '纽约' },
      { id: 'f2', flightNo: 'MU587', gate: 'E03', destination: '洛杉矶' },
      { id: 'f3', flightNo: 'CZ303', gate: 'E05', destination: '伦敦' },
      { id: 'f4', flightNo: 'HU495', gate: 'E07', destination: '巴黎' },
    ],
    baggageSpawnRate: 2200,
    maxConcurrentBaggage: 6,
    overweightChance: 0.2,
    expressChance: 0.2,
    baggageExpireTime: 15000,
    events: [
      { type: 'gate_change', startTime: 10, endTime: 100, probability: 0.7, minInterval: 15 },
      { type: 'overweight_alert', startTime: 10, endTime: 100, probability: 0.8, minInterval: 12 },
      { type: 'early_boarding', startTime: 30, endTime: 100, probability: 0.6, minInterval: 25 },
      { type: 'security_recheck', startTime: 20, endTime: 100, probability: 0.5, minInterval: 20 },
    ],
    unlocked: false,
    unlockScore: 1500,
  },
  {
    id: 'level-4',
    name: '风暴来袭',
    description: '极端天气导致大面积航班变动，登机口频繁变更，所有事件同时来袭！',
    difficulty: 5,
    duration: 120,
    flights: [
      { id: 'f1', flightNo: 'CA123', gate: 'D10', destination: '东京' },
      { id: 'f2', flightNo: 'MU456', gate: 'D12', destination: '首尔' },
      { id: 'f3', flightNo: 'CZ789', gate: 'D14', destination: '新加坡' },
      { id: 'f4', flightNo: 'HU012', gate: 'D16', destination: '曼谷' },
    ],
    baggageSpawnRate: 1800,
    maxConcurrentBaggage: 7,
    overweightChance: 0.25,
    expressChance: 0.25,
    baggageExpireTime: 12000,
    events: [
      { type: 'gate_change', startTime: 5, endTime: 115, probability: 0.9, minInterval: 10 },
      { type: 'overweight_alert', startTime: 5, endTime: 115, probability: 0.9, minInterval: 10 },
      { type: 'early_boarding', startTime: 15, endTime: 110, probability: 0.8, minInterval: 18 },
      { type: 'security_recheck', startTime: 10, endTime: 115, probability: 0.75, minInterval: 15 },
    ],
    unlocked: false,
    unlockScore: 3000,
  },
];

export const getLevelById = (id: string): LevelConfig | undefined => {
  return LEVELS.find(l => l.id === id);
};

export const FLIGHT_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  f1: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-glow-blue' },
  f2: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-glow-green' },
  f3: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', glow: 'shadow-glow-orange' },
  f4: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', glow: 'shadow-glow-purple' },
};

export const getFlightColor = (flightId: string) => {
  const idx = flightId.slice(-1);
  const key = `f${idx}`;
  return FLIGHT_COLORS[key] || FLIGHT_COLORS.f1;
};
