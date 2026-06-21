import { create } from 'zustand';
import type {
  Baggage,
  Channel,
  GameEvent,
  LevelConfig,
  EventType,
  GameResult,
} from '../types';
import type { ScoreState, EventTriggerState } from '../utils/score';
import { createBaggage } from '../utils/baggage';
import {
  createEvent,
  shouldTriggerEvent,
  createEventTriggerState,
  createScoreState,
  addMistake,
  computeFinalResult,
  selectFlightForEvent,
} from '../utils/score';
import { getLevelById } from '../data/levels';
import { saveLastResult } from '../utils/storage';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

const generateId = (): string => Math.random().toString(36).slice(2, 11);

const createChannels = (level: LevelConfig): Channel[] => {
  return level.flights.map((flight, idx) => ({
    id: `ch-${idx + 1}`,
    flightId: flight.id,
    shortcutKey: `${idx + 1}`,
    maxWeight: 32,
    capacity: 20,
    currentLoad: 0,
    isBoarding: false,
    baggageIds: [],
  }));
};

interface FeedbackToast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  createdAt: number;
}

interface GameStoreState {
  status: GameStatus;
  levelId: string | null;
  level: LevelConfig | null;

  gameTimeMs: number;
  remainingMs: number;
  playTimeMs: number;
  lastTickTime: number;

  baggages: Baggage[];
  channels: Channel[];
  activeEvents: GameEvent[];
  pastEvents: GameEvent[];

  eventTriggerState: EventTriggerState;
  scoreState: ScoreState;

  lastSpawnTime: number;
  totalBaggageGenerated: number;

  selectedBaggageId: string | null;
  toasts: FeedbackToast[];

  lastResult: GameResult | null;

  reset: () => void;
  startLevel: (levelId: string) => void;
  pause: () => void;
  resume: () => void;
  finishGame: () => void;

  tick: (deltaMs: number) => void;

  trySortBaggage: (baggageId: string, channelId: string) => void;
  selectBaggage: (baggageId: string | null) => void;
  sortSelectedByShortcut: (shortcutKey: string) => void;
  bulkConfirm: () => void;

  handleOverweight: (baggageId: string) => void;
  handleSecurityRecheck: (baggageId: string) => void;
  handleGateChangeConfirm: (eventId: string) => void;

  dismissToast: (id: string) => void;
}

