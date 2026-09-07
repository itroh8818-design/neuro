/**
 * Local SQLite database service for offline-first architecture
 */
import * as SQLite from 'expo-sqlite';
import {
  User,
  GameSession,
  CognitiveScore,
  Reminder,
  ReminderLog,
  DifficultyState,
  SyncQueueItem,
  GameType,
} from '../models/types';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('cognicare.db');
  await initDatabase(db);
  return db;
};

const initDatabase = async (database: SQLite.SQLiteDatabase) => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      language TEXT DEFAULT 'en',
      highContrast INTEGER DEFAULT 0,
      fontSize TEXT DEFAULT 'medium',
      voiceEnabled INTEGER DEFAULT 1,
      notificationsEnabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      gameType TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      maxScore INTEGER DEFAULT 100,
      accuracy REAL DEFAULT 0,
      responseTimeMs INTEGER DEFAULT 0,
      durationMs INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      hintsUsed INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cognitive_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      memory REAL DEFAULT 0,
      attention REAL DEFAULT 0,
      pattern REAL DEFAULT 0,
      routine REAL DEFAULT 0,
      objectRec REAL DEFAULT 0,
      emotional REAL DEFAULT 0,
      overall REAL DEFAULT 0,
      UNIQUE(userId, date),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      time TEXT NOT NULL,
      days TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      soundEnabled INTEGER DEFAULT 1,
      voiceEnabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminder_logs (
      id TEXT PRIMARY KEY,
      reminderId TEXT NOT NULL,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS difficulty_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      gameType TEXT NOT NULL,
      currentLevel TEXT DEFAULT 'easy',
      recentScores TEXT DEFAULT '[]',
      recentAccuracy TEXT DEFAULT '[]',
      recentResponseTimes TEXT DEFAULT '[]',
      averageAccuracy REAL DEFAULT 0,
      averageResponseTime REAL DEFAULT 0,
      totalSessions INTEGER DEFAULT 0,
      consecutiveHighScores INTEGER DEFAULT 0,
      consecutiveLowScores INTEGER DEFAULT 0,
      updatedAt TEXT NOT NULL,
      UNIQUE(userId, gameType),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      collection TEXT NOT NULL,
      documentId TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_game_sessions_user
      ON game_sessions(userId, gameType, createdAt);

    CREATE INDEX IF NOT EXISTS idx_cognitive_scores_user
      ON cognitive_scores(userId, date);

    CREATE INDEX IF NOT EXISTS idx_reminders_user
      ON reminders(userId, enabled);

    CREATE INDEX IF NOT EXISTS idx_sync_queue_synced
      ON sync_queue(synced);
  `);
};

// User operations
export const saveUser = async (user: User): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO users
     (id, name, age, language, highContrast, fontSize, voiceEnabled, notificationsEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.age,
      user.language,
      user.highContrast ? 1 : 0,
      user.fontSize,
      user.voiceEnabled ? 1 : 0,
      user.notificationsEnabled ? 1 : 0,
      user.createdAt,
      user.updatedAt,
    ]
  );
  await addToSyncQueue('users', user.id, user);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<any>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  if (!result) return null;
  return mapUser(result);
};

export const getAllUsers = async (): Promise<User[]> => {
  const database = await getDatabase();
  const results = await database.getAllAsync<any>('SELECT * FROM users ORDER BY name');
  return results.map(mapUser);
};

const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  age: row.age,
  language: row.language,
  highContrast: row.highContrast === 1,
  fontSize: row.fontSize,
  voiceEnabled: row.voiceEnabled === 1,
  notificationsEnabled: row.notificationsEnabled === 1,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

// Game session operations
export const saveGameSession = async (session: GameSession): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO game_sessions
     (id, userId, gameType, difficulty, score, maxScore, accuracy, responseTimeMs, durationMs, completed, hintsUsed, attempts, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.gameType,
      session.difficulty,
      session.score,
      session.maxScore,
      session.accuracy,
      session.responseTimeMs,
      session.durationMs,
      session.completed ? 1 : 0,
      session.hintsUsed,
      session.attempts,
      session.createdAt,
    ]
  );
  await addToSyncQueue('game_sessions', session.id, session);
};

export const getGameSessions = async (
  userId: string,
  gameType?: GameType,
  limit: number = 50
): Promise<GameSession[]> => {
  const database = await getDatabase();
  let query = 'SELECT * FROM game_sessions WHERE userId = ?';
  const params: any[] = [userId];

  if (gameType) {
    query += ' AND gameType = ?';
    params.push(gameType);
  }

  query += ' ORDER BY createdAt DESC LIMIT ?';
  params.push(limit);

  const results = await database.getAllAsync<any>(query, params);
  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    gameType: row.gameType,
    difficulty: row.difficulty,
    score: row.score,
    maxScore: row.maxScore,
    accuracy: row.accuracy,
    responseTimeMs: row.responseTimeMs,
    durationMs: row.durationMs,
    completed: row.completed === 1,
    hintsUsed: row.hintsUsed,
    attempts: row.attempts,
    createdAt: row.createdAt,
  }));
};

// Cognitive score operations
export const saveCognitiveScore = async (score: CognitiveScore): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO cognitive_scores
     (userId, date, memory, attention, pattern, routine, objectRec, emotional, overall)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      score.userId,
      score.date,
      score.memory,
      score.attention,
      score.pattern,
      score.routine,
      score.objectRec,
      score.emotional,
      score.overall,
    ]
  );
  await addToSyncQueue('cognitive_scores', `${score.userId}_${score.date}`, score);
};

export const getCognitiveScores = async (
  userId: string,
  days: number = 30
): Promise<CognitiveScore[]> => {
  const database = await getDatabase();
  const results = await database.getAllAsync<any>(
    `SELECT * FROM cognitive_scores
     WHERE userId = ?
     ORDER BY date DESC
     LIMIT ?`,
    [userId, days]
  );
  return results.map((row) => ({
    userId: row.userId,
    date: row.date,
    memory: row.memory,
    attention: row.attention,
    pattern: row.pattern,
    routine: row.routine,
    objectRec: row.objectRec,
    emotional: row.emotional,
    overall: row.overall,
  }));
};

// Reminder operations
export const saveReminder = async (reminder: Reminder): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO reminders
     (id, userId, type, title, description, time, days, enabled, soundEnabled, voiceEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reminder.id,
      reminder.userId,
      reminder.type,
      reminder.title,
      reminder.description || null,
      reminder.time,
      JSON.stringify(reminder.days),
      reminder.enabled ? 1 : 0,
      reminder.soundEnabled ? 1 : 0,
      reminder.voiceEnabled ? 1 : 0,
      reminder.createdAt,
      reminder.updatedAt,
    ]
  );
  await addToSyncQueue('reminders', reminder.id, reminder);
};

export const getReminders = async (userId: string): Promise<Reminder[]> => {
  const database = await getDatabase();
  const results = await database.getAllAsync<any>(
    'SELECT * FROM reminders WHERE userId = ? ORDER BY time',
    [userId]
  );
  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    description: row.description,
    time: row.time,
    days: JSON.parse(row.days),
    enabled: row.enabled === 1,
    soundEnabled: row.soundEnabled === 1,
    voiceEnabled: row.voiceEnabled === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM reminders WHERE id = ?', [reminderId]);
  await addToSyncQueue('reminders', reminderId, null);
};

// Reminder log operations
export const logReminderAction = async (log: ReminderLog): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO reminder_logs (id, reminderId, userId, action, timestamp) VALUES (?, ?, ?, ?, ?)',
    [log.id, log.reminderId, log.userId, log.action, log.timestamp]
  );
};

// Difficulty state operations
export const saveDifficultyState = async (state: DifficultyState): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO difficulty_states
     (userId, gameType, currentLevel, recentScores, recentAccuracy, recentResponseTimes,
      averageAccuracy, averageResponseTime, totalSessions, consecutiveHighScores, consecutiveLowScores, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      state.userId,
      state.gameType,
      state.currentLevel,
      JSON.stringify(state.recentScores),
      JSON.stringify(state.recentAccuracy),
      JSON.stringify(state.recentResponseTimes),
      state.averageAccuracy,
      state.averageResponseTime,
      state.totalSessions,
      state.consecutiveHighScores,
      state.consecutiveLowScores,
      state.updatedAt,
    ]
  );
};

export const getDifficultyState = async (
  userId: string,
  gameType: GameType
): Promise<DifficultyState | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<any>(
    'SELECT * FROM difficulty_states WHERE userId = ? AND gameType = ?',
    [userId, gameType]
  );
  if (!result) return null;
  return {
    userId: result.userId,
    gameType: result.gameType,
    currentLevel: result.currentLevel,
    recentScores: JSON.parse(result.recentScores),
    recentAccuracy: JSON.parse(result.recentAccuracy),
    recentResponseTimes: JSON.parse(result.recentResponseTimes),
    averageAccuracy: result.averageAccuracy,
    averageResponseTime: result.averageResponseTime,
    totalSessions: result.totalSessions,
    consecutiveHighScores: result.consecutiveHighScores,
    consecutiveLowScores: result.consecutiveLowScores,
    updatedAt: result.updatedAt,
  };
};

// Sync queue operations
const addToSyncQueue = async (
  collection: string,
  documentId: string,
  data: any
): Promise<void> => {
  const database = await getDatabase();
  const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await database.runAsync(
    `INSERT INTO sync_queue (id, action, collection, documentId, data, timestamp, synced)
     VALUES (?, 'create', ?, ?, ?, ?, 0)`,
    [id, collection, documentId, JSON.stringify(data), new Date().toISOString()]
  );
};

export const getUnsyncedItems = async (): Promise<SyncQueueItem[]> => {
  const database = await getDatabase();
  const results = await database.getAllAsync<any>(
    'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp'
  );
  return results.map((row) => ({
    id: row.id,
    action: row.action,
    collection: row.collection,
    documentId: row.documentId,
    data: JSON.parse(row.data),
    timestamp: row.timestamp,
    synced: row.synced === 1,
  }));
};

export const markSynced = async (id: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync('UPDATE sync_queue SET synced = 1 WHERE id = ?', [id]);
};

// Stats operations
export const getWeeklyStats = async (userId: string) => {
  const database = await getDatabase();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessions = await database.getAllAsync<any>(
    `SELECT gameType, COUNT(*) as count, AVG(accuracy) as avgAccuracy,
            AVG(durationMs) as avgDuration, SUM(score) as totalScore
     FROM game_sessions
     WHERE userId = ? AND createdAt >= ?
     GROUP BY gameType`,
    [userId, weekAgo.toISOString()]
  );

  const totalSessions = await database.getFirstAsync<any>(
    `SELECT COUNT(*) as total, SUM(durationMs) as totalDuration
     FROM game_sessions WHERE userId = ? AND createdAt >= ?`,
    [userId, weekAgo.toISOString()]
  );

  return {
    byGame: sessions,
    totalSessions: totalSessions?.total || 0,
    totalDurationMs: totalSessions?.totalDuration || 0,
  };
};
