import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { colors, spacing, typography } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { fetchStory, type StoryXP } from '@/src/services/story'
import { fetchBadges, type UserBadge } from '@/src/services/badges'

// ─── Config ────────────────────────────────────────────────────────────────
const CHARACTER_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  TASTE:   { emoji: '🍛', label: 'The Taster',     color: colors.taste },
  WILD:    { emoji: '🐘', label: 'The Explorer',   color: colors.wild },
  MOVE:    { emoji: '🏄', label: 'The Adventurer', color: colors.move },
  ROOTS:   { emoji: '🏛️', label: 'The Historian',  color: colors.roots },
  RESTORE: { emoji: '🌿', label: 'The Wanderer',   color: colors.restore },
}

const WORLD_COLORS: Record<string, string> = {
  TASTE: colors.taste, WILD: colors.wild, MOVE: colors.move,
  ROOTS: colors.roots, RESTORE: colors.restore,
}

const XP_KEYS = ['taste', 'wild', 'move', 'roots', 'restore'] as const
const XP_LABELS: Record<string, string> = {
  taste: 'Taste', wild: 'Wild', move: 'Move', roots: 'Roots', restore: 'Restore',
}

function Skeleton({ width, height = 16, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  return <View style={{ width, height, borderRadius: radius, backgroundColor: colors.textTertiary + '30' }} />
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { top } = useSafeAreaInsets()
  const { user, isLocal, clearAuth } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['story'],
    queryFn: fetchStory,
    staleTime: 2 * 60 * 1000,
  })

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges,
    staleTime: 2 * 60 * 1000,
  })

  const character = user?.travellerCharacter ? CHARACTER_CONFIG[user.travellerCharacter] : null

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Sign Out', style: 'destructive', onPress: () => { clearAuth(); router.replace('/(tabs)') } },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>

      {/* Character hero */}
      <View style={[styles.heroCard, character && { borderColor: character.color + '50' }]}>
        {character ? (
          <>
            <View style={[styles.avatarRing, { backgroundColor: character.color + '20', borderColor: character.color + '40' }]}>
              <Text style={styles.avatarEmoji}>{character.emoji}</Text>
            </View>
            <Text style={[styles.characterName, { color: character.color }]}>{character.label}</Text>
          </>
        ) : (
          <>
            <View style={styles.avatarRingPlain}>
              <Text style={styles.avatarInitial}>
                {(user?.name ?? 'T').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Pressable
              style={styles.quizCta}
              onPress={() => router.push('/onboarding/quiz')}
            >
              <Text style={styles.quizCtaText}>✨ Discover your traveller type</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.userName}>{user?.name ?? 'Traveller'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {isLocal !== null && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>{isLocal ? '🏝️ Islander' : '✈️ Traveller'}</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsCard}>
        <StatCell
          icon="🪙"
          value={user?.serendipityCoins ?? 0}
          label="Coins"
          color={colors.coinGold}
        />
        <View style={styles.statDivider} />
        <StatCell
          icon="📸"
          value={isLoading ? '—' : (data?.stats.totalCaptures ?? 0)}
          label="Captures"
          color={colors.primary}
        />
        <View style={styles.statDivider} />
        <StatCell
          icon="🗺️"
          value={isLoading ? '—' : (data?.stats.arcsEnrolled ?? 0)}
          label="Journeys"
          color={colors.secondary}
        />
        <View style={styles.statDivider} />
        <StatCell
          icon="✓"
          value={isLoading ? '—' : (data?.stats.arcsCompleted ?? 0)}
          label="Completed"
          color={colors.success}
        />
      </View>

      {/* XP breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.card}>
          {isLoading ? (
            <View style={{ gap: spacing.sm }}>
              {XP_KEYS.map((k) => (
                <View key={k} style={styles.xpRow}>
                  <Skeleton width={52} height={12} />
                  <Skeleton width="70%" height={8} radius={4} />
                  <Skeleton width={28} height={12} />
                </View>
              ))}
            </View>
          ) : data ? (
            <XPBars xp={data.xp} />
          ) : null}
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        {badges && badges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <ProfileBadge key={badge.id} badge={badge} />
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.badgesEmpty}>
              Complete captures to unlock badges 🏅
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.actionsCard}>
          {character && (
            <ActionRow
              icon="🎭"
              label="Retake character quiz"
              onPress={() => router.push('/onboarding/quiz')}
            />
          )}
          <ActionRow
            icon="🚪"
            label="Sign out"
            onPress={handleSignOut}
            destructive
          />
        </View>
      </View>
    </ScrollView>
  )
}

// ─── Profile badge ─────────────────────────────────────────────────────────
function ProfileBadge({ badge }: { badge: UserBadge }) {
  return (
    <View style={styles.badgeCard}>
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
    </View>
  )
}

// ─── Stat cell ─────────────────────────────────────────────────────────────
function StatCell({ icon, value, label, color }: {
  icon: string
  value: number | string
  label: string
  color: string
}) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── XP Bars ───────────────────────────────────────────────────────────────
function XPBars({ xp }: { xp: StoryXP }) {
  const max = Math.max(...XP_KEYS.map((k) => xp[k]), 100)

  return (
    <View style={{ gap: spacing.sm }}>
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

// ─── Action row ────────────────────────────────────────────────────────────
function ActionRow({ icon, label, onPress, destructive }: {
  icon: string
  label: string
  onPress: () => void
  destructive?: boolean
}) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}>
        {label}
      </Text>
      <Text style={styles.actionChevron}>›</Text>
    </Pressable>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────
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

  // Hero card
  heroCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarRingPlain: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarEmoji: { fontSize: 48 },
  avatarInitial: {
    ...typography.display,
    color: 'white',
    lineHeight: 48,
  },
  characterName: {
    ...typography.h2,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  localBadge: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  localBadgeText: {
    ...typography.label,
    color: colors.secondary,
  },
  quizCta: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  quizCtaText: {
    ...typography.caption,
    color: colors.primary,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5DDD0',
    marginVertical: spacing.xs,
  },
  statIcon: { fontSize: 18 },
  statValue: {
    ...typography.h2,
  },
  statLabel: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 9,
  },

  // Section
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  // XP card
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
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
    backgroundColor: '#E5DDD0',
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

  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5DDD0',
    width: '30%',
    flexGrow: 1,
  },
  badgeIcon: { fontSize: 28 },
  badgeName: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 9,
  },
  badgesEmpty: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.md,
  },

  // Actions card
  actionsCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DDD0',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DDD0',
  },
  actionIcon: { fontSize: 18 },
  actionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  actionLabelDestructive: {
    color: colors.error,
  },
  actionChevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
})
