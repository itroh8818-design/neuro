/**
 * Core data models for NER NeuroSmriti
 */

export interface User {
  id: string;
  name: string;
  age: number;
  language: 'en' | 'as' | 'hi';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  difficulty: DifficultyLevel;
  score: number;
  maxScore: number;
  accuracy: number;       // 0-100
  responseTimeMs: number; // average response time
  durationMs: number;     // total play time
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  createdAt: string;
}

export type GameType =
  | 'memory_match'
  | 'pattern_recognition'
  | 'daily_routine'
  | 'object_recognition'
  | 'attention_focus'
  | 'emotional_engagement';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface CognitiveScore {
  userId: string;
  date: string; // YYYY-MM-DD
  memory: number;       // 0-100
  attention: number;    // 0-100
  pattern: number;      // 0-100
  routine: number;      // 0-100
  objectRec: number;    // 0-100
  emotional: number;    // 0-100
  overall: number;      // 0-100
}

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  description?: string;
  time: string;         // HH:mm
  days: number[];       // 0=Sun, 1=Mon, ..., 6=Sat
  enabled: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'medicine' | 'hydration' | 'daily_activity' | 'appointment';

export interface ReminderLog {
  id: string;
  reminderId: string;
  userId: string;
  action: 'dismissed' | 'snoozed' | 'completed';
  timestamp: string;
}

export interface DifficultyState {
  userId: string;
  gameType: GameType;
  currentLevel: DifficultyLevel;
  // Performance tracking for AI adaptation
  recentScores: number[];      // last N scores (max 10)
  recentAccuracy: number[];    // last N accuracy values
  recentResponseTimes: number[];
  averageAccuracy: number;
  averageResponseTime: number;
  totalSessions: number;
  consecutiveHighScores: number;  // >80% triggers level up
  consecutiveLowScores: number;   // <40% triggers level down
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface GameAssets {
  id: string;
  gameType: GameType;
  language: string;
  culturalImages: CulturalImage[];
  voicePrompts: VoicePrompt[];
}

export interface CulturalImage {
  id: string;
  name: string;
  nameLocal: string;
  category: 'nature' | 'animal' | 'festival' | 'food' | 'daily' | 'emotion';
  path: string;
  difficulty: DifficultyLevel;
}

export interface VoicePrompt {
  id: string;
  text: string;
  language: string;
  context: string;
}

// Game-specific data types
export interface MemoryCard {
  id: string;
  imageId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface PatternSequence {
  elements: PatternElement[];
  answer: PatternElement;
  options: PatternElement[];
}

export interface PatternElement {
  id: string;
  shape: string;
  color: string;
  size: number;
}

export interface RoutineActivity {
  id: string;
  nameKey: string;    // i18n key
  icon: string;       // emoji
  correctOrder: number;
  currentOrder: number;
  imageLocal?: string; // local image for NER-specific items
}

export interface AttentionItem {
  id: string;
  type: string;
  isDifferent: boolean;
  position: { x: number; y: number };
}

export interface EmotionalPair {
  id: string;
  face: string;       // emoji face
  scenario: string;   // scenario description
  emotion: string;    // emotion name
  emotionLocal: string;
}
