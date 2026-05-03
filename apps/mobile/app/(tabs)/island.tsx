import { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  clamp,
  runOnJS,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { spacing, typography, AppColors } from '@/src/theme';
import { useTheme } from '@/src/hooks/useTheme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';
import DistrictBottomSheet from '@/src/components/DistrictBottomSheet';
import { useArcs } from '@/src/hooks/useArcs';
import { geoToSvg } from '@/src/utils/geoToSvg';
import { WORLD_COLORS, WORLD_EMOJI } from '@/src/constants/world';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;
const MAX_SCALE_FACTOR = 8;

const LEGEND_ITEMS = [
  { key: 'TASTE',   label: 'Taste',   color: '#B85C1A' },
  { key: 'WILD',    label: 'Wild',    color: '#2D6E4E' },
  { key: 'MOVE',    label: 'Move',    color: '#1A5F8A' },
  { key: 'ROOTS',   label: 'Roots',   color: '#614A9E' },
  { key: 'RESTORE', label: 'Restore', color: '#5E8C6E' },
];

const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'Colombo':      { lat: 6.9271, lng: 79.8612 },
  'Gampaha':      { lat: 7.0917, lng: 79.9986 },
  'Kalutara':     { lat: 6.5854, lng: 79.9607 },
  'Kandy':        { lat: 7.2906, lng: 80.6337 },
  'Matale':       { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  'Galle':        { lat: 6.0535, lng: 80.2210 },
  'Matara':       { lat: 5.9549, lng: 80.5550 },
  'Hambantota':   { lat: 6.1241, lng: 81.1185 },
  'Jaffna':       { lat: 9.6615, lng: 80.0255 },
  'Kilinochchi':  { lat: 9.3803, lng: 80.4037 },
  'Mannar':       { lat: 8.9811, lng: 79.9044 },
  'Vavuniya':     { lat: 8.7514, lng: 80.4971 },
  'Mullaitivu':   { lat: 9.2671, lng: 80.8128 },
  'Batticaloa':   { lat: 7.7102, lng: 81.6924 },
  'Ampara':       { lat: 7.2951, lng: 81.6747 },
  'Trincomalee':  { lat: 8.5922, lng: 81.2152 },
  'Kurunegala':   { lat: 7.4818, lng: 80.3609 },
  'Puttalam':     { lat: 8.0362, lng: 79.8283 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Polonnaruwa':  { lat: 7.9403, lng: 81.0188 },
  'Badulla':      { lat: 6.9934, lng: 81.0550 },
  'Monaragala':   { lat: 6.8728, lng: 81.3507 },
  'Ratnapura':    { lat: 6.6828, lng: 80.3992 },
  'Kegalle':      { lat: 7.2513, lng: 80.3464 },
};

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
});

