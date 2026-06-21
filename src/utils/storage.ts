import type { HighScoreRecord, GameResult, GameSettings, STORAGE_KEYS as SK } from '../types';
import { STORAGE_KEYS } from '../types';
import { LEVELS } from '../data/levels';

const safeGet = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

const safeSet = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
};

export const getHighScores = (): HighScoreRecord[] => {
  return safeGet<HighScoreRecord[]>(STORAGE_KEYS.HIGH_SCORES, []);
};

export const getHighScoreByLevel = (levelId: string): HighScoreRecord | undefined => {
  return getHighScores().find(r => r.levelId === levelId);
};

export const saveHighScore = (result: GameResult): HighScoreRecord | null => {
  const scores = getHighScores();
  const existingIdx = scores.findIndex(r => r.levelId === result.levelId);

  const triggerCount = result.gateChangeHandles.length;
  const confirmCount = result.gateChangeHandles.filter(h => h.confirmedAt !== undefined).length;
  const unconfirmedCount = result.gateChangeHandles.filter(h => h.confirmedAt === undefined).length;

  const newRecord: HighScoreRecord = {
    levelId: result.levelId,
    score: result.totalScore,
    grade: result.grade,
    timestamp: result.timestamp,
    gateChangeStats: triggerCount > 0 ? {
      triggerCount,
      confirmCount,
      unconfirmedCount,
    } : undefined,
  };

  if (existingIdx >= 0) {
    if (scores[existingIdx].score < result.totalScore) {
      scores[existingIdx] = newRecord;
      safeSet(STORAGE_KEYS.HIGH_SCORES, scores);
      return newRecord;
    }
    return null;
  } else {
    scores.push(newRecord);
    safeSet(STORAGE_KEYS.HIGH_SCORES, scores);
    return newRecord;
  }
};

export const getUnlockedLevels = (): Set<string> => {
  const unlocked = safeGet<string[]>(STORAGE_KEYS.UNLOCKED_LEVELS, LEVELS.filter(l => l.unlocked).map(l => l.id));
  return new Set(unlocked);
};

export const isLevelUnlocked = (levelId: string): boolean => {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return false;
  if (level.unlocked) return true;
  const unlocked = getUnlockedLevels();
  if (unlocked.has(levelId)) return true;

  if (level.unlockScore !== undefined) {
    const scores = getHighScores();
    const totalScore = scores.reduce((sum, r) => sum + r.score, 0);
    if (totalScore >= level.unlockScore) {
      unlocked.add(levelId);
      safeSet(STORAGE_KEYS.UNLOCKED_LEVELS, Array.from(unlocked));
      return true;
    }
  }
  return false;
};

export const getGameSettings = (): GameSettings => {
  return safeGet<GameSettings>(STORAGE_KEYS.GAME_SETTINGS, {
    soundEnabled: true,
    musicVolume: 0.5,
    dragSensitivity: 1,
  });
};

export const saveGameSettings = (settings: GameSettings): void => {
  safeSet(STORAGE_KEYS.GAME_SETTINGS, settings);
};

export const saveLastResult = (result: GameResult): void => {
  safeSet(STORAGE_KEYS.LAST_RESULT, result);
};

export const getLastResult = (): GameResult | null => {
  return safeGet<GameResult | null>(STORAGE_KEYS.LAST_RESULT, null);
};
