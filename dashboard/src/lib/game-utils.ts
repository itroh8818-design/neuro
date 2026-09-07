// ===== SOUND EFFECTS (Web Audio API - no external files needed) =====

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Soft attack and release for soothing sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio context not available
  }
}

// Soothing sounds for elderly patients
export const Sounds = {
  // Card flip - gentle chime
  cardFlip: () => {
    playTone(880, 0.15, "sine", 0.2);
    setTimeout(() => playTone(1100, 0.1, "sine", 0.15), 50);
  },
  
  // Match found - warm ascending notes
  match: () => {
    playTone(523, 0.15, "sine", 0.25); // C5
    setTimeout(() => playTone(659, 0.15, "sine", 0.25), 100); // E5
    setTimeout(() => playTone(784, 0.2, "sine", 0.3), 200); // G5
  },
  
  // Mismatch - gentle descending tone (not jarring)
  mismatch: () => {
    playTone(440, 0.2, "sine", 0.15); // A4
    setTimeout(() => playTone(349, 0.25, "sine", 0.12), 150); // F4
  },
  
  // Game complete - celebration melody
  gameComplete: () => {
    const melody = [523, 587, 659, 784, 880, 1047]; // C5 to C6
    melody.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.25), i * 120);
    });
  },
  
  // Level up - triumphant sound
  levelUp: () => {
    playTone(523, 0.15, "sine", 0.3);
    setTimeout(() => playTone(659, 0.15, "sine", 0.3), 100);
    setTimeout(() => playTone(784, 0.15, "sine", 0.3), 200);
    setTimeout(() => playTone(1047, 0.3, "sine", 0.35), 300);
  },
  
  // Button click - soft tap
  buttonClick: () => {
    playTone(660, 0.08, "sine", 0.15);
  },
  
  // Sequence highlight - gentle ping
  sequenceHighlight: (index: number) => {
    const freq = 440 + (index * 110); // Ascending pitch per cell
    playTone(freq, 0.12, "sine", 0.2);
  },
  
  // Correct answer
  correct: () => {
    playTone(659, 0.12, "sine", 0.25);
    setTimeout(() => playTone(784, 0.15, "sine", 0.25), 80);
  },
  
  // Wrong answer - gentle
  wrong: () => {
    playTone(330, 0.2, "sine", 0.15);
  },
  
  // Timer tick - very soft
  tick: () => {
    playTone(1200, 0.03, "sine", 0.05);
  },
};

// ===== DIFFICULTY LEVELS =====

export interface DifficultyConfig {
  level: number;
  name: string;
  color: string;
  pairs?: number;        // Memory Match
  patternLength?: number; // Pattern Recall
  gridCells?: number;    // Focus Test
  sequenceTime?: number; // Pattern Recall display time
  timeBonus?: number;    // Extra seconds for harder levels
}

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  { level: 1, name: "Easy", color: "text-green-600 bg-green-100", pairs: 4, patternLength: 3, gridCells: 3, sequenceTime: 1500 },
  { level: 2, name: "Medium", color: "text-blue-600 bg-blue-100", pairs: 6, patternLength: 4, gridCells: 4, sequenceTime: 1200 },
  { level: 3, name: "Hard", color: "text-orange-600 bg-orange-100", pairs: 8, patternLength: 5, gridCells: 4, sequenceTime: 1000 },
  { level: 4, name: "Tough", color: "text-red-600 bg-red-100", pairs: 10, patternLength: 6, gridCells: 5, sequenceTime: 800 },
  { level: 5, name: "Expert", color: "text-purple-600 bg-purple-100", pairs: 12, patternLength: 7, gridCells: 5, sequenceTime: 600 },
];

// ===== GAME STATE MANAGEMENT (localStorage) =====

export interface GameProgress {
  currentLevel: number;
  gamesPlayed: number;
  totalScore: number;
  totalCorrect: number;
  totalAttempts: number;
  bestScores: Record<number, number>; // level -> best score
  lastPlayed: string; // ISO date
  unlockedLevel: number;
}

export interface AllGameStats {
  memory_match: GameProgress;
  pattern_recognition: GameProgress;
  daily_routine: GameProgress;
  object_recognition: GameProgress;
  attention_focus: GameProgress;
  emotional_engagement: GameProgress;
}

function createDefaultProgress(): GameProgress {
  return {
    currentLevel: 1,
    gamesPlayed: 0,
    totalScore: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    bestScores: {},
    lastPlayed: new Date().toISOString(),
    unlockedLevel: 1,
  };
}

export function getAllGameStats(patientId: string): AllGameStats {
  if (typeof window === "undefined") {
    return getDefaultAllStats();
  }
  try {
    const stored = localStorage.getItem(`cognicare_stats_${patientId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultAllStats();
}

function getDefaultAllStats(): AllGameStats {
  return {
    memory_match: createDefaultProgress(),
    pattern_recognition: createDefaultProgress(),
    daily_routine: createDefaultProgress(),
    object_recognition: createDefaultProgress(),
    attention_focus: createDefaultProgress(),
    emotional_engagement: createDefaultProgress(),
  };
}

export function saveGameStats(patientId: string, stats: AllGameStats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`cognicare_stats_${patientId}`, JSON.stringify(stats));
  } catch {}
}

export function getGameStats(patientId: string, gameType: string): GameProgress {
  const allStats = getAllGameStats(patientId);
  return allStats[gameType as keyof AllGameStats] || createDefaultProgress();
}

export function updateGameStats(
  patientId: string,
  gameType: string,
  correct: number,
  total: number,
  score: number
): { newStats: GameProgress; levelUp: boolean } {
  const allStats = getAllGameStats(patientId);
  const progress = allStats[gameType as keyof AllGameStats] || createDefaultProgress();
  
  progress.gamesPlayed += 1;
  progress.totalScore += score;
  progress.totalCorrect += correct;
  progress.totalAttempts += total;
  progress.lastPlayed = new Date().toISOString();
  
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  
  // Level up logic: need 80%+ accuracy and at least 3 games at current level
  let levelUp = false;
  if (accuracy >= 80 && progress.gamesPlayed >= 3 && progress.currentLevel < 5) {
    const nextLevel = progress.currentLevel + 1;
    if (nextLevel > progress.unlockedLevel) {
      progress.unlockedLevel = nextLevel;
      progress.currentLevel = nextLevel;
      levelUp = true;
    }
  }
  
  // Track best score per level
  if (!progress.bestScores[progress.currentLevel] || score > progress.bestScores[progress.currentLevel]) {
    progress.bestScores[progress.currentLevel] = score;
  }
  
  allStats[gameType as keyof AllGameStats] = progress;
  saveGameStats(patientId, allStats);
  
  return { newStats: progress, levelUp };
}

// ===== HELPER FUNCTIONS =====

export function getAccuracy(stats: GameProgress): number {
  if (stats.totalAttempts === 0) return 0;
  return Math.round((stats.totalCorrect / stats.totalAttempts) * 100);
}

export function getOverallScore(stats: AllGameStats): number {
  const games = Object.values(stats);
  const totalCorrect = games.reduce((sum, g) => sum + g.totalCorrect, 0);
  const totalAttempts = games.reduce((sum, g) => sum + g.totalAttempts, 0);
  if (totalAttempts === 0) return 0;
  return Math.round((totalCorrect / totalAttempts) * 100);
}

export function getTotalGamesPlayed(stats: AllGameStats): number {
  return Object.values(stats).reduce((sum, g) => sum + g.gamesPlayed, 0);
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
