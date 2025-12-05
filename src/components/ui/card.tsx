import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  elevated?: boolean;
}

export function Card({ children, padding, elevated = false }: CardProps) {
  const { common, tokens } = useThemedStyles();

  const cardStyle = elevated ? common.cardElevated : common.card;
  const paddingStyle = padding ? { padding } : { padding: tokens.space.lg };

  return <View style={[cardStyle, paddingStyle]}>{children}</View>;
}
