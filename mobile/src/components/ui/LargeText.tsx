/**
 * Elderly-friendly text component
 * Dynamic font sizing based on user preferences
 */
import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { colors, fonts } from '../../config/theme';
import { useAppStore } from '../../store/useAppStore';

interface LargeTextProps extends TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'hero';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const LargeText: React.FC<LargeTextProps> = ({
  children,
  size = 'md',
  weight = 'regular',
  color,
  align,
  style,
  ...props
}) => {
  const { highContrast, fontSize: userFontSize } = useAppStore();

  // Font size multiplier based on user preference
  const sizeMultiplier: Record<string, number> = {
    small: 0.85,
    medium: 1.0,
    large: 1.15,
    extraLarge: 1.3,
  };

  const baseFontSize = fonts[size] || fonts.md;
  const adjustedFontSize = Math.round(baseFontSize * (sizeMultiplier[userFontSize] || 1.0));

  const textColor = color || (highContrast ? colors.textPrimary : colors.textPrimary);

  return (
    <Text
      style={[
        {
          fontSize: adjustedFontSize,
          fontWeight: fonts[weight],
          color: textColor,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default LargeText;