export default function IslandScreen() {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { data: arcs } = useArcs();

  const availableWidth = width - spacing.xl * 2;
  const availableHeight = height * 0.8;

  const fitScale = Math.min(
    availableWidth / VIEW_BOX_WIDTH,
    availableHeight / VIEW_BOX_HEIGHT,
  );

  const CLUSTER_THRESHOLD = fitScale * 2.5;

  // ── Gesture shared values ────────────────────────────────────────────────
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

  // ── Gestures ─────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, fitScale, fitScale * MAX_SCALE_FACTOR);
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
        scale.value,
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
    pinchGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [userSvgPos, setUserSvgPos] = useState<{ x: number; y: number } | null>(null);
  const [showPins, setShowPins] = useState(false);

  useAnimatedReaction(
    () => scale.value,
    (current) => runOnJS(setShowPins)(current >= CLUSTER_THRESHOLD),
  );

  // ── District data ─────────────────────────────────────────────────────────
  const districtSvgCenters = useMemo(() =>
    Object.fromEntries(
      Object.entries(DISTRICT_CENTROIDS).map(([name, coords]) => [
        name, geoToSvg(coords.lat, coords.lng),
      ]),
    ), []);

  const arcsByDistrict = useMemo(() => {
    const map: Record<string, NonNullable<typeof arcs>> = {};
    for (const arc of arcs ?? []) {
      if (!arc.district) continue;
      if (!map[arc.district]) map[arc.district] = [];
      map[arc.district].push(arc);
    }
    return map;
  }, [arcs]);

  const districtsWithArcs = useMemo(
    () => new Set(Object.keys(arcsByDistrict)),
    [arcsByDistrict],
  );

  // ── Zoom to district ──────────────────────────────────────────────────────
  const zoomToDistrict = (district: string) => {
    const center = districtSvgCenters[district];
    if (!center) return;
    const targetScale = fitScale * 4;
    const rawX = -(center.x - VIEW_BOX_WIDTH / 2) * targetScale;
    const rawY = -(center.y - VIEW_BOX_HEIGHT / 2) * targetScale;
    const maxX = (VIEW_BOX_WIDTH * targetScale - availableWidth) / 2;
    const maxY = (VIEW_BOX_HEIGHT * targetScale - availableHeight) / 2;
    const cx = Math.min(Math.max(rawX, -maxX), maxX);
    const cy = Math.min(Math.max(rawY, -maxY), maxY);
    scale.value = withSpring(targetScale, { damping: 18 });
    savedScale.value = targetScale;
    translateX.value = withSpring(cx, { damping: 18 });
    translateY.value = withSpring(cy, { damping: 18 });
    savedTranslateX.value = cx;
    savedTranslateY.value = cy;
  };

  // ── Location pulse animation ──────────────────────────────────────────────
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 1800, useNativeDriver: false }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
      ).start();
    anim(pulse1, 0);
    anim(pulse2, 900);
  }, []);

  const ring1R = pulse1.interpolate({ inputRange: [0, 1], outputRange: [10, 32] });
  const ring1Opacity = pulse1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const ring2R = pulse2.interpolate({ inputRange: [0, 1], outputRange: [10, 32] });
  const ring2Opacity = pulse2.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  // ── User location ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const pos = geoToSvg(loc.coords.latitude, loc.coords.longitude);
      const inBounds =
        pos.x >= 0 && pos.x <= VIEW_BOX_WIDTH &&
        pos.y >= 0 && pos.y <= VIEW_BOX_HEIGHT;
      const finalPos = inBounds ? pos : geoToSvg(6.9271, 79.8612);
      setUserSvgPos(finalPos);
      if (inBounds) {
        const cx = -(pos.x - VIEW_BOX_WIDTH / 2) * fitScale;
        const cy = -(pos.y - VIEW_BOX_HEIGHT / 2) * fitScale;
        const clamped = clampTranslation(cx, cy, fitScale);
        translateX.value = withSpring(clamped.x);
        translateY.value = withSpring(clamped.y);
        savedTranslateX.value = clamped.x;
        savedTranslateY.value = clamped.y;
      }
    })();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.floatingHeader, { top: top + spacing.sm }]}>
        <Text style={styles.floatingTitle}>The Island</Text>
        <Text style={styles.floatingSubtitle}>Sri Lanka</Text>
      </View>

      {showPins && !selectedDistrict && (
        <View style={[styles.legend, { bottom: bottom + spacing.lg }]}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      <GestureDetector gesture={composed}>
        <Reanimated.View style={animatedStyle}>
          <Svg
            width={VIEW_BOX_WIDTH}
            height={VIEW_BOX_HEIGHT}
            viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          >
            {/* District fills */}
            {Object.entries(DISTRICT_PATHS).map(([name, d]) => (
              <Path
                key={name}
                d={d}
                fill={
                  selectedDistrict === name
                    ? colors.primary + '55'
                    : districtsWithArcs.has(name)
                    ? colors.primary + '18'
                    : '#DDD7CC'
                }
                stroke={colors.primary}
                strokeWidth={1.5}
                strokeLinejoin="round"
                onPress={() => setSelectedDistrict(name)}
              />
            ))}

            {/* District badges — zoomed out */}
            {!showPins && Object.entries(arcsByDistrict).map(([district, districtArcs]) => {
              const center = districtSvgCenters[district];
              if (!center || !districtArcs.length) return null;

              const PILL_H = 28;
              const COUNT_R = 11;
              const CHAR_W = 7.4;
              const pillW = district.length * CHAR_W + COUNT_R * 2 + 30;
              const bx = center.x - pillW / 2;
              const by = center.y - PILL_H / 2;
              const pillRx = PILL_H / 2;
              const countCx = bx + COUNT_R + 7;

              return (
                <G key={district} onPress={() => zoomToDistrict(district)}>
                  {/* drop shadow */}
                  <Rect
                    x={bx + 1} y={by + 2}
                    width={pillW} height={PILL_H}
                    rx={pillRx} fill="rgba(0,0,0,0.14)"
                  />
                  {/* white pill */}
                  <Rect
                    x={bx} y={by}
                    width={pillW} height={PILL_H}
                    rx={pillRx} fill="white"
                  />
                  {/* amber count bubble */}
                  <Circle cx={countCx} cy={center.y} r={COUNT_R} fill={colors.primary} />
                  <SvgText
                    x={countCx} y={center.y + 4.5}
                    textAnchor="middle" fontSize={12} fontWeight="bold" fill="white"
                  >
                    {districtArcs.length}
                  </SvgText>
                  {/* district name */}
                  <SvgText
                    x={countCx + COUNT_R + 8} y={center.y + 4.5}
                    fontSize={12} fontWeight="600" fill="#1A1A2E"
                  >
                    {district}
                  </SvgText>
                </G>
              );
            })}

            {/* Arc pins — zoomed in */}
            {showPins && arcs?.map((arc, index) => {
              const firstChapter = arc.chapters?.[0];
              if (!firstChapter) return null;

              const pinColor = WORLD_COLORS[arc.worldType] ?? colors.primary;
              const emoji = WORLD_EMOJI[arc.worldType] ?? '📍';
              const base = geoToSvg(firstChapter.lat, firstChapter.lng);

              const JITTER_R = 28;
              const priorPositions = arcs
                .slice(0, index)
                .map((a) => { const ch = a.chapters?.[0]; return ch ? geoToSvg(ch.lat, ch.lng) : null; })
                .filter(Boolean) as { x: number; y: number }[];

              let { x, y } = base;
              if (priorPositions.some((p) => Math.hypot(p.x - x, p.y - y) < JITTER_R)) {
                const angle = (index * 137.5 * Math.PI) / 180;
                x += Math.cos(angle) * JITTER_R * 0.8;
                y += Math.sin(angle) * JITTER_R * 0.8;
              }

              const PR = 11;
              const pinCy = y - PR - 10;
              const pinLx = x - PR * 0.5;
              const pinRx = x + PR * 0.5;
              const pinTy = pinCy + PR * 0.866;
              const pinD = `M ${x} ${y} L ${pinLx} ${pinTy} A ${PR} ${PR} 0 1 1 ${pinRx} ${pinTy} Z`;

              return (
                <G key={arc.id} onPress={() => router.push(`/arc/${arc.id}` as never)}>
                  <Circle cx={x} cy={pinCy} r={PR + 7} fill={pinColor + '22'} />
                  <Path d={pinD} fill={pinColor} />
                  <Circle cx={x} cy={pinCy} r={PR} fill={pinColor} stroke="white" strokeWidth={1.5} />
                  <SvgText x={x} y={pinCy + 4} textAnchor="middle" fontSize={11} fill="white">
                    {emoji}
                  </SvgText>
                </G>
              );
            })}

            {/* User location dot — always on top */}
            {userSvgPos && (
              <G>
                <AnimatedCircle cx={userSvgPos.x} cy={userSvgPos.y} r={ring1R} fill="#2980B9" fillOpacity={ring1Opacity} />
                <AnimatedCircle cx={userSvgPos.x} cy={userSvgPos.y} r={ring2R} fill="#2980B9" fillOpacity={ring2Opacity} />
                <Circle cx={userSvgPos.x} cy={userSvgPos.y} r={8} fill="#2980B9" stroke="white" strokeWidth={2.5} />
              </G>
            )}
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