const addToast = (toasts: FeedbackToast[], type: FeedbackToast['type'], message: string): FeedbackToast[] => {
  const newToast: FeedbackToast = {
    id: generateId(),
    type,
    message,
    createdAt: Date.now(),
  };
  return [...toasts, newToast].slice(-5);
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  status: 'idle',
  levelId: null,
  level: null,

  gameTimeMs: 0,
  remainingMs: 0,
  playTimeMs: 0,
  lastTickTime: 0,

  baggages: [],
  channels: [],
  activeEvents: [],
  pastEvents: [],

  eventTriggerState: createEventTriggerState(),
  scoreState: createScoreState(),

  lastSpawnTime: 0,
  totalBaggageGenerated: 0,

  selectedBaggageId: null,
  toasts: [],

  lastResult: null,

  reset: () => set({
    status: 'idle',
    levelId: null,
    level: null,
    gameTimeMs: 0,
    remainingMs: 0,
    playTimeMs: 0,
    lastTickTime: 0,
    baggages: [],
    channels: [],
    activeEvents: [],
    pastEvents: [],
    eventTriggerState: createEventTriggerState(),
    scoreState: createScoreState(),
    lastSpawnTime: 0,
    totalBaggageGenerated: 0,
    selectedBaggageId: null,
    toasts: [],
  }),

  startLevel: (levelId: string) => {
    const level = getLevelById(levelId);
    if (!level) return;

    set({
      status: 'playing',
      levelId,
      level,
      gameTimeMs: 0,
      remainingMs: level.duration * 1000,
      playTimeMs: 0,
      lastTickTime: performance.now(),
      baggages: [],
      channels: createChannels(level),
      activeEvents: [],
      pastEvents: [],
      eventTriggerState: createEventTriggerState(),
      scoreState: createScoreState(),
      lastSpawnTime: 0,
      totalBaggageGenerated: 0,
      selectedBaggageId: null,
      toasts: [],
      lastResult: null,
    });
  },

  pause: () => {
    const s = get();
    if (s.status !== 'playing') return;
    set({ status: 'paused' });
  },

  resume: () => {
    const s = get();
    if (s.status !== 'paused') return;
    set({ status: 'playing', lastTickTime: performance.now() });
  },

  finishGame: () => {
    const s = get();
    if (!s.level || s.status === 'idle' || s.status === 'finished') return;

    const result = computeFinalResult(s.level, s.scoreState, {
      totalBaggageGenerated: s.totalBaggageGenerated,
      baggages: s.baggages,
      remainingMs: s.remainingMs,
      playTimeMs: s.playTimeMs,
    });

    saveLastResult(result);

    set({
      status: 'finished',
      lastResult: result,
      activeEvents: [],
    });
  },

  tick: (deltaMs: number) => {
    const s = get();
    if (s.status !== 'playing' || !s.level) return;

    const newGameTimeMs = s.gameTimeMs + deltaMs;
    const newGameTimeSec = newGameTimeMs / 1000;
    const newRemainingMs = Math.max(0, s.remainingMs - deltaMs);
    const newPlayTimeMs = s.playTimeMs + deltaMs;

    let newBaggages = [...s.baggages];
    let newChannels = [...s.channels];
    let newActiveEvents = [...s.activeEvents];
    const newPastEvents = [...s.pastEvents];
    let newToasts = [...s.toasts];
    const newScoreState = { ...s.scoreState };
    const newEventTriggerState = { ...s.eventTriggerState, lastTriggered: { ...s.eventTriggerState.lastTriggered } };
    let newLastSpawnTime = s.lastSpawnTime;
    let newTotalGenerated = s.totalBaggageGenerated;

    const expiredBaggages: Baggage[] = [];
    newBaggages = newBaggages.map(b => {
      if (b.status === 'pending' && newGameTimeMs >= b.expiresAt) {
        expiredBaggages.push(b);
        return { ...b, status: 'missed' as const };
      }
      return b;
    });
    for (const eb of expiredBaggages) {
      addMistake(newScoreState, 'baggage_expired', `行李(${eb.passengerName})超时未分拣，自动错过`, 25, newGameTimeSec, eb.id, eb.flightId);
      newToasts = addToast(newToasts, 'error', `× 行李超时: ${eb.passengerName}`);
    }

    const pendingCount = newBaggages.filter(b => b.status === 'pending').length;
    if (
      pendingCount < s.level.maxConcurrentBaggage &&
      newGameTimeMs - newLastSpawnTime >= s.level.baggageSpawnRate
    ) {
      const newBaggage = createBaggage(s.level, newGameTimeMs);
      newBaggages.push(newBaggage);
      newTotalGenerated += 1;
      newLastSpawnTime = newGameTimeMs;
    }

    const eventTypes: EventType[] = ['gate_change', 'overweight_alert', 'early_boarding', 'security_recheck'];
    for (const et of eventTypes) {
      if (shouldTriggerEvent(s.level, et, newGameTimeSec, newEventTriggerState)) {
        let flightPool = s.level.flights;
        if (et === 'gate_change') {
          const selectedFlight = selectFlightForEvent(s.level, et, newChannels);
          if (!selectedFlight) continue;
          flightPool = [selectedFlight];
        }
        const evt = createEvent(et, newGameTimeMs, flightPool, newChannels);
        newActiveEvents.push(evt);
        newEventTriggerState.lastTriggered[et] = newGameTimeSec;
        newToasts = addToast(newToasts, 'warning', `⚠ ${evt.title}`);

        if (et === 'gate_change' && evt.relatedFlightId && evt.newGate && evt.oldGate) {
          newChannels = newChannels.map(ch =>
            ch.flightId === evt.relatedFlightId
              ? { ...ch, changedGate: evt.newGate, gateChangeConfirmed: false, gateChangeEventId: evt.id }
              : ch
          );
          newScoreState.gateChangeHandles.push({
            eventId: evt.id,
            flightId: evt.relatedFlightId,
            oldGate: evt.oldGate,
            newGate: evt.newGate,
            unconfirmedMistakes: 0,
          });
        }

        if (et === 'early_boarding' && evt.relatedFlightId) {
          newChannels = newChannels.map(ch =>
            ch.flightId === evt.relatedFlightId
              ? { ...ch, isBoarding: true, boardingDeadline: newGameTimeMs + 15000 }
              : ch
          );
        }
      }
    }

    newChannels = newChannels.map(ch => {
      if (ch.isBoarding && ch.boardingDeadline && newGameTimeMs >= ch.boardingDeadline) {
        const onTime = ch.currentLoad >= 3;
        newScoreState.boardingCompletions.push({
          flightId: ch.flightId,
          completedAt: newGameTimeMs,
          onTime,
        });
        if (!onTime) {
          addMistake(newScoreState, 'missed_boarding', `航班截载时行李不足(${ch.currentLoad}件)`, 40, newGameTimeSec, undefined, ch.flightId);
          newToasts = addToast(newToasts, 'error', `航班截载未达标`);
        } else {
          newToasts = addToast(newToasts, 'success', `航班截载顺利完成 ✓`);
        }
        return { ...ch, isBoarding: false, boardingDeadline: undefined, currentLoad: 0, baggageIds: [] };
      }
      return ch;
    });

    newActiveEvents = newActiveEvents.filter(evt => {
      const isActive = newGameTimeSec - evt.triggerTime < evt.duration;
      if (!isActive) {
        newPastEvents.push({ ...evt, resolved: true });
      }
      return isActive;
    });

    if (newRemainingMs <= 0) {
      const result = computeFinalResult(s.level, newScoreState, {
        totalBaggageGenerated: newTotalGenerated,
        baggages: newBaggages,
        remainingMs: newRemainingMs,
        playTimeMs: newPlayTimeMs,
      });

      saveLastResult(result);

      set({
        status: 'finished',
        gameTimeMs: newGameTimeMs,
        remainingMs: 0,
        playTimeMs: newPlayTimeMs,
        baggages: newBaggages,
        channels: newChannels,
        activeEvents: [],
        pastEvents: newPastEvents,
        eventTriggerState: newEventTriggerState,
        scoreState: newScoreState,
        lastSpawnTime: newLastSpawnTime,
        totalBaggageGenerated: newTotalGenerated,
        toasts: newToasts,
        lastResult: result,
      });
      return;
    }

    set({
      gameTimeMs: newGameTimeMs,
      remainingMs: newRemainingMs,
      playTimeMs: newPlayTimeMs,
      baggages: newBaggages,
      channels: newChannels,
      activeEvents: newActiveEvents,
      pastEvents: newPastEvents,
      eventTriggerState: newEventTriggerState,
      scoreState: newScoreState,
      lastSpawnTime: newLastSpawnTime,
      totalBaggageGenerated: newTotalGenerated,
      toasts: newToasts,
    });
  },

  trySortBaggage: (baggageId: string, channelId: string) => {
    const s = get();
    if (s.status !== 'playing' || !s.level) return;

    const baggage = s.baggages.find(b => b.id === baggageId);
    const channel = s.channels.find(c => c.id === channelId);
    if (!baggage || !channel || baggage.status !== 'pending') return;

    const gameTimeSec = s.gameTimeMs / 1000;
    let newToasts = [...s.toasts];
    const newScoreState = {
      ...s.scoreState,
      gateChangeHandles: [...s.scoreState.gateChangeHandles],
      mistakes: [...s.scoreState.mistakes],
    };
    const newBaggages = [...s.baggages];
    const newChannels = [...s.channels];

    const isCorrectFlight = baggage.flightId === channel.flightId;
    const isOverweight = baggage.weightLevel === 'overweight';
    const isSecurityOk = baggage.isSecurityChecked;

    const baggageFlightChannel = newChannels.find(ch => ch.flightId === baggage.flightId);
    const gateChangeUnconfirmed = baggageFlightChannel?.changedGate && !baggageFlightChannel.gateChangeConfirmed;

    let sortedSuccessfully = false;
    let hasError = false;

    if (gateChangeUnconfirmed && isCorrectFlight) {
      hasError = true;
      addMistake(
        newScoreState,
        'gate_change_unconfirmed',
        `航班${s.level.flights.find(f => f.id === baggage.flightId)?.flightNo || ''}登机口已变更，分拣前请先确认新登机口`,
        35,
        gameTimeSec,
        baggage.id,
        baggage.flightId
      );
      newToasts = addToast(newToasts, 'error', `登机口未确认 -35`);

      if (baggageFlightChannel?.gateChangeEventId) {
        const handleIdx = newScoreState.gateChangeHandles.findIndex(h => h.eventId === baggageFlightChannel.gateChangeEventId);
        if (handleIdx >= 0) {
          newScoreState.gateChangeHandles[handleIdx] = {
            ...newScoreState.gateChangeHandles[handleIdx],
            unconfirmedMistakes: newScoreState.gateChangeHandles[handleIdx].unconfirmedMistakes + 1,
          };
        }
      }
    }

    if (!isSecurityOk) {
      hasError = true;
      const securityEventActive = s.activeEvents.some(e => e.type === 'security_recheck');
      if (securityEventActive) {
        addMistake(newScoreState, 'security_failed', `行李(${baggage.passengerName})未通过安检仍被送入通道`, 35, gameTimeSec, baggage.id);
        newToasts = addToast(newToasts, 'error', `安检复核失败 -35`);
      }
    }

    if (isOverweight) {
      hasError = true;
      addMistake(newScoreState, 'overweight_ignored', `超重行李(${baggage.weight}kg)未经特殊处理直接分拣`, 40, gameTimeSec, baggage.id);
      newToasts = addToast(newToasts, 'error', `超重未处理 -40`);
    }

    if (!isCorrectFlight) {
      hasError = true;
      newScoreState.wrongCount += 1;
      addMistake(newScoreState, 'wrong_channel', `行李错分航班`, 30, gameTimeSec, baggage.id, baggage.flightId);
      newToasts = addToast(newToasts, 'error', `× 航班错分 -30`);
    }

    if (!hasError) {
      sortedSuccessfully = true;
      newScoreState.correctCount += 1;
      newScoreState.totalSorted += 1;
      newScoreState.baseScore += 30;
      if (baggage.priority === 'vip') newScoreState.baseScore += 20;
      else if (baggage.priority === 'express') newScoreState.baseScore += 10;

      const bIdx = newBaggages.findIndex(b => b.id === baggageId);
      if (bIdx >= 0) {
        newBaggages[bIdx] = {
          ...newBaggages[bIdx],
          status: 'sorted',
          assignedChannelId: channelId,
          sortedAt: s.gameTimeMs,
        };
      }
      const cIdx = newChannels.findIndex(c => c.id === channelId);
      if (cIdx >= 0) {
        newChannels[cIdx] = {
          ...newChannels[cIdx],
          currentLoad: newChannels[cIdx].currentLoad + 1,
          baggageIds: [...newChannels[cIdx].baggageIds, baggageId],
        };
      }
      newToasts = addToast(newToasts, 'success', `✓ 分拣成功 +${baggage.priority === 'vip' ? 50 : baggage.priority === 'express' ? 40 : 30}`);
    } else {
      const bIdx = newBaggages.findIndex(b => b.id === baggageId);
      if (bIdx >= 0) {
        newBaggages[bIdx] = { ...newBaggages[bIdx], status: 'rejected' };
      }
      setTimeout(() => {
        set(state => ({
          baggages: state.baggages.map(b =>
            b.id === baggageId && b.status === 'rejected' ? { ...b, status: 'pending' } : b
          ),
        }));
      }, 600);
    }

    const newSelected = s.selectedBaggageId === baggageId ? null : s.selectedBaggageId;

    set({
      baggages: newBaggages,
      channels: newChannels,
      scoreState: newScoreState,
      toasts: newToasts,
      selectedBaggageId: newSelected,
    });

    void sortedSuccessfully;
  },

  selectBaggage: (baggageId: string | null) => {
    set({ selectedBaggageId: baggageId });
  },

  sortSelectedByShortcut: (shortcutKey: string) => {
    const s = get();
    if (!s.selectedBaggageId) return;
    const channel = s.channels.find(c => c.shortcutKey === shortcutKey);
    if (!channel) return;
    get().trySortBaggage(s.selectedBaggageId, channel.id);
  },

  bulkConfirm: () => {
    const s = get();
    if (s.status !== 'playing') return;

    const sortedBaggages = s.baggages.filter(b => b.status === 'sorted');
    const sortedCount = sortedBaggages.length;
    let newToasts = s.toasts;

    if (sortedCount > 0) {
      const bonusPerPiece = 3;
      const totalBonus = sortedCount * bonusPerPiece;
      const confirmedIds = new Set(sortedBaggages.map(b => b.id));
      const confirmedBaggageRecords = sortedBaggages.map(b => ({ ...b, status: 'confirmed' as const }));
      const newScoreState = {
        ...s.scoreState,
        baseScore: s.scoreState.baseScore + totalBonus,
        confirmedSortedCount: s.scoreState.confirmedSortedCount + sortedCount,
        confirmedBaggages: [...s.scoreState.confirmedBaggages, ...confirmedBaggageRecords],
      };
      const newBaggages = s.baggages.filter(b => !confirmedIds.has(b.id));
      const newChannels = s.channels.map(ch => ({
        ...ch,
        baggageIds: ch.baggageIds.filter(id => !confirmedIds.has(id)),
        currentLoad: Math.max(0, ch.currentLoad - ch.baggageIds.filter(id => confirmedIds.has(id)).length),
      }));

      newToasts = addToast(
        newToasts,
        'success',
        `已确认 ${sortedCount} 件行李 +${totalBonus}`
      );

      set({
        toasts: newToasts,
        baggages: newBaggages,
        channels: newChannels,
        scoreState: newScoreState,
      });
    } else {
      newToasts = addToast(newToasts, 'info', '暂无可确认的已分拣行李');
      set({ toasts: newToasts });
    }
  },

  handleOverweight: (baggageId: string) => {
    const s = get();
    if (s.status !== 'playing') return;
    const baggage = s.baggages.find(b => b.id === baggageId);
    if (!baggage || baggage.weightLevel !== 'overweight') return;

    const reactionTime = s.gameTimeMs - baggage.createdAt;
    const newScoreState = { ...s.scoreState };
    newScoreState.overweightHandles.push({
      baggageId,
      handledAt: s.gameTimeMs,
      reactionTime,
    });

    let bonus = 25;
    if (reactionTime < 5000) bonus += 15;
    newScoreState.baseScore += bonus;

    const newBaggages = s.baggages.map(b =>
      b.id === baggageId ? { ...b, weightLevel: 'heavy' as const, weight: Math.min(b.weight, 32) } : b
    );

    const newToasts = addToast(s.toasts, 'success', `超重处理 +${bonus}`);
    set({ scoreState: newScoreState, baggages: newBaggages, toasts: newToasts });
  },

  handleSecurityRecheck: (baggageId: string) => {
    const s = get();
    if (s.status !== 'playing') return;
    const baggage = s.baggages.find(b => b.id === baggageId);
    if (!baggage || baggage.isSecurityChecked) return;

    const passed = Math.random() > 0.2;
    const newAttempts = baggage.securityRecheckAttempts + 1;
    const newBaggages = s.baggages.map(b =>
      b.id === baggageId
        ? {
            ...b,
            isSecurityChecked: passed,
            securityRecheckAttempts: newAttempts,
            lastSecurityFailed: !passed,
          }
        : b
    );

    let newToasts = s.toasts;
    if (passed) {
      newToasts = addToast(
        s.toasts,
        'success',
        `安检复核通过 ✓ (第${newAttempts}次)`
      );
    } else {
      const failHint =
        newAttempts >= 3
          ? `连续${newAttempts}次未通过，继续重试`
          : newAttempts === 2
          ? '再次未通过，请再次尝试'
          : '未通过，需重新处理';
      newToasts = addToast(
        s.toasts,
        'error',
        `安检复核(${newAttempts}/?)：${failHint}`
      );
    }

    set({ baggages: newBaggages, toasts: newToasts });
  },

  handleGateChangeConfirm: (eventId: string) => {
    const s = get();
    if (s.status !== 'playing') return;

    const handle = s.scoreState.gateChangeHandles.find(h => h.eventId === eventId);
    if (!handle) return;

    const relatedChannel = s.channels.find(ch => ch.gateChangeEventId === eventId);
    if (!relatedChannel || relatedChannel.gateChangeConfirmed) return;

    const event = s.activeEvents.find(e => e.id === eventId)
      || s.pastEvents.find(e => e.id === eventId);

    const triggerTimeMs = (event?.triggerTime || handle.confirmedAt || 0) * 1000;
    const reactionTime = s.gameTimeMs - triggerTimeMs;

    let bonus = 30;
    if (reactionTime < 5000) bonus += 15;

    const newScoreState = {
      ...s.scoreState,
      baseScore: s.scoreState.baseScore + bonus,
      gateChangeHandles: s.scoreState.gateChangeHandles.map(h =>
        h.eventId === eventId
          ? { ...h, confirmedAt: s.gameTimeMs, reactionTime }
          : h
      ),
    };

    let newActiveEvents = s.activeEvents;
    let newPastEvents = s.pastEvents;
    if (event && !event.confirmed) {
      newActiveEvents = s.activeEvents.map(e =>
        e.id === eventId ? { ...e, confirmed: true, resolved: true } : e
      );
      const foundInActive = s.activeEvents.some(e => e.id === eventId);
      if (foundInActive) {
        newPastEvents = [...s.pastEvents, ...newActiveEvents.filter(e => e.id === eventId && e.resolved)];
        newActiveEvents = newActiveEvents.filter(e => !(e.id === eventId && e.resolved));
      }
    }

    const newChannels = s.channels.map(ch =>
      ch.gateChangeEventId === eventId
        ? { ...ch, gateChangeConfirmed: true }
        : ch
    );

    const flight = s.level?.flights.find(f => f.id === handle.flightId);
    const newToasts = addToast(
      s.toasts,
      'success',
      `登机口已确认 ${flight?.flightNo || ''}: ${handle.oldGate} → ${handle.newGate} +${bonus}`
    );

    set({
      scoreState: newScoreState,
      activeEvents: newActiveEvents,
      pastEvents: newPastEvents,
      channels: newChannels,
      toasts: newToasts,
    });
  },

  dismissToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
}));
