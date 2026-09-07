/**
 * Emotional Engagement Game
 * Match emotions to faces and scenarios
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
import { DifficultyLevel, EmotionalPair } from '../../models/types';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Emotional scenarios with NER cultural context
const EMOTION_SETS: Record<DifficultyLevel, EmotionalPair[]> = {
  easy: [
    { id: '1', face: '😊', scenario: 'Happy face', emotion: 'Happy', emotionLocal: 'সুখী' },
    { id: '2', face: '😢', scenario: 'Sad face', emotion: 'Sad', emotionLocal: 'দুঃখী' },
    { id: '3', face: '😠', scenario: 'Angry face', emotion: 'Angry', emotionLocal: 'ৰাগী' },
    { id: '4', face: '😨', scenario: 'Scared face', emotion: 'Scared', emotionLocal: 'ভয় পোৱা' },
    { id: '5', face: '😴', scenario: 'Sleepy face', emotion: 'Sleepy', emotionLocal: 'নিদ্রালু' },
    { id: '6', face: '🥰', scenario: 'Loving face', emotion: 'Loving', emotionLocal: 'ভালপোৱা' },
  ],
  medium: [
    { id: '1', face: '😊', scenario: 'During Bihu dance celebration', emotion: 'Happy', emotionLocal: 'সুখী' },
    { id: '2', face: '😢', scenario: 'Missing family far away', emotion: 'Sad', emotionLocal: 'দুঃখী' },
    { id: '3', face: '😠', scenario: 'When someone is unfair', emotion: 'Angry', emotionLocal: 'ৰাগী' },
    { id: '4', face: '😨', scenario: 'During a thunderstorm', emotion: 'Scared', emotionLocal: 'ভয় পোৱা' },
    { id: '5', face: '😴', scenario: 'After a long day of work', emotion: 'Sleepy', emotionLocal: 'নিদ্রালু' },
    { id: '6', face: '🥰', scenario: 'Seeing grandchildren', emotion: 'Loving', emotionLocal: 'ভালপোৱা' },
    { id: '7', face: '😲', scenario: 'Seeing the Hornbill festival', emotion: 'Surprised', emotionLocal: 'আশ্চৰ্য' },
    { id: '8', face: '😌', scenario: 'Sitting by the Brahmaputra', emotion: 'Peaceful', emotionLocal: 'শান্ত' },
  ],
  hard: [
    { id: '1', face: '😊', scenario: 'Bihu festival morning with family', emotion: 'Happy', emotionLocal: 'সুখী' },
    { id: '2', face: '😢', scenario: 'Grandchildren moving to city', emotion: 'Sad', emotionLocal: 'দুঃখী' },
    { id: '3', face: '😠', scenario: 'When help doesn\'t come on time', emotion: 'Angry', emotionLocal: 'ৰাগী' },
    { id: '4', face: '😨', scenario: 'Hearing strange sounds at night', emotion: 'Scared', emotionLocal: 'ভয় পোৱা' },
    { id: '5', face: '😴', scenario: 'After eating a heavy meal', emotion: 'Sleepy', emotionLocal: 'নিদ্রালু' },
    { id: '6', face: '🥰', scenario: 'Grandchild brings flowers', emotion: 'Loving', emotionLocal: 'ভালপোৱা' },
    { id: '7', face: '😲', scenario: 'Unexpected visit from old friend', emotion: 'Surprised', emotionLocal: 'আশ্চৰ্য' },
    { id: '8', face: '😌', scenario: 'Listening to old Assamese songs', emotion: 'Peaceful', emotionLocal: 'শান্ত' },
    { id: '9', face: '🤔', scenario: 'Trying to remember a name', emotion: 'Confused', emotionLocal: 'বিভ্ৰান্ত' },
    { id: '10', face: '😅', scenario: 'Doing something embarrassing', emotion: 'Embarrassed', emotionLocal: 'লজ্জিত' },
  ],
};

const EMOTION_OPTIONS: Record<DifficultyLevel, string[]> = {
  easy: ['Happy', 'Sad', 'Angry', 'Scared', 'Sleepy', 'Loving'],
  medium: ['Happy', 'Sad', 'Angry', 'Scared', 'Sleepy', 'Loving', 'Surprised', 'Peaceful'],
  hard: ['Happy', 'Sad', 'Angry', 'Scared', 'Sleepy', 'Loving', 'Surprised', 'Peaceful', 'Confused', 'Embarrassed'],
};

interface EmotionalEngagementGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

export const EmotionalEngagementGame: React.FC<EmotionalEngagementGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [message, setMessage] = useState('');

  const emotionSet = EMOTION_SETS[difficulty];
  const currentEmotion = emotionSet[questionIndex % emotionSet.length];
  const allOptions = EMOTION_OPTIONS[difficulty];

  // Show 4 options including correct one
  const options = React.useMemo(() => {
    const wrongOptions = allOptions.filter((o) => o !== currentEmotion.emotion);
    const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return [currentEmotion.emotion, ...selected].sort(() => Math.random() - 0.5);
  }, [questionIndex, difficulty]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [questionIndex]);

  const handleAnswer = useCallback((emotion: string) => {
    if (selectedAnswer) return;

    const responseTime = Date.now() - startTime;
    addResponseTime(responseTime);
    setSelectedAnswer(emotion);

    const correct = emotion === currentEmotion.emotion;
    setIsCorrect(correct);

    if (correct) {
      setMessage(t('emotional.correctEmotion'));
      onScore(15);
    } else {
      setMessage(t('emotional.wrongEmotion'));
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setMessage('');
      setQuestionIndex((prev) => prev + 1);
    }, 2000);
  }, [selectedAnswer, currentEmotion, startTime]);

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('emotional.title')}
      </LargeText>
      <LargeText size="md" align="center" style={styles.question}>
        {t('emotional.howDoTheyFeel')}
      </LargeText>

      {/* Face display */}
      <View style={styles.faceContainer}>
        <Animated.View
          style={[
            styles.faceCard,
            isCorrect === true && { borderColor: colors.correct, backgroundColor: '#E8F5E9' },
            isCorrect === false && { borderColor: colors.incorrect, backgroundColor: '#FFEBEE' },
          ]}
        >
          <LargeText style={styles.faceEmoji}>{currentEmotion.face}</LargeText>
          <LargeText size="md" align="center" style={styles.scenario}>
            {currentEmotion.scenario}
          </LargeText>
        </Animated.View>
      </View>

      {/* Feedback message */}
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

      <LargeText size="sm" align="center" style={styles.selectPrompt}>
        {t('emotional.matchEmotion')}
      </LargeText>

      {/* Emotion options */}
      <View style={styles.optionsContainer}>
        {options.map((emotion) => (
          <TouchableOpacity
            key={emotion}
            style={[
              styles.optionButton,
              {
                borderColor:
                  selectedAnswer === emotion
                    ? isCorrect
                      ? colors.correct
                      : colors.incorrect
                    : colors.overlayLight,
                backgroundColor:
                  selectedAnswer === emotion
                    ? isCorrect
                      ? '#E8F5E9'
                      : '#FFEBEE'
                    : colors.surface,
              },
            ]}
            onPress={() => handleAnswer(emotion)}
            disabled={!!selectedAnswer}
            activeOpacity={0.7}
          >
            <LargeText size="md" weight="medium" align="center">
              {emotion}
            </LargeText>
          </TouchableOpacity>
        ))}
      </View>

      <LargeText size="sm" align="center" style={styles.progressText}>
        {questionIndex + 1} / {emotionSet.length * 2}
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
  faceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  faceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.overlayLight,
    minWidth: 200,
  },
  faceEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  scenario: {
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    minWidth: 100,
    alignItems: 'center',
  },
  progressText: {
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});

export default EmotionalEngagementGame;
