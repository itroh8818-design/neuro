/**
 * Progress Screen
 * Cognitive performance tracking and analytics
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { getCognitiveScores, getWeeklyStats } from '../services/storage';
import { getOverallCognitiveScore } from '../ai/DifficultyPredictor';
import { CognitiveScore } from '../models/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProgressScreen: React.FC = () => {
  const { currentUser } = useAppStore();
  const { t } = useTranslation();
  const [scores, setScores] = useState<CognitiveScore[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!currentUser) return;
    try {
      const [cognitiveScores, stats, overall] = await Promise.all([
        getCognitiveScores(currentUser.id, 30),
        getWeeklyStats(currentUser.id),
        getOverallCognitiveScore(currentUser.id),
      ]);
      setScores(cognitiveScores);
      setWeeklyStats(stats);
      setOverallScore(overall);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  // Calculate average scores from recent data
  const getAverageScore = (field: keyof CognitiveScore): number => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, s) => acc + (Number(s[field]) || 0), 0);
    return Math.round(sum / scores.length);
  };

  const scoreCategories = [
    { key: 'memory' as const, icon: '🧠', color: '#4CAF50' },
    { key: 'attention' as const, icon: '🎯', color: '#2196F3' },
    { key: 'pattern' as const, icon: '🔍', color: '#FF9800' },
    { key: 'routine' as const, icon: '📅', color: '#9C27B0' },
    { key: 'objectRec' as const, icon: '👁️', color: '#F44336' },
    { key: 'emotional' as const, icon: '❤️', color: '#E91E63' },
  ];

  const gameStats = weeklyStats?.byGame || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LargeText size="xxl" weight="bold">
        📊 {t('progress.title')}
      </LargeText>

      {/* Overall Score */}
      <HighContrastCard variant="elevated" style={styles.overallCard}>
        <LargeText size="lg" weight="bold" align="center">
          {t('progress.overallScore')}
        </LargeText>
        <View style={styles.scoreCircle}>
          <LargeText size="hero" weight="bold" style={{ color: getScoreColor(overallScore) }}>
            {overallScore}
          </LargeText>
          <LargeText size="sm" color={colors.textSecondary}>/100</LargeText>
        </View>
      </HighContrastCard>

      {/* Weekly Stats */}
      <View style={styles.statsRow}>
        <HighContrastCard style={styles.miniStatCard}>
          <LargeText size="xl" weight="bold" align="center">
            {weeklyStats?.totalSessions || 0}
          </LargeText>
          <LargeText size="xs" align="center" color={colors.textSecondary}>
            {t('progress.gamesPlayed', { count: '' })}
          </LargeText>
        </HighContrastCard>

        <HighContrastCard style={styles.miniStatCard}>
          <LargeText size="xl" weight="bold" align="center">
            {Math.round((weeklyStats?.totalDurationMs || 0) / 3600000 * 10) / 10}
          </LargeText>
          <LargeText size="xs" align="center" color={colors.textSecondary}>
            {t('progress.totalPlayTime', { hours: '' })}
          </LargeText>
        </HighContrastCard>
      </View>

      {/* Cognitive Scores by Category */}
      <LargeText size="lg" weight="bold" style={styles.sectionTitle}>
        🧩 {t('progress.cognitiveScore')}
      </LargeText>

      <View style={styles.scoreGrid}>
        {scoreCategories.map((cat) => {
          const score = getAverageScore(cat.key);
          return (
            <HighContrastCard key={cat.key} style={styles.scoreCard}>
              <View style={styles.scoreCardHeader}>
                <LargeText style={styles.scoreIcon}>{cat.icon}</LargeText>
                <LargeText size="sm" weight="bold">
                  {t(`progress.${cat.key}Score`)}
                </LargeText>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      width: `${score}%`,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
              <LargeText size="md" weight="bold" align="center" style={{ color: cat.color }}>
                {score}%
              </LargeText>
            </HighContrastCard>
          );
        })}
      </View>

      {/* Per-game stats */}
      {gameStats.length > 0 && (
        <>
          <LargeText size="lg" weight="bold" style={styles.sectionTitle}>
            📈 {t('progress.weeklyProgress')}
          </LargeText>

          {gameStats.map((stat: any, index: number) => (
            <HighContrastCard key={index} style={styles.gameStatCard}>
              <View style={styles.gameStatRow}>
                <LargeText size="md" weight="bold">
                  {getGameName(stat.gameType)}
                </LargeText>
                <LargeText size="sm" color={colors.textSecondary}>
                  {stat.count} games
                </LargeText>
              </View>
              <View style={styles.gameStatBar}>
                <View
                  style={[
                    styles.gameStatBarFill,
                    { width: `${Math.min(100, stat.avgAccuracy)}%` },
                  ]}
                />
              </View>
              <LargeText size="sm" color={colors.textSecondary}>
                Avg Accuracy: {Math.round(stat.avgAccuracy)}%
              </LargeText>
            </HighContrastCard>
          ))}
        </>
      )}

      {scores.length === 0 && (
        <HighContrastCard style={styles.emptyCard}>
          <LargeText size="lg" align="center">
            {t('progress.noData')}
          </LargeText>
        </HighContrastCard>
      )}
    </ScrollView>
  );
};

function getScoreColor(score: number): string {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.accent;
  return colors.error;
}

function getGameName(gameType: string): string {
  const names: Record<string, string> = {
    memory_match: '🧠 Memory Match',
    pattern_recognition: '🔍 Pattern',
    daily_routine: '📅 Daily Routine',
    object_recognition: '👁️ Object Recognition',
    attention_focus: '🎯 Attention',
    emotional_engagement: '❤️ Emotional',
  };
  return names[gameType] || gameType;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  overallCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginVertical: spacing.lg,
  },
  scoreCircle: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  scoreGrid: {
    gap: spacing.md,
  },
  scoreCard: {
    padding: spacing.lg,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreIcon: {
    fontSize: 24,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: colors.overlayLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  gameStatCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  gameStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gameStatBar: {
    height: 8,
    backgroundColor: colors.overlayLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  gameStatBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  emptyCard: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
});

export default ProgressScreen;
