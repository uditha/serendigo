import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { colors, spacing, typography } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { useArcs, type ArcPin } from '@/src/hooks/useArcs'
import { fetchStory, type Journey } from '@/src/services/story'

// ─── Character config ──────────────────────────────────────────────────────
const CHARACTER_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  TASTE:   { emoji: '🍛', label: 'The Taster',     color: colors.taste },
  WILD:    { emoji: '🐘', label: 'The Explorer',   color: colors.wild },
  MOVE:    { emoji: '🏄', label: 'The Adventurer', color: colors.move },
  ROOTS:   { emoji: '🏛️', label: 'The Historian',  color: colors.roots },
  RESTORE: { emoji: '🌿', label: 'The Wanderer',   color: colors.restore },
}

const WORLD_COLORS: Record<string, string> = {
  TASTE: colors.taste,
  WILD: colors.wild,
  MOVE: colors.move,
  ROOTS: colors.roots,
  RESTORE: colors.restore,
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍛',
  WILD: '🐘',
  MOVE: '🏄',
  ROOTS: '🏛️',
  RESTORE: '🌿',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Skeleton({ width, height = 16, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  return <View style={{ width, height, borderRadius: radius, backgroundColor: colors.textTertiary + '30' }} />
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function TodayScreen() {
  const { top } = useSafeAreaInsets()
  const { user, isLoggedIn, isLocal, refreshUser } = useAuthStore()
  const queryClient = useQueryClient()
  const { data: arcs, isLoading: arcsLoading } = useArcs()

  const { data: story } = useQuery({
    queryKey: ['story'],
    queryFn: fetchStory,
    enabled: isLoggedIn,
  })

  const allActiveJourneys = story?.journeys.filter((j) => !j.isComplete) ?? []
  const activeJourneys = allActiveJourneys
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 3)

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      refreshUser(),
      queryClient.invalidateQueries({ queryKey: ['arcs'] }),
      queryClient.invalidateQueries({ queryKey: ['story'] }),
    ])
    setRefreshing(false)
  }

  const character = user?.travellerCharacter ? CHARACTER_CONFIG[user.travellerCharacter] : null

  const contextualGreeting = isLocal === true
    ? 'Rediscover your island'
    : isLocal === false
    ? 'Welcome to Sri Lanka'
    : getGreeting()

  // Featured: match character worldType first, else first arc
  const featuredArc = arcs?.find(
    (a) => user?.travellerCharacter && a.worldType === user.travellerCharacter
  ) ?? arcs?.[0]

  const otherArcs = arcs?.filter((a) => a.id !== featuredArc?.id) ?? []

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Greeting + avatar */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <Text style={styles.greeting}>{contextualGreeting}</Text>
          <Text style={styles.userName} numberOfLines={1}>{user?.name ?? 'Traveller'}</Text>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsIcon}>🪙</Text>
            <Text style={styles.coinsValue}>{user?.serendipityCoins ?? 0}</Text>
          </View>
        </View>
        {isLoggedIn && (
          <Pressable
            style={styles.avatarButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.avatarText}>
              {(user?.name ?? 'T').charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Character banner */}
      {isLoggedIn && character ? (
        <View style={[styles.characterCard, { borderColor: character.color + '50' }]}>
          <View style={[styles.characterIconWrap, { backgroundColor: character.color + '20' }]}>
            <Text style={styles.characterEmoji}>{character.emoji}</Text>
          </View>
          <View style={styles.characterInfo}>
            <Text style={styles.characterLabel}>Your traveller type</Text>
            <Text style={[styles.characterName, { color: character.color }]}>{character.label}</Text>
          </View>
          <Pressable style={styles.retakeButton} onPress={() => router.push('/onboarding/quiz')}>
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
        </View>
      ) : isLoggedIn ? (
        <Pressable style={styles.quizPrompt} onPress={() => router.push('/onboarding/quiz')}>
          <Text style={styles.quizPromptText}>✨  Discover your traveller type →</Text>
        </Pressable>
      ) : null}

      {/* Active journeys */}
      {activeJourneys.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue your journey</Text>
            {allActiveJourneys.length > 3 && (
              <Pressable onPress={() => router.push('/(tabs)/story' as never)}>
                <Text style={styles.seeAll}>See all ({allActiveJourneys.length}) →</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.journeyList}>
            {activeJourneys.map((journey) => (
              <JourneyCard key={journey.arcId} journey={journey} />
            ))}
          </View>
        </View>
      )}

      {/* Featured arc */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {character ? `${character.label} picks` : isLocal ? 'Explore your island' : 'Featured Journey'}
        </Text>
        <Pressable onPress={() => router.push('/arc' as never)}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>

      {arcsLoading ? (
        <View style={styles.arcCardShell}>
          <View style={{ height: 120, backgroundColor: colors.textTertiary + '20' }} />
          <View style={{ padding: spacing.md, gap: spacing.sm }}>
            <Skeleton width={80} height={12} />
            <Skeleton width="70%" height={22} />
            <Skeleton width="50%" height={14} />
          </View>
        </View>
      ) : featuredArc ? (
        <FeaturedArcCard arc={featuredArc} />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No journeys available yet — check back soon</Text>
        </View>
      )}

      {/* Other arcs */}
      {!arcsLoading && otherArcs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>More Journeys</Text>
          <View style={styles.arcList}>
            {otherArcs.map((arc) => (
              <ArcRow key={arc.id} arc={arc} />
            ))}
          </View>
        </>
      )}

      {/* Sign in CTA */}
      {!isLoggedIn && (
        <View style={styles.authCta}>
          <Text style={styles.authCtaText}>Sign in to track your journey and earn stamps</Text>
          <Pressable style={styles.authCtaButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.authCtaButtonText}>Sign In</Text>
          </Pressable>
        </View>
      )}

    </ScrollView>
  )
}

