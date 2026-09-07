/**
 * Home Screen
 * Main screen with greeting, quick actions, and daily summary
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius, touchTarget, shadows } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { getWeeklyStats } from '../services/storage';
import { getCurrentDifficulty } from '../ai/DifficultyPredictor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentUser, highContrast } = useAppStore();
  const { t } = useTranslation();
  const [todayScore, setTodayScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!currentUser) return;
    try {
      const stats = await getWeeklyStats(currentUser.id);
      setTodayScore(stats.totalSessions);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const quickActions = [
    {
      icon: '🎮',
      title: t('home.playGames'),
      onPress: () => navigation.navigate('Games'),
      color: colors.primary,
    },
    {
      icon: '📊',
      title: t('home.myProgress'),
      onPress: () => navigation.navigate('Progress'),
      color: colors.accent,
    },
    {
      icon: '⏰',
      title: t('home.reminders'),
      onPress: () => navigation.navigate('Reminders'),
      color: colors.info,
    },
    {
      icon: '⚙️',
      title: t('home.settings'),
      onPress: () => navigation.navigate('Settings'),
      color: colors.textSecondary,
    },
  ];

  const gameCards = [
    {
      id: 'memory_match',
      icon: '🧠',
      title: t('games.memoryMatch'),
      desc: t('games.memoryMatchDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'memory_match' }),
    },
    {
      id: 'pattern_recognition',
      icon: '🔍',
      title: t('games.patternRecognition'),
      desc: t('games.patternRecognitionDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'pattern_recognition' }),
    },
    {
      id: 'daily_routine',
      icon: '📅',
      title: t('games.dailyRoutine'),
      desc: t('games.dailyRoutineDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'daily_routine' }),
    },
    {
      id: 'object_recognition',
      icon: '👁️',
      title: t('games.objectRecognition'),
      desc: t('games.objectRecognitionDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'object_recognition' }),
    },
    {
      id: 'attention_focus',
      icon: '🎯',
      title: t('games.attentionFocus'),
      desc: t('games.attentionFocusDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'attention_focus' }),
    },
    {
      id: 'emotional_engagement',
      icon: '❤️',
      title: t('games.emotionalEngagement'),
      desc: t('games.emotionalEngagementDesc'),
      onPress: () => navigation.navigate('GamePlay', { gameType: 'emotional_engagement' }),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with greeting */}
      <View style={styles.header}>
        <LargeText size="xxl" weight="bold">
          {t('home.greeting', { name: currentUser?.name || '' })}
        </LargeText>
        <LargeText size="md" color={colors.textSecondary}>
          {t('home.howAreYou')}
        </LargeText>
      </View>

      {/* Daily Stats */}
      <View style={styles.statsRow}>
        <HighContrastCard style={styles.statCard}>
          <LargeText size="xl" weight="bold" align="center">
            🔥 {streak}
          </LargeText>
          <LargeText size="sm" align="center" color={colors.textSecondary}>
            {t('home.dailyStreak', { count: streak })}
          </LargeText>
        </HighContrastCard>

        <HighContrastCard style={styles.statCard}>
          <LargeText size="xl" weight="bold" align="center">
            ⭐ {todayScore}
          </LargeText>
          <LargeText size="sm" align="center" color={colors.textSecondary}>
            {t('home.todayScore', { score: todayScore })}
          </LargeText>
        </HighContrastCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickAction, { backgroundColor: action.color + '20' }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <LargeText style={styles.quickActionIcon}>{action.icon}</LargeText>
            <LargeText size="sm" weight="medium" style={{ color: action.color }}>
              {action.title}
            </LargeText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Games Section */}
      <View style={styles.section}>
        <LargeText size="xl" weight="bold" style={styles.sectionTitle}>
          🎮 {t('games.title')}
        </LargeText>

        <View style={styles.gamesGrid}>
          {gameCards.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={game.onPress}
              activeOpacity={0.7}
            >
              <HighContrastCard variant="elevated" style={styles.gameCardContent}>
                <LargeText style={styles.gameIcon}>{game.icon}</LargeText>
                <LargeText size="md" weight="bold" align="center">
                  {game.title}
                </LargeText>
                <LargeText size="xs" align="center" color={colors.textSecondary}>
                  {game.desc}
                </LargeText>
              </HighContrastCard>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  quickAction: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / 2,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget.large,
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  gamesGrid: {
    gap: spacing.md,
  },
  gameCard: {
    marginBottom: spacing.sm,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  gameIcon: {
    fontSize: 40,
  },
});

export default HomeScreen;
