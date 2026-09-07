/**
 * Object Recognition Game
 * Identify objects from images - NER-specific items
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

// NER-specific objects
const OBJECTS = {
  easy: [
    { id: '1', emoji: '🍵', name: 'Tea', nameLocal: 'চাহ', category: 'food' },
    { id: '2', emoji: '🍚', name: 'Rice', nameLocal: 'ভাত', category: 'food' },
    { id: '3', emoji: '🍎', name: 'Apple', nameLocal: 'পিঁপাৰল', category: 'food' },
    { id: '4', emoji: '🐕', name: 'Dog', nameLocal: 'কুকুৰ', category: 'animal' },
    { id: '5', emoji: '🐈', name: 'Cat', nameLocal: 'মেকুৰি', category: 'animal' },
    { id: '6', emoji: '🌸', name: 'Flower', nameLocal: 'ফুল', category: 'nature' },
    { id: '7', emoji: '🌳', name: 'Tree', nameLocal: 'গাছ', category: 'nature' },
    { id: '8', emoji: '🏠', name: 'House', nameLocal: 'ঘৰ', category: 'daily' },
  ],
  medium: [
    { id: '1', emoji: '🦏', name: 'One-horned Rhino', nameLocal: 'একশিংগা গেঁড়া', category: 'animal' },
    { id: '2', emoji: '🐘', name: 'Elephant', nameLocal: 'হাতিয়', category: 'animal' },
    { id: '3', emoji: '🎋', name: 'Bamboo', nameLocal: 'বাঁহ', category: 'nature' },
    { id: '4', emoji: '🪷', name: 'Lotus', nameLocal: 'পদ্ম', category: 'nature' },
    { id: '5', emoji: '🥁', name: 'Dhol', nameLocal: 'ধোল', category: 'daily' },
    { id: '6', emoji: '🎣', name: 'Fishing Rod', nameLocal: 'মাছ ধৰা কাঠ', category: 'daily' },
    { id: '7', emoji: '🌾', name: 'Paddy', nameLocal: 'ধান', category: 'food' },
    { id: '8', emoji: '🥭', name: 'Mango', nameLocal: 'আম', category: 'food' },
  ],
  hard: [
    { id: '1', emoji: '🎭', name: 'Bihu Costume', nameLocal: 'বিহু পোষাক', category: 'daily' },
    { id: '2', emoji: '🪈', name: 'Flute', nameLocal: 'বাঁসুলি', category: 'daily' },
    { id: '3', emoji: '🦅', name: 'Hornbill', nameLocal: 'ধৰলী চৰাই', category: 'animal' },
    { id: '4', emoji: '⛰️', name: 'Mountain', nameLocal: 'পাহাৰ', category: 'nature' },
    { id: '5', emoji: '🛶', name: 'Boat', nameLocal: 'নাওঁ', category: 'daily' },
    { id: '6', emoji: '🍌', name: 'Banana Leaf', nameLocal: 'কল পাত', category: 'nature' },
    { id: '7', emoji: '🫖', name: 'Tea Pot', nameLocal: 'চাহ কুটী', category: 'daily' },
    { id: '8', emoji: '🧵', name: 'Muga Silk', nameLocal: 'মূগা রেশম', category: 'daily' },
  ],
};

interface ObjectRecognitionGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

export const ObjectRecognitionGame: React.FC<ObjectRecognitionGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  const objects = OBJECTS[difficulty];
  const currentObject = objects[questionIndex % objects.length];

  // Generate 4 options including the correct one
  const options = React.useMemo(() => {
    const otherObjects = objects.filter((o) => o.id !== currentObject.id);
    const shuffled = otherObjects.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled.slice(0, 3);
    const allOptions = [currentObject, ...wrongOptions].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [questionIndex, difficulty]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [questionIndex]);

  const handleAnswer = useCallback((objectId: string) => {
    if (selectedAnswer) return;

    const responseTime = Date.now() - startTime;
    addResponseTime(responseTime);
    setSelectedAnswer(objectId);

    const correct = objectId === currentObject.id;
    setIsCorrect(correct);

    if (correct) {
      onScore(15);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestionIndex((prev) => prev + 1);
    }, 1500);
  }, [selectedAnswer, currentObject, startTime]);

  const optionSize = Math.min(120, (SCREEN_WIDTH - spacing.lg * 4 - spacing.md * 3) / 4);

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('objectRecognition.title')}
      </LargeText>

      {/* Main object display */}
      <View style={styles.objectDisplay}>
        <Animated.View
          style={[
            styles.objectCard,
            isCorrect === true && { borderColor: colors.correct, backgroundColor: '#E8F5E9' },
            isCorrect === false && { borderColor: colors.incorrect, backgroundColor: '#FFEBEE' },
          ]}
        >
          <LargeText style={styles.objectEmoji}>{currentObject.emoji}</LargeText>
          <LargeText size="xl" weight="bold" align="center">
            {t('objectRecognition.whatIsThis')}
          </LargeText>
        </Animated.View>
      </View>

      {/* Feedback message */}
      {isCorrect !== null && (
        <LargeText
          size="md"
          weight="bold"
          align="center"
          style={{...styles.message, ...(isCorrect ? styles.correctMsg : styles.wrongMsg)}}
        >
          {isCorrect ? t('objectRecognition.correctObject') : t('objectRecognition.wrongObject')}
        </LargeText>
      )}

      <LargeText size="sm" align="center" style={styles.selectPrompt}>
        {t('objectRecognition.selectObject')}
      </LargeText>

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              {
                width: optionSize,
                height: optionSize + 30,
                borderColor:
                  selectedAnswer === option.id
                    ? isCorrect
                      ? colors.correct
                      : colors.incorrect
                    : colors.overlayLight,
                backgroundColor:
                  selectedAnswer === option.id
                    ? isCorrect
                      ? '#E8F5E9'
                      : '#FFEBEE'
                    : colors.surface,
              },
            ]}
            onPress={() => handleAnswer(option.id)}
            disabled={!!selectedAnswer}
            activeOpacity={0.7}
          >
            <LargeText style={{ fontSize: optionSize * 0.3 }}>{option.emoji}</LargeText>
            <LargeText size="xs" align="center" style={styles.optionText}>
              {option.name}
            </LargeText>
          </TouchableOpacity>
        ))}
      </View>

      <LargeText size="sm" align="center" style={styles.progressText}>
        {questionIndex + 1} / {objects.length * 3}
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
    marginBottom: spacing.lg,
  },
  objectDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  objectCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.overlayLight,
    minWidth: 160,
    minHeight: 160,
    justifyContent: 'center',
  },
  objectEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
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
  selectPrompt: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.sm,
  },
  optionText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  progressText: {
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});

export default ObjectRecognitionGame;