// ─── Journey card ──────────────────────────────────────────────────────────
function JourneyCard({ journey }: { journey: Journey }) {
  const worldColor = WORLD_COLORS[journey.worldType] ?? colors.primary
  const pct = journey.totalChapters > 0
    ? (journey.capturedChapters / journey.totalChapters) * 100
    : 0

  return (
    <Pressable
      style={styles.journeyCard}
      onPress={() => router.push(`/arc/${journey.arcId}` as never)}
    >
      <View style={[styles.journeyColorBar, { backgroundColor: worldColor }]} />
      <View style={styles.journeyBody}>
        <Text style={styles.journeyTitle} numberOfLines={1}>{journey.title}</Text>
        <View style={styles.journeyMeta}>
          <Text style={styles.journeyProgress}>
            {journey.capturedChapters}/{journey.totalChapters} chapters
          </Text>
        </View>
        <View style={styles.journeyTrack}>
          <View style={[styles.journeyFill, { width: `${pct}%`, backgroundColor: worldColor }]} />
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  )
}

// ─── Featured arc card ─────────────────────────────────────────────────────
function FeaturedArcCard({ arc }: { arc: ArcPin }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary

  return (
    <Pressable style={styles.arcCard} onPress={() => router.push(`/arc/${arc.id}` as never)}>
      <View style={[styles.arcCardHeader, { backgroundColor: worldColor + '25' }]}>
        <View style={[styles.worldBadge, { backgroundColor: worldColor }]}>
          <Text style={styles.worldBadgeText}>{arc.worldType}</Text>
        </View>
        <Text style={styles.arcCardEmoji}>{WORLD_EMOJI[arc.worldType] ?? '✨'}</Text>
      </View>
      <View style={styles.arcCardBody}>
        <Text style={styles.arcCardTitle} numberOfLines={2}>{arc.title}</Text>
        <View style={styles.arcCardMeta}>
          <Text style={styles.arcCardMetaText}>
            {arc.chapters.length} {arc.chapters.length === 1 ? 'chapter' : 'chapters'}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.arcCardMetaText}>
            {arc.province.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <View style={[styles.startButton, { backgroundColor: worldColor }]}>
          <Text style={styles.startButtonText}>Start journey →</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Arc row ───────────────────────────────────────────────────────────────
function ArcRow({ arc }: { arc: ArcPin }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary

  return (
    <Pressable style={styles.arcRow} onPress={() => router.push(`/arc/${arc.id}` as never)}>
      <View style={[styles.arcRowDot, { backgroundColor: worldColor }]} />
      <View style={styles.arcRowInfo}>
        <Text style={styles.arcRowTitle} numberOfLines={1}>{arc.title}</Text>
        <Text style={styles.arcRowMeta}>{arc.worldType} · {arc.chapters.length} chapters</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
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

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  userName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5DDD0',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: 'white',
  },
  coinsIcon: { fontSize: 16 },
  coinsValue: {
    ...typography.h3,
    color: colors.coinGold,
  },

  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1.5,
  },
  characterIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEmoji: { fontSize: 24 },
  characterInfo: { flex: 1, gap: 2 },
  characterLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  characterName: { ...typography.h3 },
  retakeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  retakeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  quizPrompt: {
    backgroundColor: colors.primary + '15',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
  },
  quizPromptText: {
    ...typography.body,
    color: colors.primary,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
  },

  arcCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  arcCardShell: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  arcCardHeader: {
    height: 120,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  arcCardEmoji: { fontSize: 52 },
  arcCardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  arcCardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  arcCardMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  arcCardMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  startButtonText: {
    ...typography.h3,
    color: 'white',
  },

  section: { gap: spacing.sm },
  journeyList: { gap: spacing.sm },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  journeyColorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  journeyBody: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  journeyTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  journeyMeta: {
    flexDirection: 'row',
  },
  journeyProgress: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  journeyTrack: {
    height: 4,
    backgroundColor: '#E5DDD0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  journeyFill: {
    height: '100%',
    borderRadius: 2,
  },

  arcList: { gap: spacing.sm },
  arcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  arcRowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  arcRowInfo: { flex: 1, gap: 2 },
  arcRowTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  arcRowMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  chevron: {
    fontSize: 22,
    color: colors.textTertiary,
  },

  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  authCta: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  authCtaText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  authCtaButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  authCtaButtonText: {
    ...typography.h3,
    color: 'white',
  },
})
