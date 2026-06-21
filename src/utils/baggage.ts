import type { Baggage, LevelConfig, WeightLevel, PriorityLevel } from '../types';

const PASSENGER_NAMES = [
  '张伟', '王芳', '李娜', '刘洋', '陈静',
  '杨磊', '赵敏', '黄强', '周杰', '吴敏',
  '徐明', '孙丽', '马超', '朱婷', '胡歌',
  '郭靖', '林黛玉', '何雨', '高阳', '林风',
];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateId = (): string => Math.random().toString(36).slice(2, 11);

export const getWeightLevel = (weight: number): WeightLevel => {
  if (weight > 32) return 'overweight';
  if (weight > 23) return 'heavy';
  if (weight > 10) return 'normal';
  return 'light';
};

export const getWeightLevelColor = (level: WeightLevel): string => {
  switch (level) {
    case 'light': return 'text-emerald-400';
    case 'normal': return 'text-sky-400';
    case 'heavy': return 'text-amber-400';
    case 'overweight': return 'text-red-400';
  }
};

export const getWeightLevelBgColor = (level: WeightLevel): string => {
  switch (level) {
    case 'light': return 'bg-emerald-500/20 border-emerald-500/50';
    case 'normal': return 'bg-sky-500/20 border-sky-500/50';
    case 'heavy': return 'bg-amber-500/20 border-amber-500/50';
    case 'overweight': return 'bg-red-500/20 border-red-500/50';
  }
};

export const getPriorityLabel = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'normal': return '普通';
    case 'express': return '加急';
    case 'vip': return 'VIP';
  }
};

export const getPriorityColor = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'normal': return 'bg-slate-500/30 text-slate-300 border-slate-500/50';
    case 'express': return 'bg-orange-500/30 text-orange-300 border-orange-500/50';
    case 'vip': return 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50';
  }
};

export const createBaggage = (
  level: LevelConfig,
  currentTime: number
): Baggage => {
  const flight = randomItem(level.flights);

  let weight: number;
  const overweightRoll = Math.random();
  if (overweightRoll < level.overweightChance * 0.3) {
    weight = 33 + Math.floor(Math.random() * 15);
  } else if (overweightRoll < level.overweightChance) {
    weight = 24 + Math.floor(Math.random() * 9);
  } else {
    weight = 5 + Math.floor(Math.random() * 19);
  }

  let priority: PriorityLevel = 'normal';
  const priorityRoll = Math.random();
  if (priorityRoll < level.expressChance * 0.3) {
    priority = 'vip';
  } else if (priorityRoll < level.expressChance) {
    priority = 'express';
  }

  const isSecurityChecked = Math.random() > 0.15;

  return {
    id: generateId(),
    flightId: flight.id,
    weight,
    weightLevel: getWeightLevel(weight),
    priority,
    passengerName: randomItem(PASSENGER_NAMES),
    isSecurityChecked,
    securityRecheckAttempts: 0,
    lastSecurityFailed: false,
    createdAt: currentTime,
    expiresAt: currentTime + level.baggageExpireTime,
    status: 'pending',
  };
};

export const formatFlightNo = (no: string): string => {
  return no;
};

export const formatTime = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

export const formatSec = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
