/**
 * High contrast card component for elderly users
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../config/theme';
import { useAppStore } from '../../store/useAppStore';

interface HighContrastCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const HighContrastCard: React.FC<HighContrastCardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const { highContrast } = useAppStore();

  const cardStyle: ViewStyle = {
    backgroundColor: highContrast ? '#FFFFFF' : colors.surface,
    borderRadius: borderRadius.lg,
    padding: padding === 'sm' ? spacing.sm : padding === 'md' ? spacing.lg : spacing.xl,
    ...(variant === 'elevated' ? shadows.lg : variant === 'outlined' ? shadows.sm : shadows.md),
    ...(variant === 'outlined' ? {
      borderWidth: highContrast ? 3 : 2,
      borderColor: highContrast ? colors.textPrimary : colors.primary,
    } : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

export default HighContrastCard;
