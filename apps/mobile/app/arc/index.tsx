import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@/src/theme'
import { useArcs, type ArcPin } from '@/src/hooks/useArcs'

// ─── Config ────────────────────────────────────────────────────────────────
type WorldFilter = 'ALL' | 'TASTE' | 'WILD' | 'MOVE' | 'ROOTS' | 'RESTORE'

const FILTERS: { key: WorldFilter; label: string; emoji: string; color: string }[] = [
  { key: 'ALL',     label: 'All',     emoji: '🗺️', color: colors.textSecondary },
  { key: 'TASTE',   label: 'Taste',   emoji: '🍛', color: colors.taste },
  { key: 'WILD',    label: 'Wild',    emoji: '🐘', color: colors.wild },
  { key: 'MOVE',    label: 'Move',    emoji: '🏄', color: colors.move },
  { key: 'ROOTS',   label: 'Roots',   emoji: '🏛️', color: colors.roots },
  { key: 'RESTORE', label: 'Restore', emoji: '🌿', color: colors.restore },
]

const WORLD_COLORS: Record<string, string> = {
  TASTE: colors.taste, WILD: colors.wild, MOVE: colors.move,
  ROOTS: colors.roots, RESTORE: colors.restore,
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

function Skeleton({ width, height = 16, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  return <View style={{ width, height, borderRadius: radius, backgroundColor: colors.textTertiary + '30' }} />
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ArcBrowseScreen() {
  const { top } = useSafeAreaInsets()
  const { data: arcs, isLoading } = useArcs()
  const [activeFilter, setActiveFilter] = useState<WorldFilter>('ALL')

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

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key
            const chipColor = f.key === 'ALL' ? colors.textPrimary : f.color
            return (
              <Pressable
                key={f.key}
                style={[
                  styles.chip,
                  active && { backgroundColor: chipColor, borderColor: chipColor },
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
            <ArcCardSkeleton />
            <ArcCardSkeleton />
            <ArcCardSkeleton />
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
          filtered.map((arc) => <ArcCard key={arc.id} arc={arc} />)
        )}
      </ScrollView>
    </View>
  )
}

// ─── Arc card ──────────────────────────────────────────────────────────────
function ArcCard({ arc }: { arc: ArcPin }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/arc/${arc.id}` as never)}>
      {/* Colored banner */}
      <View style={[styles.cardBanner, { backgroundColor: worldColor + '22' }]}>
        <View style={[styles.worldBadge, { backgroundColor: worldColor }]}>
          <Text style={styles.worldBadgeText}>{arc.worldType}</Text>
        </View>
        <Text style={styles.cardEmoji}>{WORLD_EMOJI[arc.worldType] ?? '✨'}</Text>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{arc.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaText}>
            {arc.chapters.length} {arc.chapters.length === 1 ? 'chapter' : 'chapters'}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.cardMetaText}>
            {arc.province.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <View style={[styles.exploreButton, { backgroundColor: worldColor }]}>
          <Text style={styles.exploreButtonText}>View journey →</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Skeleton card ─────────────────────────────────────────────────────────
function ArcCardSkeleton() {
  return (
    <View style={[styles.card, { overflow: 'hidden' }]}>
      <View style={[styles.cardBanner, { backgroundColor: colors.textTertiary + '15' }]} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <Skeleton width={80} height={12} />
        <Skeleton width="70%" height={22} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DDD0',
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
    borderColor: '#E5DDD0',
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
    borderWidth: 1,
    borderColor: '#E5DDD0',
    overflow: 'hidden',
  },
  cardBanner: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  worldBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  worldBadgeText: {
    ...typography.label,
    color: 'white',
  },
  cardEmoji: { fontSize: 44 },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  exploreButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  exploreButtonText: {
    ...typography.h3,
    color: 'white',
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
