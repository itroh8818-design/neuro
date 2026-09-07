/**
 * Pattern Recognition Game
 * Complete the pattern sequence with shapes and colors
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
import { DifficultyLevel, PatternElement } from '../../models/types';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Pattern elements with NER cultural shapes
const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
const PATTERNS: Record<DifficultyLevel, PatternElement[][]> = {
  easy: [
    [
      { id: '1', shape: '🔴', color: 'red', size: 1 },
      { id: '2', shape: '🔵', color: 'blue', size: 1 },
      { id: '3', shape: '🔴', color: 'red', size: 1 },
      { id: '4', shape: '🔵', color: 'blue', size: 1 },
    ],
    [
      { id: '1', shape: '🟢', color: 'green', size: 1 },
      { id: '2', shape: '🟢', color: 'green', size: 1 },
      { id: '3', shape: '🟡', color: 'yellow', size: 1 },
      { id: '4', shape: '🟢', color: 'green', size: 1 },
    ],
    [
      { id: '1', shape: '🟡', color: 'yellow', size: 1 },
      { id: '2', shape: '🟣', color: 'purple', size: 1 },
      { id: '3', shape: '🟡', color: 'yellow', size: 1 },
      { id: '4', shape: '🟣', color: 'purple', size: 1 },
    ],
  ],
  medium: [
    [
      { id: '1', shape: '🔴', color: 'red', size: 1 },
      { id: '2', shape: '🔵', color: 'blue', size: 1 },
      { id: '3', shape: '🟢', color: 'green', size: 1 },
      { id: '4', shape: '🔴', color: 'red', size: 1 },
      { id: '5', shape: '🔵', color: 'blue', size: 1 },
    ],
    [
      { id: '1', shape: '🟡', color: 'yellow', size: 1 },
      { id: '2', shape: '🟠', color: 'orange', size: 1 },
      { id: '3', shape: '🟠', color: 'orange', size: 1 },
      { id: '4', shape: '🟡', color: 'yellow', size: 1 },
      { id: '5', shape: '🟠', color: 'orange', size: 1 },
    ],
  ],
  hard: [
    [
      { id: '1', shape: '🔴', color: 'red', size: 1 },
      { id: '2', shape: '🔵', color: 'blue', size: 2 },
      { id: '3', shape: '🟢', color: 'green', size: 1 },
      { id: '4', shape: '🔵', color: 'blue', size: 2 },
      { id: '5', shape: '🟢', color: 'green', size: 1 },
    ],
    [
      { id: '1', shape: '🟡', color: 'yellow', size: 1 },
      { id: '2', shape: '🟣', color: 'purple', size: 2 },
      { id: '3', shape: '🟠', color: 'orange', size: 3 },
      { id: '4', shape: '🟣', color: 'purple', size: 2 },
      { id: '5', shape: '🟡', color: 'yellow', size: 1 },
    ],
  ],
};

// Answer options per difficulty
const ANSWERS: Record<DifficultyLevel, PatternElement[]> = {
  easy: [
    { id: 'a1', shape: '🔴', color: 'red', size: 1 },
    { id: 'a2', shape: '🔵', color: 'blue', size: 1 },
    { id: 'a3', shape: '🟢', color: 'green', size: 1 },
  ],
  medium: [
    { id: 'a1', shape: '🟢', color: 'green', size: 1 },
    { id: 'a2', shape: '🔴', color: 'red', size: 1 },
    { id: 'a3', shape: '🟡', color: 'yellow', size: 1 },
    { id: 'a4', shape: '🟠', color: 'orange', size: 1 },
  ],
  hard: [
    { id: 'a1', shape: '🟢', color: 'green', size: 1 },
    { id: 'a2', shape: '🔴', color: 'red', size: 2 },
    { id: 'a3', shape: '🔵', color: 'blue', size: 1 },
    { id: 'a4', shape: '🟣', color: 'purple', size: 1 },
  ],
};

interface PatternRecognitionGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  const patterns = PATTERNS[difficulty];
  const currentPattern = patterns[currentPatternIndex % patterns.length];
  const correctAnswer = currentPattern[currentPattern.length - 1];
  const sequenceElements = currentPattern.slice(0, -1);

  // Reset timer for each new question
  useEffect(() => {
    setStartTime(Date.now());
  }, [currentPatternIndex]);

  const handleAnswerSelect = useCallback((answer: PatternElement) => {
    if (selectedAnswer) return;

    const responseTime = Date.now() - startTime;
    addResponseTime(responseTime);
    setSelectedAnswer(answer.id);

    const correct = answer.id === correctAnswer.id;
    setIsCorrect(correct);

    if (correct) {
      onScore(15);
    }

    // Move to next pattern after delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentPatternIndex((prev) => prev + 1);
    }, 1500);
  }, [selectedAnswer, correctAnswer, startTime]);

  const elementSize = Math.min(60, (SCREEN_WIDTH - spacing.lg * 4) / 5 - spacing.sm);

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('pattern.title')}
      </LargeText>
      <LargeText size="md" align="center" style={styles.question}>
        {t('pattern.whatComesNext')}
      </LargeText>

      {/* Pattern sequence */}
      <View style={styles.sequenceContainer}>
        {sequenceElements.map((element, index) => (
          <React.Fragment key={element.id}>
            <View style={[styles.element, { width: elementSize, height: elementSize }]}>
              <LargeText style={{ fontSize: elementSize * 0.6 }}>
                {element.shape}
              </LargeText>
            </View>
            {index < sequenceElements.length - 1 && (
              <LargeText size="lg" style={styles.arrow}>→</LargeText>
            )}
          </React.Fragment>
        ))}
        <LargeText size="lg" style={styles.arrow}>→</LargeText>
        <View style={[styles.element, styles.questionElement, { width: elementSize, height: elementSize }]}>
          <LargeText size="lg" style={{ color: colors.textSecondary }}>❓</LargeText>
        </View>
      </View>

      {/* Message */}
      {isCorrect !== null && (
        <LargeText
          size="md"
          weight="bold"
          align="center"
          style={{...styles.message, ...(isCorrect ? styles.correctMessage : styles.wrongMessage)}}
        >
          {isCorrect ? t('pattern.correctPattern') : t('pattern.wrongPattern')}
        </LargeText>
      )}

      {/* Answer options */}
      <LargeText size="sm" align="center" style={styles.selectPrompt}>
        {t('pattern.selectAnswer')}
      </LargeText>

      <View style={styles.answersContainer}>
        {ANSWERS[difficulty].map((answer) => (
          <TouchableOpacity
            key={answer.id}
            style={[
              styles.answerButton,
              {
                width: elementSize + 20,
                height: elementSize + 20,
                borderColor:
                  selectedAnswer === answer.id
                    ? isCorrect
                      ? colors.correct
                      : colors.incorrect
                    : colors.overlayLight,
                backgroundColor:
                  selectedAnswer === answer.id
                    ? isCorrect
                      ? '#E8F5E9'
                      : '#FFEBEE'
                    : colors.surface,
              },
            ]}
            onPress={() => handleAnswerSelect(answer)}
            disabled={!!selectedAnswer}
            activeOpacity={0.7}
          >
            <LargeText style={{ fontSize: elementSize * 0.5 }}>
              {answer.shape}
            </LargeText>
          </TouchableOpacity>
        ))}
      </View>

      <LargeText size="sm" align="center" style={styles.progressText}>
        {currentPatternIndex + 1} / {patterns.length * 3}
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
    marginBottom: spacing.xl,
  },
  sequenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  element: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.overlayLight,
  },
  questionElement: {
    borderStyle: 'dashed',
  },
  arrow: {
    color: colors.textSecondary,
  },
  message: {
    marginBottom: spacing.lg,
  },
  correctMessage: {
    color: colors.correct,
  },
  wrongMessage: {
    color: colors.incorrect,
  },
  selectPrompt: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  answersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  answerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 3,
  },
  progressText: {
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});

export default PatternRecognitionGame;
