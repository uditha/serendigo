import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { BookOpen, Trophy, Check, ChevronRight } from 'lucide-react-native'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useAuthStore } from '@/src/stores/authStore'
import { fetchStory, type Journey, type StoryXP } from '@/src/services/story'
import { fetchLeaderboard } from '@/src/services/leaderboard'
import { WORLD_COLORS, WORLD_EMOJI } from '@/src/constants/world'

const XP_LABELS: Record<string, string> = {
  taste: 'Taste', wild: 'Wild', move: 'Move', roots: 'Roots', restore: 'Restore',
}

const XP_KEYS = ['taste', 'wild', 'move', 'roots', 'restore'] as const

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  header: {
    paddingTop: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.label,
    color: colors.textTertiary,
    letterSpacing: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },

  // XP
  xpWrap: { gap: spacing.sm },
  xpSkeletonWrap: { gap: spacing.sm },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpLabel: {
    ...typography.label,
    color: colors.textSecondary,
    width: 52,
  },
  xpBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpValue: {
    ...typography.label,
    width: 32,
    textAlign: 'right',
  },

  // Leaderboard
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  leaderboardLeft: { flex: 1, gap: 3 },
  leaderboardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leaderboardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  leaderboardPeek: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  leaderboardCta: {
    ...typography.body,
    color: colors.primary,
  },

  // Journey groups
  journeyGroup: { gap: spacing.sm },
  groupLabel: {
    ...typography.label,
    color: colors.textTertiary,
    letterSpacing: 1,
  },

  // Arc cards
  arcList: { gap: spacing.sm },
  arcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arcWorldDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  arcCardContent: { flex: 1, gap: spacing.sm },
  arcCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  arcCardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  arcBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  arcBadgeText: {
    ...typography.label,
    fontSize: 10,
  },
  arcProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arcBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  arcBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  arcProgressText: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 10,
  },

  // Empty
  emptyCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Guest
  guestContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  guestTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  guestBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  guestButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  guestButtonText: {
    ...typography.h3,
    color: 'white',
  },
})

