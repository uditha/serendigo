import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/src/theme';
import { PROVINCES } from '@/src/data/sriLankaProvinces';
import type { ArcPin } from '@/src/hooks/useArcs';

// Build district → province lookup once
const DISTRICT_TO_PROVINCE: Record<string, string> = {}
PROVINCES.forEach((p) => p.districts.forEach((d) => { DISTRICT_TO_PROVINCE[d] = p.id }))

const WORLD_COLORS: Record<string, string> = {
  TASTE:   '#E67E22',
  WILD:    '#27AE60',
  MOVE:    '#2980B9',
  ROOTS:   '#8E44AD',
  RESTORE: '#F39C12',
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

interface Props {
  district: string | null;
  arcs: ArcPin[];
  onClose: () => void;
}

const SHEET_HEIGHT = 380;
const DRAG_DISMISS_THRESHOLD = 60;

export default function DistrictBottomSheet({ district, arcs, onClose }: Props) {
  const { bottom } = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (district) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 18, stiffness: 200 });
    }
  }, [district]);

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > DRAG_DISMISS_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT, { damping: 18, stiffness: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Derive province + filter arcs
  const provinceId = district ? DISTRICT_TO_PROVINCE[district] : null
  const provinceInfo = provinceId ? PROVINCES.find((p) => p.id === provinceId) : null
  const filteredArcs = arcs.filter((a) => a.province.toLowerCase() === provinceId)

  const handleArcPress = (arcId: string) => {
    onClose()
    router.push(`/arc/${arcId}` as never)
  }

  if (!district) return null;

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={dragGesture}>
        <Reanimated.View style={[styles.sheet, { paddingBottom: (bottom || spacing.md) + spacing.md }, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.districtName}>{district}</Text>
              {provinceInfo && (
                <Text style={styles.provinceName}>{provinceInfo.name}</Text>
              )}
            </View>
            <View style={styles.arcCountBadge}>
              <Text style={styles.arcCountText}>
                {filteredArcs.length} {filteredArcs.length === 1 ? 'arc' : 'arcs'}
              </Text>
            </View>
          </View>

          {/* Arc list */}
          <ScrollView
            style={styles.arcList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.arcListContent}
          >
            {filteredArcs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyText}>No journeys here yet</Text>
                <Text style={styles.emptySubtext}>Check back as we add more arcs across the island</Text>
              </View>
            ) : (
              filteredArcs.map((arc) => {
                const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary
                return (
                  <Pressable
                    key={arc.id}
                    style={styles.arcRow}
                    onPress={() => handleArcPress(arc.id)}
                  >
                    <View style={[styles.arcEmojiBadge, { backgroundColor: worldColor + '20' }]}>
                      <Text style={styles.arcEmoji}>{WORLD_EMOJI[arc.worldType] ?? '✨'}</Text>
                    </View>
                    <View style={styles.arcInfo}>
                      <Text style={styles.arcTitle} numberOfLines={1}>{arc.title}</Text>
                      <Text style={styles.arcMeta}>
                        {arc.worldType} · {arc.chapters.length} {arc.chapters.length === 1 ? 'chapter' : 'chapters'}
                      </Text>
                    </View>
                    <View style={[styles.worldDot, { backgroundColor: worldColor }]} />
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                )
              })
            )}
          </ScrollView>
        </Reanimated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_HEIGHT,
    backgroundColor: colors.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary + '60',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  districtName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  provinceName: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  arcCountBadge: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  arcCountText: {
    ...typography.label,
    color: colors.primary,
  },
  arcList: {
    flex: 1,
  },
  arcListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  arcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  arcEmojiBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcEmoji: { fontSize: 20 },
  arcInfo: { flex: 1, gap: 2 },
  arcTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  arcMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  worldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
});
