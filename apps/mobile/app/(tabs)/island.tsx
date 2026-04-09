import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { colors, spacing } from '@/src/theme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';
import DistrictBottomSheet from '@/src/components/DistrictBottomSheet';
import { useArcs } from '@/src/hooks/useArcs';
import { geoToSvg } from '@/src/utils/geoToSvg';

const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;
const MIN_SCALE_FACTOR = 1;
const MAX_SCALE_FACTOR = 8;

const WORLD_COLORS: Record<string, string> = {
  TASTE:   colors.taste,
  WILD:    colors.wild,
  MOVE:    colors.move,
  ROOTS:   colors.roots,
  RESTORE: colors.restore,
};

export default function IslandScreen() {
  const { width, height } = useWindowDimensions();
  const { data: arcs } = useArcs();

  const padding = spacing.xl * 2;
  const availableWidth = width - padding;
  const availableHeight = height * 0.8;

  const fitScale = Math.min(
    availableWidth / VIEW_BOX_WIDTH,
    availableHeight / VIEW_BOX_HEIGHT
  );

  const scale = useSharedValue(fitScale);
  const savedScale = useSharedValue(fitScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const clampTranslation = (tx: number, ty: number, s: number) => {
    'worklet';
    const maxX = (VIEW_BOX_WIDTH * s - availableWidth) / 2;
    const maxY = (VIEW_BOX_HEIGHT * s - availableHeight) / 2;
    return {
      x: clamp(tx, -Math.max(0, maxX), Math.max(0, maxX)),
      y: clamp(ty, -Math.max(0, maxY), Math.max(0, maxY)),
    };
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, fitScale * MIN_SCALE_FACTOR, fitScale * MAX_SCALE_FACTOR);
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
      if (scale.value > fitScale * 1.1) {
        scale.value = withSpring(fitScale);
        savedScale.value = fitScale;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(fitScale * 3);
        savedScale.value = fitScale * 3;
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

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Reanimated.View style={animatedStyle}>
          <Svg
            width={VIEW_BOX_WIDTH}
            height={VIEW_BOX_HEIGHT}
            viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          >
            {/* District polygons */}
            {Object.entries(DISTRICT_PATHS).map(([name, d]) => (
              <Path
                key={name}
                d={d}
                fill={selectedDistrict === name ? colors.primary + '55' : '#E5E5E0'}
                stroke={colors.primary}
                strokeWidth={1.5}
                strokeLinejoin="round"
                onPress={() => setSelectedDistrict(name)}
              />
            ))}

            {/* Arc pins — one pin per arc at first chapter position */}
            {arcs?.map((arc) => {
              const firstChapter = arc.chapters?.[0];
              if (!firstChapter) return null;
              const pinColor = WORLD_COLORS[arc.worldType] ?? colors.primary;
              const { x, y } = geoToSvg(firstChapter.lat, firstChapter.lng);
              return (
                <G key={arc.id}>
                  {/* Outer glow ring */}
                  <Circle cx={x} cy={y} r={14} fill={pinColor + '25'} />
                  {/* Pin dot */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={8}
                    fill={pinColor}
                    stroke="white"
                    strokeWidth={2}
                  />
                </G>
              );
            })}
          </Svg>
        </Reanimated.View>
      </GestureDetector>

      <DistrictBottomSheet
        district={selectedDistrict}
        onClose={() => setSelectedDistrict(null)}
      />
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
});
