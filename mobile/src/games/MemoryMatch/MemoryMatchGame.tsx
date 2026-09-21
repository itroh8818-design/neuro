/**
 * Memory Match Game
 * Card flip matching game with NER cultural images
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

// Northeast India subjects represented with openly licensed Wikimedia Commons images.
const NER_CULTURAL_ITEMS = [
  {
    id: 'bihu',
    emoji: '💃',
    nameKey: 'bihu_dancer',
  },
  {
    id: 'rhino',
    emoji: '🦏',
    nameKey: 'one_horned_rhino',
  },
  {
    id: 'hornbill',
    emoji: '🦅',
    nameKey: 'hornbill_bird',
  },
  {
    id: 'instrument',
    emoji: '🥁',
    nameKey: 'traditional_drum',
  },
  {
    id: 'root_bridge',
    emoji: '🌉',
    nameKey: 'mountain',
  },
  {
    id: 'root_bridge_village',
    emoji: '🌊',
    nameKey: 'river',
  },
  {
    id: 'root_bridge_riwai',
    emoji: '🌿',
    nameKey: 'bamboo',
  },
  {
    id: 'assam_instrument',
    emoji: '🎶',
    nameKey: 'traditional_drum',
  },
];

interface Card {
  id: string;
  pairId: string;
  emoji: string;
  nameKey: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  difficulty: DifficultyLevel;
  onScore: (points: number) => void;
  addResponseTime: (ms: number) => void;
}

const GRID_SIZES: Record<DifficultyLevel, { cols: number; rows: number }> = {
  easy: { cols: 3, rows: 2 },   // 6 cards = 3 pairs
  medium: { cols: 4, rows: 3 }, // 12 cards = 6 pairs
  hard: { cols: 4, rows: 4 },   // 16 cards = 8 pairs
};

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  difficulty,
  onScore,
  addResponseTime,
}) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [lastFlipTime, setLastFlipTime] = useState(0);
  const [message, setMessage] = useState('');

  const grid = GRID_SIZES[difficulty];

  // Initialize cards
  useEffect(() => {
    const numPairs = (grid.cols * grid.rows) / 2;
    setTotalPairs(numPairs);

    const selectedItems = NER_CULTURAL_ITEMS.slice(0, numPairs);
    const cardPairs = selectedItems.flatMap((item) => [
      { ...item, pairId: item.id, isFlipped: false, isMatched: false, id: `${item.id}_1` },
      { ...item, pairId: item.id, isFlipped: false, isMatched: false, id: `${item.id}_2` },
    ]);

    // Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setCards(cardPairs);
  }, [difficulty]);

  const handleCardPress = useCallback((cardId: string) => {
    const now = Date.now();
    const card = cards.find((c) => c.id === cardId);

    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    // Record response time for first card flip
    if (flippedCards.length === 0) {
      setLastFlipTime(now);
    }

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      const responseTime = now - lastFlipTime;
      addResponseTime(responseTime);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard?.pairId === secondCard?.pairId) {
        // Match found!
        setMessage(t('memoryMatch.foundMatch'));
        setTimeout(() => setMessage(''), 1500);

        setCards((prev) =>
          prev.map((c) =>
            c.pairId === firstCard?.pairId ? { ...c, isMatched: true } : c
          )
        );
        setMatchedPairs((prev) => prev + 1);
        onScore(10);

        // Check win condition
        if (matchedPairs + 1 >= totalPairs) {
          // Bonus points for completing
          onScore(20);
        }
      } else {
        // No match - flip back
        setMessage(t('memoryMatch.noMatch'));
        setTimeout(() => setMessage(''), 1500);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
        }, 800);
      }

      setFlippedCards([]);
    }
  }, [cards, flippedCards, matchedPairs, totalPairs, lastFlipTime]);

  const cardSize = Math.floor((SCREEN_WIDTH - spacing.lg * 4) / grid.cols) - spacing.sm;

  return (
    <View style={styles.container}>
      <LargeText size="lg" weight="bold" align="center" style={styles.title}>
        {t('memoryMatch.title')}
      </LargeText>
      <LargeText size="sm" align="center" style={styles.subtitle}>
        {t('memoryMatch.tapToFlip')}
      </LargeText>

      {message ? (
        <LargeText size="md" align="center" style={styles.message}>
          {message}
        </LargeText>
      ) : null}

      <View
        style={[
          styles.grid,
          {
            width: grid.cols * (cardSize + spacing.sm),
          },
        ]}
      >
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            size={cardSize}
            onPress={() => handleCardPress(card.id)}
          />
        ))}
      </View>

      <LargeText size="sm" align="center" style={styles.pairsText}>
        {t('memoryMatch.matchPairs')} ({matchedPairs}/{totalPairs})
      </LargeText>
    </View>
  );
};

// Individual memory card component
interface MemoryCardProps {
  card: Card;
  size: number;
  onPress: () => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, size, onPress }) => {
  const flipAnim = React.useRef(new Animated.Value(0)).current;
  const isFaceVisible = card.isFlipped || card.isMatched;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFaceVisible ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [flipAnim, isFaceVisible]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={card.isFlipped || card.isMatched}
      activeOpacity={0.8}
      style={[styles.card, { width: size, height: size }]}
    >
      <Animated.View
        style={[
          styles.cardInner,
          {
            transform: [{ rotateY }],
            backgroundColor: card.isMatched
              ? colors.success
              : isFaceVisible
              ? colors.surface
              : colors.cardBack,
          },
        ]}
      >
        {isFaceVisible ? (
          <LargeText size="lg" style={styles.cardEmoji} accessibilityLabel={card.nameKey}>
            {card.emoji}
          </LargeText>
        ) : (
          <LargeText size="xl" weight="bold" style={{ color: colors.textLight }}>?</LargeText>
        )}
      </Animated.View>
    </TouchableOpacity>
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
    marginBottom: spacing.md,
  },
  message: {
    color: colors.success,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  cardEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  pairsText: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default MemoryMatchGame;
