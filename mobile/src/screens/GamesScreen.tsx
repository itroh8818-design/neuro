/**
 * Games Screen
 * Game selection with all 6 cognitive games
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius, touchTarget } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { getCurrentDifficulty } from '../ai/DifficultyPredictor';
import { GameType } from '../models/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GamesScreenProps {
  navigation: any;
}

const GAMES = [
  {
    id: 'memory_match' as GameType,
    icon: '🧠',
    titleKey: 'games.memoryMatch',
    descKey: 'games.memoryMatchDesc',
    color: '#4CAF50',
  },
  {
    id: 'pattern_recognition' as GameType,
    icon: '🔍',
    titleKey: 'games.patternRecognition',
    descKey: 'games.patternRecognitionDesc',
    color: '#2196F3',
  },
  {
    id: 'daily_routine' as GameType,
    icon: '📅',
    titleKey: 'games.dailyRoutine',
    descKey: 'games.dailyRoutineDesc',
    color: '#FF9800',
  },
  {
    id: 'object_recognition' as GameType,
    icon: '👁️',
    titleKey: 'games.objectRecognition',
    descKey: 'games.objectRecognitionDesc',
    color: '#9C27B0',
  },
  {
    id: 'attention_focus' as GameType,
    icon: '🎯',
    titleKey: 'games.attentionFocus',
    descKey: 'games.attentionFocusDesc',
    color: '#F44336',
  },
  {
    id: 'emotional_engagement' as GameType,
    icon: '❤️',
    titleKey: 'games.emotionalEngagement',
    descKey: 'games.emotionalEngagementDesc',
    color: '#E91E63',
  },
];

export const GamesScreen: React.FC<GamesScreenProps> = ({ navigation }) => {
  const { currentUser } = useAppStore();
  const { t } = useTranslation();
  const [difficulties, setDifficulties] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDifficulties();
  }, []);

  const loadDifficulties = async () => {
    if (!currentUser) return;

    const diffs: Record<string, string> = {};
    for (const game of GAMES) {
      const level = await getCurrentDifficulty(currentUser.id, game.id);
      diffs[game.id] = level;
    }
    setDifficulties(diffs);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return colors.success;
      case 'medium': return colors.accent;
      case 'hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LargeText size="xxl" weight="bold" style={styles.header}>
        🎮 {t('games.title')}
      </LargeText>
      <LargeText size="md" color={colors.textSecondary} style={styles.subtitle}>
        {t('games.memoryMatchDesc')}
      </LargeText>

      <View style={styles.gamesList}>
        {GAMES.map((game) => {
          const difficulty = difficulties[game.id] || 'easy';
          return (
            <TouchableOpacity
              key={game.id}
              onPress={() => navigation.navigate('GamePlay', { gameType: game.id })}
              activeOpacity={0.7}
            >
              <HighContrastCard variant="elevated" style={styles.gameCard}>
                <View style={[styles.iconContainer, { backgroundColor: game.color + '20' }]}>
                  <LargeText style={styles.gameIcon}>{game.icon}</LargeText>
                </View>

                <View style={styles.gameInfo}>
                  <LargeText size="lg" weight="bold">
                    {t(game.titleKey)}
                  </LargeText>
                  <LargeText size="sm" color={colors.textSecondary}>
                    {t(game.descKey)}
                  </LargeText>
                </View>

                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(difficulty) + '20' }]}>
                  <LargeText
                    size="xs"
                    weight="bold"
                    style={{ color: getDifficultyColor(difficulty) }}
                  >
                    {t(`games.difficulty.${difficulty}`)}
                  </LargeText>
                </View>
              </HighContrastCard>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  gamesList: {
    gap: spacing.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIcon: {
    fontSize: 32,
  },
  gameInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
});

export default GamesScreen;
