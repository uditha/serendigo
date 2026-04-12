import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronRight } from 'lucide-react-native'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useArcs, type ArcPin } from '@/src/hooks/useArcs'

// World colors — brand colors, same in light & dark
const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A', WILD: '#2D6E4E', MOVE: '#1A5F8A',
  ROOTS: '#614A9E', RESTORE: '#5E8C6E',
}
const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

type WorldFilter = 'ALL' | 'TASTE' | 'WILD' | 'MOVE' | 'ROOTS' | 'RESTORE'

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backLink: {
    paddingRight: spacing.xs,
  },
  backLinkText: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  headerTitles: {
    gap: 2,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Filter chips
  filtersRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWhite,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: 'white',
  },

  // List
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Arc card
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    height: 185,
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardImageFallback: {
    height: 185,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImageGrad: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: 20,
  },
  cardImageTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: 'white',
    lineHeight: 28,
  },
  cardFallbackEmoji: { fontSize: 56 },
  worldPill: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  worldPillText: {
    ...typography.label,
    color: 'white',
    letterSpacing: 0.4,
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  cardTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  chapterBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chapterBadgeText: {
    ...typography.label,
    fontSize: 10,
  },
  cardMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
})

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ArcBrowseScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const { data: arcs, isLoading } = useArcs()
  const [activeFilter, setActiveFilter] = useState<WorldFilter>('ALL')

  const FILTERS: { key: WorldFilter; label: string; emoji: string; color: string }[] = [
    { key: 'ALL',     label: 'All',     emoji: '🗺️', color: colors.textPrimary },
    { key: 'TASTE',   label: 'Taste',   emoji: '🍛', color: '#B85C1A' },
    { key: 'WILD',    label: 'Wild',    emoji: '🐘', color: '#2D6E4E' },
    { key: 'MOVE',    label: 'Move',    emoji: '🏄', color: '#1A5F8A' },
    { key: 'ROOTS',   label: 'Roots',   emoji: '🏛️', color: '#614A9E' },
    { key: 'RESTORE', label: 'Restore', emoji: '🌿', color: '#5E8C6E' },
  ]

  const filtered = activeFilter === 'ALL'
    ? (arcs ?? [])
    : (arcs ?? []).filter((a) => a.worldType === activeFilter)

  return (
    <View style={styles.container}>
      {/* Fixed header + filter chips */}
      <View style={[styles.header, { paddingTop: top + spacing.md }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>←</Text>
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>All Journeys</Text>
            {!isLoading && (
              <Text style={styles.subtitle}>
                {filtered.length} {filtered.length === 1 ? 'arc' : 'arcs'}
                {activeFilter !== 'ALL' ? ` in ${activeFilter.charAt(0) + activeFilter.slice(1).toLowerCase()}` : ''}
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key
            return (
              <Pressable
                key={f.key}
                style={[
                  styles.chip,
                  active && { backgroundColor: f.color, borderColor: f.color },
                ]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={styles.chipEmoji}>{f.emoji}</Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Arc list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {isLoading ? (
          <>
            <ArcCardSkeleton styles={styles} colors={colors} />
            <ArcCardSkeleton styles={styles} colors={colors} />
            <ArcCardSkeleton styles={styles} colors={colors} />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No journeys here yet</Text>
            <Text style={styles.emptyBody}>
              More arcs are being added — check back soon or explore a different world type.
            </Text>
          </View>
        ) : (
          filtered.map((arc) => <ArcCard key={arc.id} arc={arc} styles={styles} colors={colors} />)
        )}
      </ScrollView>
    </View>
  )
}

// ─── Arc card ──────────────────────────────────────────────────────────────
function ArcCard({ arc, styles, colors }: { arc: ArcPin; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary
  const province = arc.province.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/arc/${arc.id}` as never)}>
      {arc.coverImage ? (
        <ImageBackground
          source={{ uri: arc.coverImage }}
          style={styles.cardImage}
          resizeMode="cover"
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']}
            style={styles.cardImageGrad}
          >
            <View style={[styles.worldPill, { backgroundColor: worldColor }]}>
              <Text style={styles.worldPillText}>{WORLD_EMOJI[arc.worldType]}  {arc.worldType}</Text>
            </View>
            <Text style={styles.cardImageTitle} numberOfLines={2}>{arc.title}</Text>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={[styles.cardImageFallback, { backgroundColor: worldColor + '20' }]}>
          <Text style={styles.cardFallbackEmoji}>{WORLD_EMOJI[arc.worldType] ?? '✨'}</Text>
          <View style={[styles.worldPill, { backgroundColor: worldColor, position: 'absolute', bottom: spacing.md, left: spacing.md }]}>
            <Text style={styles.worldPillText}>{WORLD_EMOJI[arc.worldType]}  {arc.worldType}</Text>
          </View>
          <Text style={[styles.cardImageTitle, { position: 'absolute', bottom: spacing.md + 36, left: spacing.md, right: spacing.md }]} numberOfLines={2}>
            {arc.title}
          </Text>
        </View>
      )}

      <View style={styles.cardBody}>
        {arc.coverImage && (
          <Text style={styles.cardTitle} numberOfLines={1}>{arc.title}</Text>
        )}
        <View style={styles.cardMetaRow}>
          <View style={styles.cardMeta}>
            <View style={[styles.chapterBadge, { backgroundColor: worldColor + '15' }]}>
              <Text style={[styles.chapterBadgeText, { color: worldColor }]}>
                {arc.chapters.length} {arc.chapters.length === 1 ? 'chapter' : 'chapters'}
              </Text>
            </View>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.cardMetaText}>{province}</Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </View>
      </View>
    </Pressable>
  )
}

// ─── Skeleton card ─────────────────────────────────────────────────────────
function ArcCardSkeleton({ styles, colors }: { styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImage, { backgroundColor: colors.textTertiary + '15' }]} />
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm }}>
        <View style={{ width: 80, height: 10, borderRadius: 8, backgroundColor: colors.textTertiary + '30' }} />
        <View style={{ width: '60%', height: 14, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
      </View>
    </View>
  )
}
