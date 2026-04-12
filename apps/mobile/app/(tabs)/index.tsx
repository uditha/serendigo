import { ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { CircleDollarSign, ChevronRight, Compass, QrCode } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useAuthStore } from '@/src/stores/authStore'
import { useArcs, type ArcPin } from '@/src/hooks/useArcs'
import { fetchStory, type Journey } from '@/src/services/story'

// ─── Character config — brand colors, same in light & dark ────────────────
const CHARACTER_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  TASTE:   { emoji: '🍛', label: 'The Taster',     color: '#B85C1A' },
  WILD:    { emoji: '🐘', label: 'The Explorer',   color: '#2D6E4E' },
  MOVE:    { emoji: '🏄', label: 'The Adventurer', color: '#1A5F8A' },
  ROOTS:   { emoji: '🏛️', label: 'The Historian',  color: '#614A9E' },
  RESTORE: { emoji: '🌿', label: 'The Wanderer',   color: '#5E8C6E' },
}

const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A', WILD: '#2D6E4E', MOVE: '#1A5F8A', ROOTS: '#614A9E', RESTORE: '#5E8C6E',
}

const WORLD_EMOJI: Record<string, string> = {
  TASTE: '🍜', WILD: '🌿', MOVE: '⚡', ROOTS: '🏛️', RESTORE: '🧘',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

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

  // ─── Header ───────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLeft: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.3,
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
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.coinGold + '50',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  coinsValue: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.coinGold,
  },
  coinsLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    ...typography.h3,
    color: 'white',
  },

  // ─── Character card ────────────────────────────────────────────
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  characterAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  characterIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEmoji: { fontSize: 26 },
  characterInfo: { flex: 1, gap: 2 },
  characterLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  characterName: {
    ...typography.h3,
  },
  retakeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  retakeText: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  quizPrompt: {
    backgroundColor: colors.primary + '12',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '35',
    alignItems: 'center',
  },
  quizPromptText: {
    ...typography.body,
    color: colors.primary,
  },

  // ─── Section headers ───────────────────────────────────────────
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
    fontFamily: 'SpaceGrotesk_500Medium',
  },

  // ─── Journey cards ─────────────────────────────────────────────
  section: { gap: spacing.sm },
  journeyList: { gap: spacing.sm },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  journeyAccent: {
    width: 5,
    alignSelf: 'stretch',
  },
  journeyEmojiWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    marginLeft: spacing.sm,
  },
  journeyEmoji: { fontSize: 20 },
  journeyBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
    gap: 5,
  },
  journeyTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  journeyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyProgress: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  journeyPct: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textSecondary,
  },
  journeyTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  journeyFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ─── Featured arc card ──────────────────────────────────────────
  arcCardShell: { gap: 0 },
  arcCardImage: {
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
  },
  arcCardImageFallback: {
    height: 230,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  arcFallbackEmoji: { fontSize: 80 },
  arcImageGrad: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  worldPill: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  worldPillText: {
    ...typography.label,
    color: 'white',
    letterSpacing: 0.5,
  },
  arcCardFloatBody: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
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

  // ─── Arc rows ───────────────────────────────────────────────────
  arcList: { gap: spacing.sm },
  arcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  arcRowBadge: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcRowEmoji: { fontSize: 22 },
  arcRowInfo: { flex: 1, gap: 3 },
  arcRowTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  arcRowMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // ─── Discover banner ────────────────────────────────────────────
  discoverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  discoverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  discoverIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverTitle: {
    ...typography.h3,
    color: 'white',
  },
  discoverSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.72)',
  },
  discoverArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverArrow: {
    ...typography.h3,
    color: 'white',
  },

  // ─── Redeem banner ─────────────────────────────────────────────
  redeemBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FBF7F0',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#C4956A30',
  },
  redeemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8832A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#5C3D1E',
  },
  redeemSub: {
    ...typography.caption,
    color: '#7A5230',
  },

  // ─── Empty + Error ──────────────────────────────────────────────
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // ─── Auth CTA ───────────────────────────────────────────────────
  authCta: {
    backgroundColor: colors.secondary + '12',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary + '25',
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

// ─── Screen ────────────────────────────────────────────────────────────────
export default function TodayScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
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
            <CircleDollarSign size={15} color={colors.coinGold} />
            <Text style={styles.coinsValue}>{user?.serendipityCoins ?? 0}</Text>
            <Text style={styles.coinsLabel}>coins</Text>
          </View>
        </View>
        {isLoggedIn && (
          <Pressable style={styles.avatarButton} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{(user?.name ?? 'T').charAt(0).toUpperCase()}</Text>
          </Pressable>
        )}
      </View>

      {/* Character banner */}
      {isLoggedIn && character ? (
        <View style={styles.characterCard}>
          <View style={[styles.characterAccent, { backgroundColor: character.color }]} />
          <View style={[styles.characterIconWrap, { backgroundColor: character.color + '18' }]}>
            <Text style={styles.characterEmoji}>{character.emoji}</Text>
          </View>
          <View style={styles.characterInfo}>
            <Text style={styles.characterLabel}>Your traveller type</Text>
            <Text style={[styles.characterName, { color: character.color }]}>{character.label}</Text>
          </View>
          <Pressable style={styles.retakeButton} onPress={() => router.push('/onboarding/quiz')}>
            <Text style={styles.retakeText}>Retake →</Text>
          </Pressable>
        </View>
      ) : isLoggedIn ? (
        <Pressable style={styles.quizPrompt} onPress={() => router.push('/onboarding/quiz')}>
          <Text style={styles.quizPromptText}>Discover your traveller type →</Text>
        </Pressable>
      ) : null}

      {/* Redeem coins banner — shown to logged-in users */}
      {isLoggedIn && (
        <Pressable style={styles.redeemBanner} onPress={() => router.push('/redeem/scan')}>
          <View style={styles.redeemIconWrap}>
            <QrCode size={20} color="#E8832A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.redeemTitle}>Redeem your coins</Text>
            <Text style={styles.redeemSub}>Scan a partner QR code for discounts</Text>
          </View>
          <ChevronRight size={16} color="#8B5E3C" />
        </Pressable>
      )}

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
              <JourneyCard key={journey.arcId} journey={journey} styles={styles} colors={colors} />
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
          <View style={{ height: 200, backgroundColor: colors.textTertiary + '18', borderRadius: 20 }} />
          <View style={styles.arcCardFloatBody}>
            <View style={{ width: 80, height: 11, borderRadius: 4, backgroundColor: colors.textTertiary + '28' }} />
            <View style={{ width: '65%', height: 20, borderRadius: 6, backgroundColor: colors.textTertiary + '28' }} />
            <View style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: colors.textTertiary + '28' }} />
          </View>
        </View>
      ) : featuredArc ? (
        <FeaturedArcCard arc={featuredArc} styles={styles} />
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
              <ArcRow key={arc.id} arc={arc} styles={styles} colors={colors} />
            ))}
          </View>
        </>
      )}

      {/* Discover community banner */}
      <Pressable onPress={() => router.push('/discover' as never)}>
        <LinearGradient
          colors={[colors.secondary, '#145A68']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.discoverBanner}
        >
          <View style={styles.discoverLeft}>
            <View style={styles.discoverIconWrap}>
              <Compass size={20} color="white" />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={styles.discoverTitle}>Discover</Text>
              <Text style={styles.discoverSub}>See what other explorers captured</Text>
            </View>
          </View>
          <View style={styles.discoverArrowWrap}>
            <Text style={styles.discoverArrow}>→</Text>
          </View>
        </LinearGradient>
      </Pressable>

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
function JourneyCard({ journey, styles, colors }: { journey: Journey; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const worldColor = WORLD_COLORS[journey.worldType] ?? colors.primary
  const pct = journey.totalChapters > 0
    ? (journey.capturedChapters / journey.totalChapters) * 100
    : 0

  return (
    <Pressable
      style={styles.journeyCard}
      onPress={() => router.push(`/arc/${journey.arcId}` as never)}
    >
      <View style={[styles.journeyAccent, { backgroundColor: worldColor }]} />
      <View style={[styles.journeyEmojiWrap, { backgroundColor: worldColor + '18' }]}>
        <Text style={styles.journeyEmoji}>{WORLD_EMOJI[journey.worldType]}</Text>
      </View>
      <View style={styles.journeyBody}>
        <Text style={styles.journeyTitle} numberOfLines={1}>{journey.title}</Text>
        <View style={styles.journeyMetaRow}>
          <Text style={styles.journeyProgress}>
            {journey.capturedChapters}/{journey.totalChapters} chapters
          </Text>
          <Text style={styles.journeyPct}>{Math.round(pct)}%</Text>
        </View>
        <View style={styles.journeyTrack}>
          <View style={[styles.journeyFill, { width: `${pct}%`, backgroundColor: worldColor }]} />
        </View>
      </View>
      <ChevronRight size={18} color={colors.textTertiary} style={{ marginRight: spacing.sm }} />
    </Pressable>
  )
}

// ─── Featured arc card ─────────────────────────────────────────────────────
function FeaturedArcCard({ arc, styles }: { arc: ArcPin; styles: ReturnType<typeof makeStyles> }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? '#E8832A'

  return (
    <Pressable onPress={() => router.push(`/arc/${arc.id}` as never)}>
      {arc.coverImage ? (
        <ImageBackground
          source={{ uri: arc.coverImage }}
          style={styles.arcCardImage}
          resizeMode="cover"
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
            style={styles.arcImageGrad}
          >
            <View style={[styles.worldPill, { backgroundColor: worldColor }]}>
              <Text style={styles.worldPillText}>{WORLD_EMOJI[arc.worldType]}  {arc.worldType}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={[styles.arcCardImageFallback, { backgroundColor: worldColor + '22' }]}>
          <Text style={styles.arcFallbackEmoji}>{WORLD_EMOJI[arc.worldType]}</Text>
          <View style={[styles.worldPill, { backgroundColor: worldColor, position: 'absolute', bottom: spacing.xl, left: spacing.md }]}>
            <Text style={styles.worldPillText}>{WORLD_EMOJI[arc.worldType]}  {arc.worldType}</Text>
          </View>
        </View>
      )}

      {/* Floating body card */}
      <View style={styles.arcCardFloatBody}>
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
function ArcRow({ arc, styles, colors }: { arc: ArcPin; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const worldColor = WORLD_COLORS[arc.worldType] ?? colors.primary

  return (
    <Pressable style={styles.arcRow} onPress={() => router.push(`/arc/${arc.id}` as never)}>
      <View style={[styles.arcRowBadge, { backgroundColor: worldColor + '18' }]}>
        <Text style={styles.arcRowEmoji}>{WORLD_EMOJI[arc.worldType]}</Text>
      </View>
      <View style={styles.arcRowInfo}>
        <Text style={styles.arcRowTitle} numberOfLines={1}>{arc.title}</Text>
        <Text style={styles.arcRowMeta}>
          {arc.province.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · {arc.chapters.length} chapters
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textTertiary} />
    </Pressable>
  )
}
