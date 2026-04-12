import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';
import DistrictBottomSheet from '@/src/components/DistrictBottomSheet';
import { useArcs } from '@/src/hooks/useArcs';
import { geoToSvg } from '@/src/utils/geoToSvg';
import { WORLD_COLORS, WORLD_EMOJI } from '@/src/constants/world';

const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;
const MIN_SCALE_FACTOR = 1;
const MAX_SCALE_FACTOR = 8;

const LEGEND_ITEMS = [
  { key: 'TASTE',   label: 'Taste',   color: '#B85C1A' },
  { key: 'WILD',    label: 'Wild',    color: '#2D6E4E' },
  { key: 'MOVE',    label: 'Move',    color: '#1A5F8A' },
  { key: 'ROOTS',   label: 'Roots',   color: '#614A9E' },
  { key: 'RESTORE', label: 'Restore', color: '#5E8C6E' },
]

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  floatingHeader: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    gap: 2,
    alignItems: 'flex-end',
  },
  floatingTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  floatingSubtitle: {
    ...typography.label,
    color: colors.textTertiary,
    letterSpacing: 2,
  },
  legend: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    gap: 6,
    backgroundColor: colors.surfaceWhite + 'E0',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
})

export default function IslandScreen() {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme()
  const styles = makeStyles(colors)
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
      {/* Floating title */}
      <View style={[styles.floatingHeader, { top: top + spacing.sm }]}>
        <Text style={styles.floatingTitle}>The Island</Text>
        <Text style={styles.floatingSubtitle}>Sri Lanka</Text>
      </View>

      {/* Pin legend */}
      {!selectedDistrict && <View style={[styles.legend, { bottom: bottom + spacing.lg }]}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>}

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
                fill={selectedDistrict === name ? colors.primary + '55' : '#DDD7CC'}
                stroke={colors.primary}
                strokeWidth={1.5}
                strokeLinejoin="round"
                onPress={() => setSelectedDistrict(name)}
              />
            ))}

            {/* Arc pins */}
            {arcs?.map((arc, index) => {
              const firstChapter = arc.chapters?.[0];
              if (!firstChapter) return null;
              const pinColor = WORLD_COLORS[arc.worldType] ?? colors.primary;
              const emoji = WORLD_EMOJI[arc.worldType] ?? '📍';
              const base = geoToSvg(firstChapter.lat, firstChapter.lng);

              const JITTER_RADIUS = 28;
              const priorPositions = arcs.slice(0, index).map((a) => {
                const ch = a.chapters?.[0];
                return ch ? geoToSvg(ch.lat, ch.lng) : null;
              }).filter(Boolean) as { x: number; y: number }[];

              let { x, y } = base;
              let overlapping = priorPositions.filter(
                (p) => Math.hypot(p.x - x, p.y - y) < JITTER_RADIUS
              );
              if (overlapping.length > 0) {
                const angle = (index * 137.5 * Math.PI) / 180;
                x += Math.cos(angle) * JITTER_RADIUS * 0.8;
                y += Math.sin(angle) * JITTER_RADIUS * 0.8;
              }

              const r = 11;
              const tailH = 10;
              const cy = y - r - tailH;
              const lx = x - r * 0.5;
              const rx = x + r * 0.5;
              const ty = cy + r * 0.866;
              const pinD = `M ${x} ${y} L ${lx} ${ty} A ${r} ${r} 0 1 1 ${rx} ${ty} Z`;

              return (
                <G key={arc.id} onPress={() => router.push(`/arc/${arc.id}` as never)}>
                  <Circle cx={x} cy={cy} r={r + 7} fill={pinColor + '22'} />
                  <Path d={pinD} fill={pinColor} />
                  <Circle cx={x} cy={cy} r={r} fill={pinColor} stroke="white" strokeWidth={1.5} />
                  <SvgText x={x} y={cy + 4} textAnchor="middle" fontSize={11} fill="white">
                    {emoji}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Reanimated.View>
      </GestureDetector>

      <DistrictBottomSheet
        district={selectedDistrict}
        arcs={arcs ?? []}
        onClose={() => setSelectedDistrict(null)}
      />
    </View>
  );
}
