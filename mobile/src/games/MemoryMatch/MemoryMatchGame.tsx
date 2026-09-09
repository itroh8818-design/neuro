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
  Image,
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
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Bihu_Dance-This_photo_crosses_28000_Views.jpg/500px-Bihu_Dance-This_photo_crosses_28000_Views.jpg',
    nameKey: 'bihu_dancer',
  },
  {
    id: 'rhino',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_02.jpg/500px-Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_02.jpg',
    nameKey: 'one_horned_rhino',
  },
  {
    id: 'hornbill',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Handicraft_of_Nagaland%E2%80%99s_Hornbill_Festival_2019.jpg/500px-Handicraft_of_Nagaland%E2%80%99s_Hornbill_Festival_2019.jpg',
    nameKey: 'hornbill_bird',
  },
  {
    id: 'instrument',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Lahori_Gogona%28Musical_Instruments_of_Assam%29.jpg/500px-Lahori_Gogona%28Musical_Instruments_of_Assam%29.jpg',
    nameKey: 'traditional_drum',
  },
  {
    id: 'root_bridge',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Living_Root_Bridge%2C_Meghalaya%2C_India.jpg/500px-Living_Root_Bridge%2C_Meghalaya%2C_India.jpg',
    nameKey: 'mountain',
  },
  {
    id: 'root_bridge_village',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7387.jpg/500px-Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7387.jpg',
    nameKey: 'river',
  },
  {
    id: 'root_bridge_riwai',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Single_Decker_Living_Root_Bridge_at_Riwai.jpg/500px-Single_Decker_Living_Root_Bridge_at_Riwai.jpg',
    nameKey: 'bamboo',
  },
  {
    id: 'assam_instrument',
    imageUri: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/%E0%A6%9F%E0%A6%95%E0%A6%BE_%E0%A6%AC%E0%A6%BE%E0%A6%A6%E0%A7%8D%E0%A6%AF.JPG/500px-%E0%A6%9F%E0%A6%95%E0%A6%BE_%E0%A6%AC%E0%A6%BE%E0%A6%A6%E0%A7%8D%E0%A6%AF.JPG',
    nameKey: 'traditional_drum',
  },
];

interface Card {
  id: string;
  pairId: string;
  imageUri: string;
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
  const [showFront, setShowFront] = useState(card.isFlipped || card.isMatched);

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: card.isFlipped || card.isMatched ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (card.isFlipped || card.isMatched) {
      setShowFront(true);
    } else {
      setTimeout(() => setShowFront(false), 200);
    }
  }, [card.isFlipped, card.isMatched]);

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
              : card.isFlipped || showFront
              ? colors.surface
              : colors.cardBack,
          },
        ]}
      >
        {(card.isFlipped || card.isMatched || showFront) && (
          <Image
            source={{ uri: card.imageUri }}
            style={[styles.cardImage, { width: size, height: size }]}
            resizeMode="cover"
            accessibilityLabel={card.nameKey}
          />
        )}
        {!card.isFlipped && !card.isMatched && !showFront && (
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
  cardImage: {
    borderRadius: borderRadius.md,
  },
  pairsText: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default MemoryMatchGame;
