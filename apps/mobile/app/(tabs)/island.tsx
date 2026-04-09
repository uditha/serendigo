import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/src/theme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';

const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function IslandScreen() {
  const { width, height } = useWindowDimensions();

  const padding = spacing.xl * 2;
  const availableWidth = width - padding;
  const availableHeight = height * 0.8;
  const fitScale = Math.min(
    availableWidth / VIEW_BOX_WIDTH,
    availableHeight / VIEW_BOX_HEIGHT
  );
  const mapWidth = VIEW_BOX_WIDTH * fitScale;
  const mapHeight = VIEW_BOX_HEIGHT * fitScale;

  // Reanimated shared values for gestures
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const clampTranslation = (tx: number, ty: number, s: number) => {
    'worklet';
    const maxX = (mapWidth * (s - 1)) / 2;
    const maxY = (mapHeight * (s - 1)) / 2;
    return {
      x: clamp(tx, -maxX, maxX),
      y: clamp(ty, -maxY, maxY),
    };
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      const clamped = clampTranslation(translateX.value, translateY.value, scale.value);
      translateX.value = withSpring(clamped.x);
      translateY.value = withSpring(clamped.y);
      savedTranslateX.value = clamped.x;
      savedTranslateY.value = clamped.y;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const clamped = clampTranslation(
        savedTranslateX.value + e.translationX,
        savedTranslateY.value + e.translationY,
        scale.value
      );
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // Reset
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in to 2x
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, panGesture),
    pinchGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastLabel, setToastLabel] = useState('');

  const showToast = useCallback(
    (districtName: string) => {
      setToastLabel(districtName);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    },
    [toastOpacity]
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Reanimated.View style={animatedStyle}>
          <Svg
            width={mapWidth}
            height={mapHeight}
            viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {Object.entries(DISTRICT_PATHS).map(([name, d]) => (
              <Path
                key={name}
                d={d}
                fill="#E5E5E0"
                stroke={colors.primary}
                strokeWidth={1.5}
                strokeLinejoin="round"
                onPress={() => showToast(name)}
              />
            ))}
          </Svg>
        </Reanimated.View>
      </GestureDetector>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toastLabel}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
  },
  toastText: {
    ...typography.body,
    color: colors.surfaceWhite,
  },
});
