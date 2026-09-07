/**
 * Attention & Focus Game
 * Find the different item in a grid of similar items
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LargeText } from '../../components/ui/LargeText';
import { colors, spacing, borderRadius } from '../../config/theme';
import { DifficultyLevel } from '../../models/types';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Item sets for different difficulties
const ITEM_SETS: Record<DifficultyLevel, { normal: string; different: string }[]> = {
  easy: [
    { normal: '🔴', different: '🔵' },
    { normal: '🐱', different: '🐶' },
    { normal: '⭐', different: '🌟' },
    { normal: '🍎', different: '🍊' },
  ],
  medium: [
    { normal: '🌸', different: '🌺' },
    { normal: '🔵', different: '🟣' },
    { normal: '🎵', different: '🎶' },
    { normal: '🦁', different: '🐯' },
    { normal: '🟢', different: '🟡' },
  ],
  hard: [
    { normal: '😊', different: '😃' },
    { normal: '🔷', different: '🔹' },
    { normal: '🌿', different: '🍀' },
    { normal: '🎈', different: '🔴' },
    { normal: '◆', different: '◇' },
  ],
};

const GRID_SIZES: Record<DifficultyLevel, number> = {
  easy: 9,    // 3x3
  medium: 16, // 4x4
  hard: 25,   // 5x5
};

interface AttentionFocusGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

export const AttentionFocusGame: React.FC<AttentionFocusGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [roundIndex, setRoundIndex] = useState(0);
  const [grid, setGrid] = useState<{ id: string; emoji: string; isDifferent: boolean }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [message, setMessage] = useState('');

  const itemSets = ITEM_SETS[difficulty];
  const gridSize = GRID_SIZES[difficulty];
  const cols = Math.ceil(Math.sqrt(gridSize));
  const currentSet = itemSets[roundIndex % itemSets.length];

  // Generate grid
  useEffect(() => {
    const items: { id: string; emoji: string; isDifferent: boolean }[] = [];
    const differentIndex = Math.floor(Math.random() * gridSize);

    for (let i = 0; i < gridSize; i++) {
      items.push({
        id: `item_${i}`,
        emoji: i === differentIndex ? currentSet.different : currentSet.normal,
        isDifferent: i === differentIndex,
      });
    }

    setGrid(items);
    setStartTime(Date.now());
  }, [roundIndex, difficulty]);

  const handleItemPress = useCallback((itemId: string) => {
    if (selectedId) return;

    const responseTime = Date.now() - startTime;
    addResponseTime(responseTime);
    setSelectedId(itemId);

    const item = grid.find((i) => i.id === itemId);
    const correct = item?.isDifferent || false;
    setIsCorrect(correct);

    if (correct) {
      setMessage(t('attention.correctTap'));
      onScore(10);
    } else {
      setMessage(t('attention.wrongTap'));
      // Highlight the correct one
    }

    setTimeout(() => {
      setSelectedId(null);
      setIsCorrect(null);
      setMessage('');
      setRoundIndex((prev) => prev + 1);
    }, 1500);
  }, [grid, selectedId, startTime]);

  const itemSize = Math.floor(
    (SCREEN_WIDTH - spacing.lg * 4 - spacing.sm * (cols - 1)) / cols
  );

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('attention.title')}
      </LargeText>
      <LargeText size="md" align="center" style={styles.question}>
        {t('attention.findDifference')}
      </LargeText>
      <LargeText size="sm" align="center" style={styles.instruction}>
        {t('attention.tapTheDifferent')}
      </LargeText>

      {message ? (
        <LargeText
          size="md"
          weight="bold"
          align="center"
          style={{...styles.message, ...(isCorrect ? styles.correctMsg : styles.wrongMsg)}}
        >
          {message}
        </LargeText>
      ) : null}

      {/* Grid */}
      <View style={[styles.grid, { width: cols * (itemSize + spacing.sm) }]}>
        {grid.map((item) => {
          const isSelected = selectedId === item.id;
          const showHighlight = selectedId && item.isDifferent;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.gridItem,
                {
                  width: itemSize,
                  height: itemSize,
                  borderColor:
                    showHighlight
                      ? colors.correct
                      : isSelected && !isCorrect
                      ? colors.incorrect
                      : colors.overlayLight,
                  backgroundColor:
                    showHighlight
                      ? '#E8F5E9'
                      : isSelected && !isCorrect
                      ? '#FFEBEE'
                      : colors.surface,
                },
              ]}
              onPress={() => handleItemPress(item.id)}
              disabled={!!selectedId}
              activeOpacity={0.7}
            >
              <LargeText style={{ fontSize: itemSize * 0.5 }}>
                {item.emoji}
              </LargeText>
            </TouchableOpacity>
          );
        })}
      </View>

      <LargeText size="sm" align="center" style={styles.progressText}>
        {roundIndex + 1} / {itemSets.length * 3}
      </LargeText>
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
  question: {
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
  correctMsg: {
    color: colors.correct,
  },
  wrongMsg: {
    color: colors.incorrect,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  progressText: {
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});

export default AttentionFocusGame;
