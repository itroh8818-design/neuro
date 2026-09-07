/**
 * Daily Routine Recall Game
 * Order daily activities correctly - NER-specific routines
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LargeText } from '../../components/ui/LargeText';
import { colors, spacing, borderRadius } from '../../config/theme';
import { DifficultyLevel, RoutineActivity } from '../../models/types';
import { useTranslation } from 'react-i18next';
import { generateId } from '../../services/encryption';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// NER-specific daily routines
const DAILY_ROUTINES: Record<DifficultyLevel, RoutineActivity[][]> = {
  easy: [
    [
      { id: '1', nameKey: 'Wake up', icon: '🌅', correctOrder: 0, currentOrder: 0 },
      { id: '2', nameKey: 'Brush teeth', icon: '🪥', correctOrder: 1, currentOrder: 1 },
      { id: '3', nameKey: 'Have breakfast', icon: '🍵', correctOrder: 2, currentOrder: 2 },
    ],
    [
      { id: '1', nameKey: 'Drink water', icon: '💧', correctOrder: 0, currentOrder: 0 },
      { id: '2', nameKey: 'Take medicine', icon: '💊', correctOrder: 1, currentOrder: 1 },
      { id: '3', nameKey: 'Rest', icon: '😴', correctOrder: 2, currentOrder: 2 },
    ],
  ],
  medium: [
    [
      { id: '1', nameKey: 'Wake up', icon: '🌅', correctOrder: 0, currentOrder: 0 },
      { id: '2', nameKey: 'Morning prayer', icon: '🙏', correctOrder: 1, currentOrder: 1 },
      { id: '3', nameKey: 'Brush teeth', icon: '🪥', correctOrder: 2, currentOrder: 2 },
      { id: '4', nameKey: 'Have breakfast', icon: '🍵', correctOrder: 3, currentOrder: 3 },
      { id: '5', nameKey: 'Take medicine', icon: '💊', correctOrder: 4, currentOrder: 4 },
    ],
    [
      { id: '1', nameKey: 'Morning walk', icon: '🚶', correctOrder: 0, currentOrder: 0 },
      { id: '2', nameKey: 'Exercise', icon: '🧘', correctOrder: 1, currentOrder: 1 },
      { id: '3', nameKey: 'Bath', icon: '🚿', correctOrder: 2, currentOrder: 2 },
      { id: '4', nameKey: 'Get dressed', icon: '👔', correctOrder: 3, currentOrder: 3 },
      { id: '5', nameKey: 'Go outside', icon: '🚶', correctOrder: 4, currentOrder: 4 },
    ],
  ],
  hard: [
    [
      { id: '1', nameKey: 'Wake up', icon: '🌅', correctOrder: 0, currentOrder: 0 },
      { id: '2', nameKey: 'Morning prayer', icon: '🙏', correctOrder: 1, currentOrder: 1 },
      { id: '3', nameKey: 'Brush teeth', icon: '🪥', correctOrder: 2, currentOrder: 2 },
      { id: '4', nameKey: 'Bath', icon: '🚿', correctOrder: 3, currentOrder: 3 },
      { id: '5', nameKey: 'Get dressed', icon: '👔', correctOrder: 4, currentOrder: 4 },
      { id: '6', nameKey: 'Have breakfast', icon: '🍵', correctOrder: 5, currentOrder: 5 },
      { id: '7', nameKey: 'Take medicine', icon: '💊', correctOrder: 6, currentOrder: 6 },
    ],
  ],
};

interface DailyRoutineRecallGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

export const DailyRoutineRecallGame: React.FC<DailyRoutineRecallGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [routineIndex, setRoutineIndex] = useState(0);
  const [activities, setActivities] = useState<RoutineActivity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [message, setMessage] = useState('');

  const routines = DAILY_ROUTINES[difficulty];

  // Initialize and shuffle activities
  useEffect(() => {
    const routine = routines[routineIndex % routines.length];
    const shuffled = [...routine]
      .map((a) => ({ ...a, currentOrder: 0 }))
      .sort(() => Math.random() - 0.5)
      .map((a, i) => ({ ...a, currentOrder: i }));
    setActivities(shuffled);
    setStartTime(Date.now());
  }, [routineIndex, difficulty]);

  const handleActivityPress = useCallback((activityId: string) => {
    if (isCorrect !== null) return;

    const now = Date.now();
    addResponseTime(now - startTime);

    // Swap positions if two are selected
    if (selectedId && selectedId !== activityId) {
      setActivities((prev) => {
        const newActivities = [...prev];
        const firstIndex = newActivities.findIndex((a) => a.id === selectedId);
        const secondIndex = newActivities.findIndex((a) => a.id === activityId);

        // Swap
        const temp = { ...newActivities[firstIndex] };
        newActivities[firstIndex] = {
          ...newActivities[secondIndex],
          currentOrder: firstIndex,
        };
        newActivities[secondIndex] = {
          ...temp,
          currentOrder: secondIndex,
        };

        return newActivities;
      });
      setSelectedId(null);
    } else {
      setSelectedId(activityId);
    }
  }, [selectedId, isCorrect, startTime]);

  const checkOrder = useCallback(() => {
    const isOrderedCorrectly = activities.every(
      (a, index) => a.correctOrder === index
    );

    setIsCorrect(isOrderedCorrectly);

    if (isOrderedCorrectly) {
      setMessage(t('dailyRoutine.correctOrder'));
      onScore(20);
    } else {
      setMessage(t('dailyRoutine.wrongOrder'));
    }

    setTimeout(() => {
      setSelectedId(null);
      setIsCorrect(null);
      setMessage('');
      if (isOrderedCorrectly) {
        setRoutineIndex((prev) => prev + 1);
      }
    }, 2000);
  }, [activities, onScore]);

  const itemHeight = 70;
  const itemWidth = Math.min(SCREEN_WIDTH - spacing.lg * 4, 400);

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('dailyRoutine.title')}
      </LargeText>
      <LargeText size="md" align="center" style={styles.subtitle}>
        {t('dailyRoutine.orderActivities')}
      </LargeText>
      <LargeText size="sm" align="center" style={styles.instruction}>
        {t('dailyRoutine.dragToReorder')}
      </LargeText>

      {message ? (
        <LargeText
          size="md"
          weight="bold"
          align="center"
          style={{...styles.message, ...(isCorrect ? styles.correct : styles.wrong)}}
        >
          {message}
        </LargeText>
      ) : null}

      <ScrollView
        style={styles.activitiesList}
        contentContainerStyle={styles.activitiesContent}
      >
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityItem,
              {
                width: itemWidth,
                height: itemHeight,
                backgroundColor:
                  selectedId === activity.id
                    ? '#E3F2FD'
                    : isCorrect !== null && !isCorrect
                    ? activity.correctOrder === index
                      ? '#E8F5E9'
                      : '#FFEBEE'
                    : colors.surface,
                borderColor:
                  selectedId === activity.id
                    ? colors.primary
                    : isCorrect !== null && !isCorrect
                    ? activity.correctOrder === index
                      ? colors.correct
                      : colors.incorrect
                    : colors.overlayLight,
              },
            ]}
            onPress={() => handleActivityPress(activity.id)}
            activeOpacity={0.7}
          >
            <View style={styles.activityNumber}>
              <LargeText size="md" weight="bold" color={colors.textLight}>
                {index + 1}
              </LargeText>
            </View>
            <LargeText style={styles.activityIcon}>{activity.icon}</LargeText>
            <LargeText size="md" weight="medium" style={styles.activityName}>
              {t(`dailyRoutine.${activity.nameKey}`, activity.nameKey)}
            </LargeText>
            {selectedId === activity.id && (
              <LargeText size="sm" style={styles.swapIndicator}>⇄</LargeText>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.checkButton}
        onPress={checkOrder}
        disabled={isCorrect !== null}
        activeOpacity={0.7}
      >
        <LargeText size="lg" weight="bold" color={colors.textLight}>
          ✅ {t('common.confirm')}
        </LargeText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  instruction: {
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  message: {
    marginBottom: spacing.md,
  },
  correct: {
    color: colors.correct,
  },
  wrong: {
    color: colors.incorrect,
  },
  activitiesList: {
    width: '100%',
    maxHeight: 400,
  },
  activitiesContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  activityNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 28,
  },
  activityName: {
    flex: 1,
  },
  swapIndicator: {
    fontSize: 20,
    color: colors.primary,
  },
  checkButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },
});

export default DailyRoutineRecallGame;
