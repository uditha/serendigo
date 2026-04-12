import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CircleDollarSign, MapPin } from 'lucide-react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { fetchFromApi } from '@/src/services/api'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'

// World colors — brand colors, same in light & dark
const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A', WILD: '#2D6E4E', MOVE: '#1A5F8A', ROOTS: '#614A9E', RESTORE: '#5E8C6E',
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

interface CaptureEntry {
  id: string
  photoUrl: string
  note: string | null
  coinsEarned: number
  capturedAt: string
}

interface ChapterEntry {
  id: string
  order: number
  title: string
  coinReward: number
  capture: CaptureEntry | null
}

interface MyCapturesData {
  arc: { id: string; title: string; worldType: string }
  chapters: ChapterEntry[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backLink: { marginBottom: spacing.xs },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  worldBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  worldBadgeText: { ...typography.label },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Captured card
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textTertiary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    ...typography.label,
    color: 'white',
  },
  coinsBadge: {
    backgroundColor: colors.coinGold + '20',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  coinsText: {
    ...typography.label,
    color: colors.coinGold,
    fontSize: 11,
  },
  chapterTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  date: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },

  // Locked card
  lockedCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    opacity: 0.6,
  },
  lockedPhoto: {
    width: 80,
    backgroundColor: colors.textTertiary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  lockedMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    height: 90,
  },
  skeletonPhoto: {
    width: 90,
    backgroundColor: colors.textTertiary + '20',
  },

  errorState: { padding: spacing.xl, alignItems: 'center' },
  errorText: { ...typography.body, color: colors.textSecondary },
})

export default function ArcCapturesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)

  const { data, isLoading, error } = useQuery({
    queryKey: ['arc-captures', id],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: MyCapturesData }>(`/api/arcs/${id}/my-captures`).then(
        (r) => r.data,
      ),
    enabled: !!id,
  })

  const worldColor = data ? (WORLD_COLORS[data.arc.worldType] ?? colors.primary) : colors.primary
  const captured = data?.chapters.filter((c) => c.capture).length ?? 0
  const total = data?.chapters.length ?? 0

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: worldColor + '40', paddingTop: top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Your Story</Text>
          </Pressable>

          {data && (
            <>
              <View style={[styles.worldBadge, { backgroundColor: worldColor + '20' }]}>
                <Text style={[styles.worldBadgeText, { color: worldColor }]}>
                  {WORLD_EMOJI[data.arc.worldType]} {data.arc.worldType}
                </Text>
              </View>
              <Text style={styles.title}>{data.arc.title}</Text>
              <Text style={styles.subtitle}>
                {captured} of {total} captured
              </Text>
            </>
          )}

          {isLoading && (
            <>
              <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
              <View style={{ width: '75%', height: 28, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
              <View style={{ width: '40%', height: 14, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
            </>
          )}
        </View>

        {/* Chapter list */}
        <View style={styles.list}>
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonPhoto} />
                <View style={{ flex: 1, gap: spacing.sm, padding: spacing.md }}>
                  <View style={{ width: '60%', height: 14, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
                  <View style={{ width: '40%', height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
                </View>
              </View>
            ))
          ) : error ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>Could not load captures</Text>
            </View>
          ) : (
            data?.chapters.map((chapter) =>
              chapter.capture ? (
                <CapturedChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  capture={chapter.capture}
                  worldColor={worldColor}
                  styles={styles}
                  colors={colors}
                />
              ) : (
                <LockedChapterCard key={chapter.id} chapter={chapter} styles={styles} colors={colors} />
              ),
            )
          )}
        </View>
      </ScrollView>
    </View>
  )
}

function CapturedChapterCard({
  chapter,
  capture,
  worldColor,
  styles,
  colors,
}: {
  chapter: ChapterEntry
  capture: CaptureEntry
  worldColor: string
  styles: ReturnType<typeof makeStyles>
  colors: AppColors
}) {
  return (
    <View style={[styles.card, { borderColor: worldColor + '40' }]}>
      <Image source={{ uri: capture.photoUrl }} style={styles.photo} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.orderBadge, { backgroundColor: worldColor }]}>
            <Text style={styles.orderText}>{chapter.order}</Text>
          </View>
          <View style={styles.coinsBadge}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={styles.coinsText}>+{capture.coinsEarned}</Text>
              <CircleDollarSign size={11} color={colors.coinGold} />
            </View>
          </View>
        </View>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        {capture.note ? (
          <Text style={styles.note} numberOfLines={2}>"{capture.note}"</Text>
        ) : null}
        <Text style={styles.date}>{formatDate(capture.capturedAt)}</Text>
      </View>
    </View>
  )
}

function LockedChapterCard({ chapter, styles, colors }: { chapter: ChapterEntry; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  return (
    <View style={styles.lockedCard}>
      <View style={styles.lockedPhoto}>
        <MapPin size={24} color={colors.textTertiary} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{chapter.order}</Text>
        </View>
        <Text style={styles.lockedTitle}>{chapter.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={styles.lockedMeta}>Not yet captured ·</Text>
          <CircleDollarSign size={11} color={colors.textTertiary} />
          <Text style={styles.lockedMeta}>{chapter.coinReward}</Text>
        </View>
      </View>
    </View>
  )
}
