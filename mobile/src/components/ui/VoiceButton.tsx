/**
 * Voice interaction button - large, accessible microphone button
 */
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors, borderRadius, touchTarget, shadows } from '../../config/theme';

interface VoiceButtonProps {
  onPress: () => void;
  isListening?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onPress,
  isListening = false,
  size = touchTarget.large,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isListening ? colors.error : colors.primary,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, { fontSize: size * 0.4 }]}>
        {isListening ? '🎙️' : '🎤'}
      </Text>
      {isListening && <Text style={styles.listeningText}>...</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  icon: {
    color: colors.textLight,
  },
  listeningText: {
    color: colors.textLight,
    fontSize: 16,
    marginTop: 4,
  },
});

export default VoiceButton;
