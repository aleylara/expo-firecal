import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useTheme } from '@/contexts/theme-context';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { toRad } from 'react-native-redash';

// @ts-ignore
export const transformOrigin = ({ x, y }, ...transformations) => {
  'worklet';
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface HandleProps extends BottomSheetHandleProps {
  style?: ViewStyle;
  onPress?: () => void;
}

const CustomBottomSheetHandle: React.FC<HandleProps> = ({
  style,
  animatedIndex,
  onPress,
}) => {
  const { colors, tokens, platoonColors } = useThemedStyles();
  const { userGroup } = useTheme();
  const platoonColor = platoonColors[userGroup.group];

  //#region animations
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], 'clamp'),
  );

  //#endregion

  //#region styles
  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.border,
        borderTopLeftRadius: tokens.radius.xl,
        borderTopRightRadius: tokens.radius.xl,
      },
      style,
    ],
    [style, colors.surface, colors.border, tokens.radius.xl],
  );

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // We are now setting static border radius in containerStyle
    // keeping this empty or removing it if no longer needed for other anims
    return {};
  });

  // Traditional handle bar (visible in middle phase)
  const handleBarStyle = useMemo(
    () => ({
      ...styles.handleBar,
      backgroundColor: colors.border,
    }),
    [colors.border],
  );

  const handleBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0.3, 1, 1.7],
      [0, 1, 0],
      'clamp',
    );
    const scale = interpolate(
      animatedIndex.value,
      [0.3, 1, 1.7],
      [0.8, 1, 0.8],
      'clamp',
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Left indicator for chevron
  const leftIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.leftIndicator,
      backgroundColor: platoonColor,
    }),
    [platoonColor],
  );

  const leftIndicatorAnimatedStyle = useAnimatedStyle(() => {
    // Show only at top and bottom phases
    const opacity = interpolate(
      animatedIndex.value,
      [0, 0.3, 0.7, 1, 1.3, 1.7, 2],
      [1, 1, 0, 0, 0, 1, 1],
      'clamp',
    );

    const leftIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(-30), 0, toRad(30)],
      'clamp',
    );

    return {
      opacity,
      transform: [
        ...transformOrigin(
          { x: 0, y: indicatorTransformOriginY.value },
          {
            rotate: `${leftIndicatorRotate}rad`,
          },
          {
            translateX: -5,
          },
        ),
      ],
    };
  });

  // Right indicator for chevron
  const rightIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.rightIndicator,
      backgroundColor: platoonColor,
    }),
    [platoonColor],
  );

  const rightIndicatorAnimatedStyle = useAnimatedStyle(() => {
    // Show only at top and bottom phases
    const opacity = interpolate(
      animatedIndex.value,
      [0, 0.3, 0.7, 1, 1.3, 1.7, 2],
      [1, 1, 0, 0, 0, 1, 1],
      'clamp',
    );

    const rightIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(30), 0, toRad(-30)],
      'clamp',
    );

    return {
      opacity,
      transform: [
        ...transformOrigin(
          { x: 0, y: indicatorTransformOriginY.value },
          {
            rotate: `${rightIndicatorRotate}rad`,
          },
          {
            translateX: 5,
          },
        ),
      ],
    };
  });
  //#endregion

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Animated.View
        style={[containerStyle, containerAnimatedStyle]}
        renderToHardwareTextureAndroid={true}
      >
        {/* Traditional handle bar (middle phase) */}
        <Animated.View style={[handleBarStyle, handleBarAnimatedStyle]} />

        {/* Chevron indicators (top/bottom phases) */}
        <Animated.View
          style={[leftIndicatorStyle, leftIndicatorAnimatedStyle]}
        />
        <Animated.View
          style={[rightIndicatorStyle, rightIndicatorAnimatedStyle]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  handleBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  indicator: {
    position: 'absolute',
    width: 14,
    height: 5,
    marginTop: -2.5, // Center vertically
  },
  leftIndicator: {
    borderTopStartRadius: 2,
    borderBottomStartRadius: 2,
  },
  rightIndicator: {
    borderTopEndRadius: 2,
    borderBottomEndRadius: 2,
  },
});

export default CustomBottomSheetHandle;
