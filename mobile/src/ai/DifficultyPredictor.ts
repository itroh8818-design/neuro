/**
 * AI Difficulty Predictor
 * Adjusts game difficulty based on player performance
 * Uses rule-based system with TFLite fallback
 */
import { GameSession, DifficultyLevel, GameType, DifficultyState } from '../models/types';
import { getDifficultyState, saveDifficultyState } from '../services/storage';
import { generateId } from '../services/encryption';

const HIGH_SCORE_THRESHOLD = 80;    // Score % to consider "high"
const LOW_SCORE_THRESHOLD = 40;     // Score % to consider "low"
const CONSECUTIVE_THRESHOLD = 3;    // Number of consecutive scores to trigger level change
const MAX_RECENT_ENTRIES = 10;      // Keep last 10 sessions for analysis

/**
 * Update difficulty based on a new game session
 */
export const updateDifficulty = async (session: GameSession): Promise<DifficultyState> => {
  let state = await getDifficultyState(session.userId, session.gameType);

  if (!state) {
    state = createInitialState(session.userId, session.gameType);
  }

  // Calculate accuracy percentage
  const accuracy = session.maxScore > 0
    ? (session.score / session.maxScore) * 100
    : session.accuracy;

  // Update recent scores
  const recentScores = [...state.recentScores, accuracy].slice(-MAX_RECENT_ENTRIES);
  const recentAccuracy = [...state.recentAccuracy, accuracy].slice(-MAX_RECENT_ENTRIES);
  const recentResponseTimes = [...state.recentResponseTimes, session.responseTimeMs].slice(-MAX_RECENT_ENTRIES);

  // Calculate averages
  const averageAccuracy = recentAccuracy.reduce((a, b) => a + b, 0) / recentAccuracy.length;
  const averageResponseTime = recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length;

  // Update consecutive counters
  let consecutiveHighScores = state.consecutiveHighScores;
  let consecutiveLowScores = state.consecutiveLowScores;

  if (accuracy >= HIGH_SCORE_THRESHOLD) {
    consecutiveHighScores += 1;
    consecutiveLowScores = 0;
  } else if (accuracy <= LOW_SCORE_THRESHOLD) {
    consecutiveLowScores += 1;
    consecutiveHighScores = 0;
  } else {
    consecutiveHighScores = 0;
    consecutiveLowScores = 0;
  }

  // Determine new difficulty level
  let newLevel = state.currentLevel;

  if (consecutiveHighScores >= CONSECUTIVE_THRESHOLD) {
    newLevel = getHigherDifficulty(state.currentLevel);
  } else if (consecutiveLowScores >= CONSECUTIVE_THRESHOLD) {
    newLevel = getLowerDifficulty(state.currentLevel);
  }

  // Additional heuristic: if average accuracy is very high, level up
  if (averageAccuracy > 85 && state.totalSessions > 5 && newLevel === state.currentLevel) {
    newLevel = getHigherDifficulty(state.currentLevel);
  }

  // Additional heuristic: if average accuracy is very low, level down
  if (averageAccuracy < 35 && state.totalSessions > 3 && newLevel === state.currentLevel) {
    newLevel = getLowerDifficulty(state.currentLevel);
  }

  const updatedState: DifficultyState = {
    ...state,
    currentLevel: newLevel,
    recentScores,
    recentAccuracy,
    recentResponseTimes,
    averageAccuracy,
    averageResponseTime,
    totalSessions: state.totalSessions + 1,
    consecutiveHighScores,
    consecutiveLowScores,
    updatedAt: new Date().toISOString(),
  };

  await saveDifficultyState(updatedState);
  return updatedState;
};

/**
 * Get current difficulty for a game type
 */
export const getCurrentDifficulty = async (
  userId: string,
  gameType: GameType
): Promise<DifficultyLevel> => {
  const state = await getDifficultyState(userId, gameType);
  return state?.currentLevel || 'easy';
};

/**
 * Analyze cognitive decline pattern
 * Returns trend: 'improving', 'stable', 'declining'
 */
export const analyzeCognitiveTrend = async (
  userId: string,
  gameType: GameType,
  days: number = 14
): Promise<{ trend: 'improving' | 'stable' | 'declining'; confidence: number }> => {
  const state = await getDifficultyState(userId, gameType);

  if (!state || state.recentScores.length < 5) {
    return { trend: 'stable', confidence: 0.3 };
  }

  const scores = state.recentScores;
  const midpoint = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, midpoint);
  const secondHalf = scores.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;
  const confidence = Math.min(0.9, 0.3 + (scores.length / MAX_RECENT_ENTRIES) * 0.6);

  if (difference > 10) {
    return { trend: 'improving', confidence };
  } else if (difference < -10) {
    return { trend: 'declining', confidence };
  }

  return { trend: 'stable', confidence };
};

/**
 * Get overall cognitive health score
 * Combines all game types into a single score
 */
export const getOverallCognitiveScore = async (userId: string): Promise<number> => {
  const gameTypes: GameType[] = [
    'memory_match',
    'pattern_recognition',
    'daily_routine',
    'object_recognition',
    'attention_focus',
    'emotional_engagement',
  ];

  let totalScore = 0;
  let count = 0;

  for (const gameType of gameTypes) {
    const state = await getDifficultyState(userId, gameType);
    if (state && state.totalSessions > 0) {
      // Map difficulty level to score
      const levelScore = state.currentLevel === 'easy' ? 33 : state.currentLevel === 'medium' ? 66 : 100;
      const accuracyWeight = state.averageAccuracy / 100;
      totalScore += levelScore * accuracyWeight;
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 50;
};

// Helper functions
function createInitialState(userId: string, gameType: GameType): DifficultyState {
  return {
    userId,
    gameType,
    currentLevel: 'easy',
    recentScores: [],
    recentAccuracy: [],
    recentResponseTimes: [],
    averageAccuracy: 0,
    averageResponseTime: 0,
    totalSessions: 0,
    consecutiveHighScores: 0,
    consecutiveLowScores: 0,
    updatedAt: new Date().toISOString(),
  };
}

function getHigherDifficulty(current: DifficultyLevel): DifficultyLevel {
  switch (current) {
    case 'easy': return 'medium';
    case 'medium': return 'hard';
    case 'hard': return 'hard'; // Stay at hard
  }
}

function getLowerDifficulty(current: DifficultyLevel): DifficultyLevel {
  switch (current) {
    case 'easy': return 'easy'; // Stay at easy
    case 'medium': return 'easy';
    case 'hard': return 'medium';
  }
}
