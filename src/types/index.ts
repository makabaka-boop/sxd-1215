export type WeightLevel = 'light' | 'normal' | 'heavy' | 'overweight';

export type PriorityLevel = 'normal' | 'express' | 'vip';

export type EventType =
  | 'gate_change'
  | 'overweight_alert'
  | 'early_boarding'
  | 'security_recheck';

export type MistakeType =
  | 'wrong_channel'
  | 'overweight_ignored'
  | 'missed_boarding'
  | 'security_failed'
  | 'baggage_expired';

export type BaggageStatus = 'pending' | 'processing' | 'sorted' | 'missed' | 'rejected';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Flight {
  id: string;
  flightNo: string;
  gate: string;
  destination: string;
}

export interface Baggage {
  id: string;
  flightId: string;
  weight: number;
  weightLevel: WeightLevel;
  priority: PriorityLevel;
  passengerName: string;
  isSecurityChecked: boolean;
  createdAt: number;
  expiresAt: number;
  assignedChannelId?: string;
  status: BaggageStatus;
  sortedAt?: number;
}

export interface Channel {
  id: string;
  flightId: string;
  shortcutKey: string;
  maxWeight: number;
  capacity: number;
  currentLoad: number;
  isBoarding: boolean;
  boardingDeadline?: number;
  changedGate?: string;
  baggageIds: string[];
}

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  message: string;
  relatedFlightId?: string;
  relatedBaggageId?: string;
  triggerTime: number;
  duration: number;
  resolved: boolean;
  penalty?: number;
}

export interface EventConfig {
  type: EventType;
  startTime: number;
  endTime: number;
  probability: number;
  minInterval: number;
}

export interface MistakeRecord {
  id: string;
  time: number;
  type: MistakeType;
  description: string;
  penalty: number;
  relatedBaggageId?: string;
  relatedFlightId?: string;
}

export interface OverweightHandle {
  baggageId: string;
  handledAt: number;
  reactionTime: number;
}

export interface BoardingCompletion {
  flightId: string;
  completedAt: number;
  onTime: boolean;
}

export interface ScoreBreakdown {
  accuracy: { score: number; max: number; rate: number };
  overweight: { score: number; max: number; avgSpeed: number };
  boarding: { score: number; max: number; completeRate: number };
  mistakes: { score: number; max: number; count: number };
  timeBonus: { score: number; max: number; remaining: number };
}

export interface GameResult {
  levelId: string;
  totalScore: number;
  grade: Grade;
  breakdown: ScoreBreakdown;
  mistakes: MistakeRecord[];
  sortedCount: number;
  totalBaggageCount: number;
  playTime: number;
  timestamp: number;
  overweightHandles: OverweightHandle[];
  boardingCompletions: BoardingCompletion[];
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number;
  flights: Flight[];
  baggageSpawnRate: number;
  maxConcurrentBaggage: number;
  overweightChance: number;
  expressChance: number;
  baggageExpireTime: number;
  events: EventConfig[];
  unlocked: boolean;
  unlockScore?: number;
}

export interface HighScoreRecord {
  levelId: string;
  score: number;
  grade: Grade;
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  dragSensitivity: number;
}

export const STORAGE_KEYS = {
  HIGH_SCORES: 'baggage_sort_high_scores',
  UNLOCKED_LEVELS: 'baggage_sort_unlocked_levels',
  GAME_SETTINGS: 'baggage_sort_settings',
  LAST_RESULT: 'baggage_sort_last_result',
};
