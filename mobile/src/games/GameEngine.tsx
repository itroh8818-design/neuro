/**
 * Base Game Engine - wraps all cognitive games with common functionality
 * Handles timer, scoring, difficulty, and game lifecycle
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { LargeButton } from '../components/ui/LargeButton';
import { colors, spacing, borderRadius } from '../config/theme';
import { GameType, DifficultyLevel, GameSession } from '../models/types';
import { useAppStore } from '../store/useAppStore';
import { generateId } from '../services/encryption';
import { saveGameSession } from '../services/storage';
import { updateDifficulty } from '../ai/DifficultyPredictor';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GameEngineProps {
  gameType: GameType;
  difficulty: DifficultyLevel;
  children: (props: GameChildProps) => React.ReactNode;
  onGameComplete?: (session: GameSession) => void;
}

export interface GameChildProps {
  score: number;
  maxScore: number;
  timeRemaining: number;
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  onComplete: () => void;
  onHint: () => void;
  addResponseTime: (ms: number) => void;
  hintsUsed: number;
}

const TIME_LIMITS: Record<DifficultyLevel, number> = {
  easy: 120,    // 2 minutes
  medium: 90,   // 1.5 minutes
  hard: 60,     // 1 minute
};

export const GameEngine: React.FC<GameEngineProps> = ({
  gameType,
  difficulty,
  children,
  onGameComplete,
}) => {
  const { currentUser } = useAppStore();
  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [maxScore] = useState(getMaxScore(difficulty));
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMITS[difficulty]);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  const handleScore = useCallback((points: number) => {
    setScore((prev) => Math.min(prev + points, maxScore));
    setAttempts((prev) => prev + 1);
  }, [maxScore]);

  const addResponseTime = useCallback((ms: number) => {
    setResponseTimes((prev) => [...prev, ms]);
  }, []);

  const handleHint = useCallback(() => {
    setHintsUsed((prev) => prev + 1);
  }, []);

  const handleComplete = useCallback(async () => {
    if (isComplete) return;
    setIsComplete(true);

    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const session: GameSession = {
      id: generateId(),
      userId: currentUser?.id || '',
      gameType,
      difficulty,
      score,
      maxScore,
      accuracy,
      responseTimeMs: avgResponseTime,
      durationMs: (TIME_LIMITS[difficulty] - timeRemaining) * 1000,
      completed: score >= maxScore * 0.5,
      hintsUsed,
      attempts,
      createdAt: new Date().toISOString(),
    };

    // Save session and update difficulty
    try {
      await saveGameSession(session);
      await updateDifficulty(session);
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    onGameComplete?.(session);
  }, [score, maxScore, responseTimes, currentUser, gameType, difficulty, timeRemaining, hintsUsed, attempts, isComplete]);

  const handleEndGame = () => {
    handleComplete();
  };

  if (isComplete) {
    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const isGood = accuracy >= 60;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.resultContainer}>
          <Animated.View
            style={[
              styles.resultCard,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LargeText size="hero" weight="bold" align="center">
              {isGood ? '🎉' : '💪'}
            </LargeText>
            <LargeText size="xl" weight="bold" align="center" style={styles.resultTitle}>
              {isGood ? t('games.greatJob') : t('games.keepTrying')}
            </LargeText>
            <LargeText size="lg" align="center" style={styles.scoreText}>
              {t('games.yourScore', { score })}
            </LargeText>
            <LargeText size="md" align="center" style={styles.accuracyText}>
              {t('games.score', { score: `${Math.round(accuracy)}%` })}
            </LargeText>
            <LargeText size="md" align="center" style={styles.timeText}>
              {t('games.playTime', {
                minutes: Math.round((TIME_LIMITS[difficulty] - timeRemaining) / 60 * 10) / 10,
              })}
            </LargeText>

            <View style={styles.resultButtons}>
              <LargeButton
                title={t('games.tryAgain')}
                onPress={() => {
                  setIsComplete(false);
                  setScore(0);
                  setTimeRemaining(TIME_LIMITS[difficulty]);
                  setHintsUsed(0);
                  setAttempts(0);
                  setResponseTimes([]);
                }}
                variant="primary"
                size="large"
                fullWidth
              />
              <LargeButton
                title={t('games.backToGames')}
                onPress={() => onGameComplete?.(null as any)}
                variant="outline"
                size="large"
                fullWidth
              />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with score and timer */}
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <LargeText size="sm" color={colors.textSecondary}>{t('games.score', { score: '' })}</LargeText>
          <LargeText size="lg" weight="bold">{score}</LargeText>
        </View>

        <View style={styles.headerCenter}>
          <LargeText size="sm" color={colors.textSecondary}>
            {t('games.level', { level: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) })}
          </LargeText>
        </View>

        <View style={styles.headerItem}>
          <LargeText size="sm" color={colors.textSecondary}>{t('games.time', { time: '' })}</LargeText>
          <LargeText
            size="lg"
            weight="bold"
            color={timeRemaining <= 15 ? colors.error : colors.textPrimary}
          >
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </LargeText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${(score / maxScore) * 100}%`,
              backgroundColor: score >= maxScore * 0.6 ? colors.success : colors.accent,
            },
          ]}
        />
      </View>

      {/* Game content */}
      <Animated.View
        style={[
          styles.gameContent,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {children({
          score,
          maxScore,
          timeRemaining,
          difficulty,
          onScore: handleScore,
          onComplete: handleComplete,
          onHint: handleHint,
          addResponseTime,
          hintsUsed,
        })}
      </Animated.View>

      {/* End game button */}
      <View style={styles.footer}>
        <LargeButton
          title={t('common.close')}
          onPress={handleEndGame}
          variant="outline"
          size="medium"
        />
      </View>
    </SafeAreaView>
  );
};

function getMaxScore(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'easy': return 100;
    case 'medium': return 150;
    case 'hard': return 200;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.overlayLight,
  },
  headerItem: {
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.overlayLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  gameContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  resultTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  scoreText: {
    marginBottom: spacing.sm,
  },
  accuracyText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeText: {
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  resultButtons: {
    width: '100%',
    gap: spacing.md,
  },
});

export default GameEngine;
