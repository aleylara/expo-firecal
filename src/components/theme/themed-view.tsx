import { View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colorScheme } = useTheme();
  const backgroundColor =
    lightColor && colorScheme === 'light'
      ? lightColor
      : darkColor && colorScheme === 'dark'
        ? darkColor
        : Colors[colorScheme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
