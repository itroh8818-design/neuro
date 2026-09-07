/**
 * Elderly-friendly large button component
 * Minimum 60px touch target, high contrast, haptic feedback
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fonts, borderRadius, touchTarget, shadows } from '../../config/theme';

interface LargeButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  size?: 'medium' | 'large' | 'extraLarge';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LargeButton: React.FC<LargeButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      minHeight: size === 'extraLarge' ? touchTarget.large : touchTarget.recommended,
      paddingHorizontal: size === 'extraLarge' ? 32 : 24,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    };

    const variants: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.accent },
      accent: { backgroundColor: colors.accent },
      danger: { backgroundColor: colors.error },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: colors.primary,
      },
    };

    return {
      ...base,
      ...variants[variant],
      ...(fullWidth ? { width: '100%' } : {}),
      ...(disabled ? { opacity: 0.5 } : {}),
      ...shadows.md,
    };
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: fonts.semibold,
      color: variant === 'outline' ? colors.primary : colors.textLight,
    };

    const sizes: Record<string, TextStyle> = {
      medium: { fontSize: fonts.md },
      large: { fontSize: fonts.lg },
      extraLarge: { fontSize: fonts.xl },
    };

    return { ...base, ...sizes[size] };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.textLight}
        />
      ) : (
        <>
          {icon && (
            <Text style={{ fontSize: size === 'extraLarge' ? 28 : 24 }}>{icon}</Text>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default LargeButton;
