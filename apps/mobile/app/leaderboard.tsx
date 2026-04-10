import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { colors, spacing, typography } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { fetchLeaderboard, type LeaderboardEntry } from '@/src/services/leaderboard'

const CHARACTER_EMOJI: Record<string, string> = {
  TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
}

const RANK_COLORS = ['#F1C40F', '#BDC3C7', '#CD7F32']
const RANK_LABELS = ['🥇', '🥈', '🥉']

function Skeleton({ width, height = 16, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  return <View style={{ width, height, borderRadius: radius, backgroundColor: colors.textTertiary + '30' }} />
}

export default function LeaderboardScreen() {
  const { top } = useSafeAreaInsets()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 2 * 60 * 1000,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    setRefreshing(false)
  }

  const myRank = data?.find((e) => e.id === user?.id)

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
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top Explorers</Text>
      </View>

      {/* My rank card — only if logged in and on the board */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your ranking</Text>
          <View style={styles.myRankRow}>
            <Text style={styles.myRankNumber}>#{myRank.rank}</Text>
            <Text style={styles.myRankCoins}>🪙 {myRank.serendipityCoins}</Text>
          </View>
        </View>
      )}

      {/* Top 3 podium */}
      {!isLoading && data && data.length >= 3 && (
        <View style={styles.podium}>
          {/* 2nd place */}
          <PodiumCard entry={data[1]} highlight={data[1].id === user?.id} />
          {/* 1st place */}
          <PodiumCard entry={data[0]} tall highlight={data[0].id === user?.id} />
          {/* 3rd place */}
          <PodiumCard entry={data[2]} highlight={data[2].id === user?.id} />
        </View>
      )}

      {/* Full list */}
      <View style={styles.list}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.rowSkeleton}>
              <Skeleton width={28} height={28} radius={14} />
              <Skeleton width={28} height={28} radius={14} />
              <View style={{ flex: 1, gap: 4 }}>
                <Skeleton width="50%" height={14} />
                <Skeleton width="30%" height={11} />
              </View>
              <Skeleton width={50} height={14} />
            </View>
          ))
        ) : !data || data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏝️</Text>
            <Text style={styles.emptyTitle}>No explorers yet</Text>
            <Text style={styles.emptyBody}>Be the first to capture a moment and claim the top spot.</Text>
          </View>
        ) : (
          data.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              isMe={entry.id === user?.id}
            />
          ))
        )}
      </View>
    </ScrollView>
  )
}

function PodiumCard({ entry, tall, highlight }: { entry: LeaderboardEntry; tall?: boolean; highlight?: boolean }) {
  const emoji = entry.travellerCharacter ? CHARACTER_EMOJI[entry.travellerCharacter] : '🧳'
  const medal = RANK_LABELS[entry.rank - 1]
  const color = RANK_COLORS[entry.rank - 1]

  return (
    <View style={[styles.podiumCard, tall && styles.podiumCardTall, highlight && styles.podiumCardMe]}>
      <Text style={styles.podiumMedal}>{medal}</Text>
      <View style={[styles.podiumAvatar, { backgroundColor: color + '30', borderColor: color }]}>
        <Text style={styles.podiumEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.name?.split(' ')[0] ?? 'Traveller'}
      </Text>
      <Text style={styles.podiumCoins}>🪙 {entry.serendipityCoins}</Text>
    </View>
  )
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const emoji = entry.travellerCharacter ? CHARACTER_EMOJI[entry.travellerCharacter] : '🧳'
  const medal = entry.rank <= 3 ? RANK_LABELS[entry.rank - 1] : null

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <Text style={styles.rowRank}>
        {medal ?? `#${entry.rank}`}
      </Text>
      <View style={[styles.rowAvatar, isMe && styles.rowAvatarMe]}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
          {entry.name ?? 'Traveller'}{isMe ? ' (you)' : ''}
        </Text>
        <Text style={styles.rowCaptures}>{entry.totalCaptures} captures</Text>
      </View>
      <Text style={[styles.rowCoins, isMe && styles.rowCoinsMe]}>
        🪙 {entry.serendipityCoins}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  backLink: { marginBottom: spacing.xs },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  header: {
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

  // My rank
  myRankCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    gap: spacing.xs,
  },
  myRankLabel: {
    ...typography.label,
    color: colors.primary,
  },
  myRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRankNumber: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  myRankCoins: {
    ...typography.h3,
    color: colors.coinGold,
  },

  // Podium
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  podiumCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5DDD0',
    height: 160,
    justifyContent: 'flex-end',
  },
  podiumCardTall: {
    height: 190,
  },
  podiumCardMe: {
    borderColor: colors.primary,
    backgroundColor: '#FFF8F0',
  },
  podiumMedal: { fontSize: 22 },
  podiumAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumEmoji: { fontSize: 22 },
  podiumName: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 10,
  },
  podiumCoins: {
    ...typography.caption,
    color: colors.coinGold,
    fontSize: 12,
  },

  // List
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  rowMe: {
    borderColor: colors.primary + '60',
    backgroundColor: '#FFF8F0',
  },
  rowRank: {
    ...typography.h3,
    color: colors.textTertiary,
    width: 32,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowAvatarMe: {
    backgroundColor: colors.primary + '20',
  },
  rowEmoji: { fontSize: 18 },
  rowInfo: { flex: 1, gap: 2 },
  rowName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowNameMe: {
    color: colors.primary,
  },
  rowCaptures: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  rowCoins: {
    ...typography.h3,
    color: colors.textSecondary,
    fontSize: 14,
  },
  rowCoinsMe: {
    color: colors.coinGold,
  },

  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  rowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
})
