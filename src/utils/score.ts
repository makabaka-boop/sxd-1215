import type {
  GameEvent,
  EventType,
  LevelConfig,
  Channel,
  MistakeRecord,
  ScoreBreakdown,
  GameResult,
  Grade,
  OverweightHandle,
  BoardingCompletion,
  Baggage,
} from '../types';

const generateId = (): string => Math.random().toString(36).slice(2, 11);

export const EVENT_TITLES: Record<EventType, string> = {
  gate_change: '登机口变更',
  overweight_alert: '超重行李警报',
  early_boarding: '航班提前截载',
  security_recheck: '安检复核',
};

export const EVENT_MESSAGES: Record<EventType, string> = {
  gate_change: '航班{flight}登机口由{old}变更为{new}！',
  overweight_alert: '发现超重行李，请及时处理！',
  early_boarding: '航班{flight}提前截载，请立即分拣！',
  security_recheck: '安检要求复核部分行李，请配合检查！',
};

export interface EventTriggerState {
  lastTriggered: Record<EventType, number>;
}

export const createEventTriggerState = (): EventTriggerState => ({
  lastTriggered: {
    gate_change: 0,
    overweight_alert: 0,
    early_boarding: 0,
    security_recheck: 0,
  },
});

export const shouldTriggerEvent = (
  config: LevelConfig,
  eventType: EventType,
  gameTimeSec: number,
  state: EventTriggerState
): boolean => {
  const eventConfig = config.events.find(e => e.type === eventType);
  if (!eventConfig) return false;
  if (gameTimeSec < eventConfig.startTime) return false;
  if (gameTimeSec > eventConfig.endTime) return false;
  if (gameTimeSec - state.lastTriggered[eventType] < eventConfig.minInterval) return false;
  return Math.random() < eventConfig.probability * 0.02;
};

export const createEvent = (
  type: EventType,
  gameTimeMs: number,
  flights: { id: string; flightNo: string; gate: string }[],
  channels: Channel[]
): GameEvent => {
  const duration = type === 'early_boarding' ? 15000 : type === 'overweight_alert' ? 10000 : 8000;
  const gameTimeSec = gameTimeMs / 1000;

  let title = EVENT_TITLES[type];
  let message = EVENT_MESSAGES[type];
  let relatedFlightId: string | undefined;
  let relatedBaggageId: string | undefined;

  if (type === 'gate_change' && flights.length > 0) {
    const flight = flights[Math.floor(Math.random() * flights.length)];
    const newGates = ['C03', 'D07', 'A15', 'B22', 'E09', 'F18'];
    const newGate = newGates[Math.floor(Math.random() * newGates.length)];
    title = '登机口变更';
    message = `航班${flight.flightNo}登机口由${flight.gate}变更为${newGate}！`;
    relatedFlightId = flight.id;
    void channels;
  } else if (type === 'early_boarding' && flights.length > 0) {
    const flight = flights[Math.floor(Math.random() * flights.length)];
    title = '航班提前截载';
    message = `航班${flight.flightNo}即将提前截载，请优先处理该航班行李！`;
    relatedFlightId = flight.id;
  } else if (type === 'security_recheck') {
    title = '安检复核';
    message = '注意：最近5秒内进入的行李需要重新核对安检状态！';
  } else if (type === 'overweight_alert') {
    title = '超重警报';
    message = '检测到超重行李，请使用特殊处理方式！';
  }

  return {
    id: generateId(),
    type,
    title,
    message,
    relatedFlightId,
    relatedBaggageId,
    triggerTime: gameTimeSec,
    duration: duration / 1000,
    resolved: false,
    penalty: type === 'early_boarding' ? 50 : type === 'overweight_alert' ? 30 : 20,
  };
};

export interface ScoreState {
  correctCount: number;
  wrongCount: number;
  totalSorted: number;
  overweightHandles: OverweightHandle[];
  boardingCompletions: BoardingCompletion[];
  mistakes: MistakeRecord[];
  baseScore: number;
  penaltyScore: number;
}

export const createScoreState = (): ScoreState => ({
  correctCount: 0,
  wrongCount: 0,
  totalSorted: 0,
  overweightHandles: [],
  boardingCompletions: [],
  mistakes: [],
  baseScore: 0,
  penaltyScore: 0,
});

export const addMistake = (
  state: ScoreState,
  type: MistakeRecord['type'],
  description: string,
  penalty: number,
  timeSec: number,
  baggageId?: string,
  flightId?: string
) => {
  state.mistakes.push({
    id: generateId(),
    time: timeSec,
    type,
    description,
    penalty,
    relatedBaggageId: baggageId,
    relatedFlightId: flightId,
  });
  state.penaltyScore += penalty;
};

const SCORE_BASE = {
  base_sorted: 30,
  correct_multiplier: 1,
  vip_bonus: 20,
  express_bonus: 10,
  overweight_bonus: 25,
  overweight_fast_bonus: 15,
  ontime_boarding: 40,
  max_time_bonus: 200,
};

