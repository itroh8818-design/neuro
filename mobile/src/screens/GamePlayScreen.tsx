/**
 * Game Play Screen
 * Renders the correct cognitive game based on gameType parameter
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GameEngine, GameChildProps } from '../games/GameEngine';
import { MemoryMatchGame } from '../games/MemoryMatch/MemoryMatchGame';
import { PatternRecognitionGame } from '../games/PatternRecognition/PatternRecognitionGame';
import { DailyRoutineRecallGame } from '../games/DailyRoutineRecall/DailyRoutineRecallGame';
import { ObjectRecognitionGame } from '../games/ObjectRecognition/ObjectRecognitionGame';
import { AttentionFocusGame } from '../games/AttentionFocus/AttentionFocusGame';
import { EmotionalEngagementGame } from '../games/EmotionalEngagement/EmotionalEngagementGame';
import { GameType, DifficultyLevel, GameSession } from '../models/types';
import { useAppStore } from '../store/useAppStore';
import { getCurrentDifficulty } from '../ai/DifficultyPredictor';

interface GamePlayScreenProps {
  route: {
    params: {
      gameType: GameType;
    };
  };
  navigation: any;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ route, navigation }) => {
  const { gameType } = route.params;
  const { currentUser } = useAppStore();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');

  useEffect(() => {
    loadDifficulty();
  }, [gameType]);

  const loadDifficulty = async () => {
    if (!currentUser) return;
    const level = await getCurrentDifficulty(currentUser.id, gameType);
    setDifficulty(level);
  };

  const handleGameComplete = (session: GameSession | null) => {
    if (!session) {
      // Back button pressed
      navigation.goBack();
      return;
    }
    // Game completed - engine shows results
  };

  const renderGame = (props: GameChildProps) => {
    const gameProps = {
      difficulty,
      onScore: props.onScore,
      addResponseTime: props.addResponseTime,
    };

    switch (gameType) {
      case 'memory_match':
        return <MemoryMatchGame {...gameProps} />;
      case 'pattern_recognition':
        return <PatternRecognitionGame {...gameProps} />;
      case 'daily_routine':
        return <DailyRoutineRecallGame {...gameProps} />;
      case 'object_recognition':
        return <ObjectRecognitionGame {...gameProps} />;
      case 'attention_focus':
        return <AttentionFocusGame {...gameProps} />;
      case 'emotional_engagement':
        return <EmotionalEngagementGame {...gameProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <GameEngine
        gameType={gameType}
        difficulty={difficulty}
        onGameComplete={handleGameComplete}
      >
        {(props) => renderGame(props)}
      </GameEngine>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GamePlayScreen;