// ─── Screen ────────────────────────────────────────────────────────────────
export default function StoryScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const { isLoggedIn } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['story'] }),
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
    ])
    setRefreshing(false)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['story'],
    queryFn: fetchStory,
    enabled: isLoggedIn,
    staleTime: 2 * 60 * 1000,
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 2 * 60 * 1000,
  })

  if (!isLoggedIn) {
    return (
      <View style={styles.guestContainer}>
        <BookOpen size={56} color={colors.primary} />
        <Text style={styles.guestTitle}>Your Story Awaits</Text>
        <Text style={styles.guestBody}>
          Sign in to track captures, earn XP, and write your Sri Lanka adventure.
        </Text>
        <Pressable style={styles.guestButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.guestButtonText}>Sign In</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Story</Text>
        <Text style={styles.headerSubtitle}>Sri Lanka</Text>
      </View>

      {/* XP breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {isLoading ? (
          <View style={styles.xpSkeletonWrap}>
            {XP_KEYS.map((k) => (
              <View key={k} style={styles.xpRow}>
                <View style={{ width: 52, height: 12, borderRadius: 4, backgroundColor: colors.textTertiary + '30' }} />
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.textTertiary + '30' }} />
                <View style={{ width: 28, height: 12, borderRadius: 4, backgroundColor: colors.textTertiary + '30' }} />
              </View>
            ))}
          </View>
        ) : data ? (
          <XPBars xp={data.xp} styles={styles} colors={colors} />
        ) : null}
      </View>

      {/* Leaderboard teaser */}
      <Pressable style={styles.leaderboardCard} onPress={() => router.push('/leaderboard' as never)}>
        <View style={styles.leaderboardLeft}>
          <View style={styles.leaderboardTitleRow}>
            <Trophy size={16} color={colors.textPrimary} />
            <Text style={styles.leaderboardTitle}>Top Explorers</Text>
          </View>
          {leaderboard && leaderboard.length > 0 && (
            <Text style={styles.leaderboardPeek} numberOfLines={1}>
              {leaderboard.slice(0, 3).map((e) => e.name?.split(' ')[0] ?? 'Traveller').join(' · ')}
            </Text>
          )}
        </View>
        <Text style={styles.leaderboardCta}>View →</Text>
      </Pressable>

      {/* Journeys */}
      <Text style={styles.sectionTitle}>My Journeys</Text>

      {isLoading ? (
        <JourneysSkeleton styles={styles} colors={colors} />
      ) : error || !data?.journeys ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyBody}>Could not load your story</Text>
        </View>
      ) : data.journeys.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No journeys yet</Text>
          <Text style={styles.emptyBody}>Start an arc from the Today tab to begin your adventure.</Text>
        </View>
      ) : (
        <>
          {data.journeys.filter((j) => !j.isComplete).length > 0 && (
            <View style={styles.journeyGroup}>
              <Text style={styles.groupLabel}>In Progress</Text>
              <View style={styles.arcList}>
                {data.journeys.filter((j) => !j.isComplete).map((journey) => (
                  <JourneyCard key={journey.arcId} journey={journey} styles={styles} colors={colors} />
                ))}
              </View>
            </View>
          )}
          {data.journeys.filter((j) => j.isComplete).length > 0 && (
            <View style={styles.journeyGroup}>
              <Text style={styles.groupLabel}>Completed</Text>
              <View style={styles.arcList}>
                {data.journeys.filter((j) => j.isComplete).map((journey) => (
                  <JourneyCard key={journey.arcId} journey={journey} styles={styles} colors={colors} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

// ─── XP Bars ───────────────────────────────────────────────────────────────
function XPBars({ xp, styles, colors }: { xp: StoryXP; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const max = Math.max(...XP_KEYS.map((k) => xp[k]), 100)

  return (
    <View style={styles.xpWrap}>
      {XP_KEYS.map((key) => {
        const value = xp[key]
        const color = WORLD_COLORS[key.toUpperCase()] ?? colors.primary
        const pct = max > 0 ? (value / max) * 100 : 0

        return (
          <View key={key} style={styles.xpRow}>
            <Text style={styles.xpLabel}>{XP_LABELS[key]}</Text>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.xpValue, { color }]}>{value}</Text>
          </View>
        )
      })}
    </View>
  )
}

// ─── Journey Card ───────────────────────────────────────────────────────────
function JourneyCard({ journey, styles, colors }: { journey: Journey; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const worldColor = WORLD_COLORS[journey.worldType] ?? colors.primary
  const pct = journey.totalChapters > 0
    ? (journey.capturedChapters / journey.totalChapters) * 100
    : 0

  return (
    <Pressable
      style={styles.arcCard}
      onPress={() =>
        router.push(
          (journey.isComplete
            ? `/arc/${journey.arcId}/captures`
            : `/arc/${journey.arcId}`) as never
        )
      }
    >
      <View style={[styles.arcWorldDot, { backgroundColor: worldColor }]} />
      <View style={styles.arcCardContent}>
        <View style={styles.arcCardTop}>
          <Text style={styles.arcCardTitle} numberOfLines={1}>{journey.title}</Text>
          {journey.isComplete ? (
            <View style={[styles.arcBadge, { backgroundColor: colors.success + '20', flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
              <Check size={10} color={colors.success} />
              <Text style={[styles.arcBadgeText, { color: colors.success }]}>Done</Text>
            </View>
          ) : (
            <View style={[styles.arcBadge, { backgroundColor: worldColor + '20' }]}>
              <Text style={[styles.arcBadgeText, { color: worldColor }]}>
                {journey.capturedChapters} of {journey.totalChapters} captured
              </Text>
            </View>
          )}
        </View>
        <View style={styles.arcProgressRow}>
          <View style={styles.arcBarTrack}>
            <View style={[styles.arcBarFill, { width: `${pct}%`, backgroundColor: worldColor }]} />
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  )
}

// ─── Skeletons ──────────────────────────────────────────────────────────────
function JourneysSkeleton({ styles, colors }: { styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  return (
    <View style={styles.arcList}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.arcCard, { gap: spacing.sm }]}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.textTertiary + '30' }} />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <View style={{ width: '60%', height: 14, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
            <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.textTertiary + '30' }} />
          </View>
        </View>
      ))}
    </View>
  )
}