export const calculateBreakdown = (
  level: LevelConfig,
  scoreState: ScoreState,
  gameResult: {
    totalBaggage: number;
    sortedBaggage: number;
    remainingMs: number;
    playTimeMs: number;
  }
): ScoreBreakdown => {
  const total = Math.max(1, gameResult.totalBaggage);

  const accuracyMax = 400;
  const accuracyRate = scoreState.totalSorted > 0
    ? scoreState.correctCount / scoreState.totalSorted
    : 0;
  const accuracyScore = Math.round(accuracyMax * accuracyRate);

  const overweightMax = 200;
  const overweightTotal = scoreState.overweightHandles.length;
  let overweightScore = 0;
  let avgSpeed = 0;
  if (overweightTotal > 0) {
    const totalSpeed = scoreState.overweightHandles.reduce((sum, h) => sum + h.reactionTime, 0);
    avgSpeed = totalSpeed / overweightTotal;
    const speedFactor = Math.max(0, 1 - avgSpeed / 8000);
    overweightScore = Math.round(overweightMax * Math.min(1, (overweightTotal * 0.5 + speedFactor * 0.5)));
  }

  const boardingMax = 200;
  const boardingTotal = scoreState.boardingCompletions.length;
  let boardingRate = 0;
  if (boardingTotal > 0) {
    const onTime = scoreState.boardingCompletions.filter(c => c.onTime).length;
    boardingRate = onTime / boardingTotal;
  }
  const boardingScore = boardingTotal > 0 ? Math.round(boardingMax * boardingRate) : boardingMax;

  const mistakesMax = 150;
  const mistakePenaltyMax = scoreState.wrongCount * 30;
  const mistakesScore = Math.max(0, mistakesMax - mistakePenaltyMax);

  const timeMax = SCORE_BASE.max_time_bonus;
  const remainingRatio = Math.max(0, gameResult.remainingMs / (level.duration * 1000));
  const timeScore = Math.round(timeMax * remainingRatio);

  return {
    accuracy: { score: accuracyScore, max: accuracyMax, rate: accuracyRate },
    overweight: { score: overweightScore, max: overweightMax, avgSpeed },
    boarding: { score: boardingScore, max: boardingMax, completeRate: boardingRate },
    mistakes: { score: mistakesScore, max: mistakesMax, count: scoreState.wrongCount },
    timeBonus: { score: timeScore, max: timeMax, remaining: Math.round(gameResult.remainingMs / 1000) },
  };
};

export const calculateGrade = (score: number, totalMax: number): Grade => {
  const ratio = score / totalMax;
  if (ratio >= 0.92) return 'S';
  if (ratio >= 0.8) return 'A';
  if (ratio >= 0.65) return 'B';
  if (ratio >= 0.45) return 'C';
  return 'D';
};

export const computeFinalResult = (
  level: LevelConfig,
  scoreState: ScoreState,
  gameState: {
    totalBaggageGenerated: number;
    baggages: Baggage[];
    remainingMs: number;
    playTimeMs: number;
  }
): GameResult => {
  const sortedBaggage = gameState.baggages.filter(b => b.status === 'sorted').length;

  let baseTotal = 0;
  for (const b of gameState.baggages) {
    if (b.status === 'sorted') {
      baseTotal += SCORE_BASE.base_sorted;
      if (b.priority === 'vip') baseTotal += SCORE_BASE.vip_bonus;
      else if (b.priority === 'express') baseTotal += SCORE_BASE.express_bonus;
    }
  }

  for (const h of scoreState.overweightHandles) {
    baseTotal += SCORE_BASE.overweight_bonus;
    if (h.reactionTime < 5000) baseTotal += SCORE_BASE.overweight_fast_bonus;
  }

  for (const c of scoreState.boardingCompletions) {
    if (c.onTime) baseTotal += SCORE_BASE.ontime_boarding;
  }

  const breakdown = calculateBreakdown(level, scoreState, {
    totalBaggage: gameState.totalBaggageGenerated,
    sortedBaggage,
    remainingMs: gameState.remainingMs,
    playTimeMs: gameState.playTimeMs,
  });

  const totalBreakdown = breakdown.accuracy.score + breakdown.overweight.score +
    breakdown.boarding.score + breakdown.mistakes.score + breakdown.timeBonus.score;
  const breakdownMax = breakdown.accuracy.max + breakdown.overweight.max +
    breakdown.boarding.max + breakdown.mistakes.max + breakdown.timeBonus.max;

  const combinedScore = Math.round(baseTotal * 0.5 + totalBreakdown * 0.5);
  const finalScore = Math.max(0, combinedScore - scoreState.penaltyScore);

  const grade = calculateGrade(finalScore, Math.round(baseTotal * 0.5 + breakdownMax * 0.5));

  return {
    levelId: level.id,
    totalScore: finalScore,
    grade,
    breakdown,
    mistakes: scoreState.mistakes,
    sortedCount: sortedBaggage,
    totalBaggageCount: gameState.totalBaggageGenerated,
    playTime: Math.round(gameState.playTimeMs / 1000),
    timestamp: Date.now(),
    overweightHandles: scoreState.overweightHandles,
    boardingCompletions: scoreState.boardingCompletions,
  };
};
