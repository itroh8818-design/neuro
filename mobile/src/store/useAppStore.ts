/**
 * Global app state using Zustand
 */
import { create } from 'zustand';
import { User, GameType, DifficultyLevel } from '../models/types';
import { getUser, saveUser } from '../services/storage';
import { generateId } from '../services/encryption';

interface AppState {
  // User
  currentUser: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  // Game state
  currentGame: GameType | null;
  currentDifficulty: DifficultyLevel;

  // UI state
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  language: 'en' | 'as' | 'hi';
  voiceEnabled: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
  createProfile: (name: string, age: number) => Promise<void>;
  setCurrentGame: (game: GameType | null) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  setLanguage: (lang: 'en' | 'as' | 'hi') => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extraLarge') => void;
  setHighContrast: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isLoading: true,
  hasCompletedOnboarding: false,

  currentGame: null,
  currentDifficulty: 'easy',

  highContrast: false,
  fontSize: 'medium',
  language: 'en',
  voiceEnabled: true,

  initializeApp: async () => {
    try {
      // Try to load user from storage
      const users = await getAllUsers();
      if (users.length > 0) {
        const user = users[0];
        set({
          currentUser: user,
          highContrast: user.highContrast,
          fontSize: user.fontSize,
          language: user.language,
          voiceEnabled: user.voiceEnabled,
          hasCompletedOnboarding: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ isLoading: false });
    }
  },

  setUser: async (user: User) => {
    await saveUser(user);
    set({
      currentUser: user,
      highContrast: user.highContrast,
      fontSize: user.fontSize,
      language: user.language,
      voiceEnabled: user.voiceEnabled,
    });
  },

  createProfile: async (name: string, age: number) => {
    const now = new Date().toISOString();
    const user: User = {
      id: generateId(),
      name,
      age,
      language: get().language,
      highContrast: get().highContrast,
      fontSize: get().fontSize,
      voiceEnabled: get().voiceEnabled,
      notificationsEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await get().setUser(user);
    set({ hasCompletedOnboarding: true });
  },

  setCurrentGame: (game) => set({ currentGame: game }),
  setDifficulty: (level) => set({ currentDifficulty: level }),
  setLanguage: (lang) => set({ language: lang }),
  setFontSize: (size) => set({ fontSize: size }),
  setHighContrast: (enabled) => set({ highContrast: enabled }),
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));

// Helper to get all users (needed by initializeApp)
async function getAllUsers(): Promise<User[]> {
  try {
    const { getAllUsers: getAll } = await import('../services/storage');
    return await getAll();
  } catch {
    return [];
  }
}
