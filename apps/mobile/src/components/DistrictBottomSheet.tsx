import { useEffect } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { PROVINCES } from '@/src/data/sriLankaProvinces';
import { getProvincePartners, type PartnerSummary } from '@/src/services/partners';
import type { ArcPin } from '@/src/hooks/useArcs';

// Build district → province lookup once
const DISTRICT_TO_PROVINCE: Record<string, string> = {}
PROVINCES.forEach((p) => p.districts.forEach((d) => { DISTRICT_TO_PROVINCE[d] = p.id }))

// World colors are brand colors — same in light & dark
const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A',
  WILD:  '#2D6E4E',
  MOVE:  '#1A5F8A',
  ROOTS: '#614A9E',
  RESTORE: '#5E8C6E',
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

interface Props {
  district: string | null;
  arcs: ArcPin[];
  onClose: () => void;
}

const SHEET_HEIGHT = 480;
const DRAG_DISMISS_THRESHOLD = 60;

const makeStyles = (colors: AppColors) => StyleSheet.create({
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
    borderColor: colors.border,
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

  // Partner strip
  partnerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  partnerStripLabel: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  partnerChip: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  partnerChipPhoto: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  partnerChipEmoji: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerChipName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11,
  },
  partnerChipCat: {
    fontSize: 10,
    marginTop: 1,
  },
})

export default function DistrictBottomSheet({ district, arcs, onClose }: Props) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme()
  const styles = makeStyles(colors)
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

  // Fetch province partners for the strip (top FOOD + STAY + EXPERIENCE)
  const { data: provincePartners = {} } = useQuery({
    queryKey: ['province-partners', provinceId?.toUpperCase()],
    queryFn: () => getProvincePartners(provinceId!.toUpperCase()),
    enabled: !!provinceId,
    staleTime: 10 * 60 * 1000,
  })
  const partnerStrip: PartnerSummary[] = [
    ...(provincePartners['FOOD'] ?? []).slice(0, 2),
    ...(provincePartners['STAY'] ?? []).slice(0, 2),
    ...(provincePartners['EXPERIENCE'] ?? []).slice(0, 1),
  ].slice(0, 5)

  const CHIP_COLORS: Record<string, string> = {
    FOOD: '#B85C1A', STAY: '#1A5F8A', EXPERIENCE: '#614A9E',
  }
  const CHIP_EMOJI: Record<string, string> = {
    FOOD: '🍛', STAY: '🏨', EXPERIENCE: '🎭',
  }

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
            style={[styles.arcList, { maxHeight: 220 }]}
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
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </Pressable>
                )
              })
            )}
          </ScrollView>

          {/* Partner strip */}
          {partnerStrip.length > 0 && (
            <>
              <View style={styles.partnerDivider} />
              <Text style={styles.partnerStripLabel}>Stay & Eat nearby</Text>
              <FlatList
                horizontal
                data={partnerStrip}
                keyExtractor={(p) => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xs }}
                renderItem={({ item }) => {
                  const chipColor = CHIP_COLORS[item.category] ?? colors.primary
                  const chipEmoji = CHIP_EMOJI[item.category] ?? '📍'
                  return (
                    <Pressable
                      style={styles.partnerChip}
                      onPress={() => { onClose(); router.push(`/partner/${item.id}`) }}
                    >
                      {item.photos[0] ? (
                        <Image source={{ uri: item.photos[0] }} style={styles.partnerChipPhoto} resizeMode="cover" />
                      ) : (
                        <View style={[styles.partnerChipEmoji, { backgroundColor: chipColor + '18' }]}>
                          <Text style={{ fontSize: 18 }}>{chipEmoji}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text style={styles.partnerChipName} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.partnerChipCat, { color: chipColor }]}>{item.category}</Text>
                      </View>
                    </Pressable>
                  )
                }}
              />
            </>
          )}
        </Reanimated.View>
      </GestureDetector>
    </>
  );
}
