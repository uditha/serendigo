import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Clock, MapPin, Zap } from 'lucide-react-native'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useFlashDeals } from '@/src/hooks/useFlashDeals'
import type { FlashDeal } from '@/src/services/partners'

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍛',
  STAY: '🏡',
  EXPERIENCE: '🎭',
  TRANSPORT: '🚌',
  WELLNESS: '🧘',
  SHOP: '🛍️',
}

function timeUntil(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

function formatDistance(m?: number) {
  if (!m) return null
  if (m < 1000) return `${Math.round(m)}m away`
  return `${(m / 1000).toFixed(1)}km away`
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Loading / empty
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Deal card
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardEmoji: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmojiText: { fontSize: 26 },
  cardBody: { flex: 1, gap: 3 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: colors.primary + '18',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  discountBadgeUrgent: {
    backgroundColor: colors.error + '18',
  },
  discountText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 10,
  },
  discountTextUrgent: {
    color: colors.error,
  },
  partnerName: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 11,
  },
  metaTextUrgent: {
    color: colors.error,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Description
  descriptionWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coinsText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  viewButtonText: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: 'white',
  },
})

function DealCard({ deal, styles, colors }: { deal: FlashDeal; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const emoji = CATEGORY_EMOJI[deal.partner.category] ?? '🏪'
  const urgent = new Date(deal.expiresAt).getTime() - Date.now() < 3 * 60 * 60 * 1000
  const dist = formatDistance((deal.partner as any).distanceM)

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/partner/${deal.partnerId}` as never)}
      android_ripple={{ color: 'rgba(0,0,0,0.04)' }}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardEmoji}>
          <Text style={styles.cardEmojiText}>{emoji}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>{deal.title}</Text>
            <View style={[styles.discountBadge, urgent && styles.discountBadgeUrgent]}>
              <Text style={[styles.discountText, urgent && styles.discountTextUrgent]}>
                {deal.discountText}
              </Text>
            </View>
          </View>
          <Text style={styles.partnerName} numberOfLines={1}>
            {deal.partner.name}{deal.partner.isLocal ? '  🏠' : ''}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={11} color={urgent ? colors.error : colors.textTertiary} />
              <Text style={[styles.metaText, urgent && styles.metaTextUrgent]}>
                {timeUntil(deal.expiresAt)}
              </Text>
            </View>
            {dist && (
              <View style={styles.metaItem}>
                <MapPin size={11} color={colors.textTertiary} />
                <Text style={styles.metaText}>{dist}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {deal.description ? (
        <View style={styles.descriptionWrap}>
          <Text style={styles.description} numberOfLines={3}>{deal.description}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.coinsRow}>
          {deal.minCoins > 0 ? (
            <>
              <Zap size={13} color={colors.coinGold} />
              <Text style={styles.coinsText}>Requires {deal.minCoins}+ coins</Text>
            </>
          ) : (
            <Text style={styles.coinsText}>No coins required</Text>
          )}
        </View>
        <Pressable style={styles.viewButton} onPress={() => router.push(`/partner/${deal.partnerId}` as never)}>
          <Text style={styles.viewButtonText}>View partner →</Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

export default function FlashDealsScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const { data: deals, isLoading, coords } = useFlashDeals()

  const activeDeals = deals?.filter(
    (d) => new Date(d.expiresAt).getTime() > Date.now()
  ) ?? []

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Flash Deals ⚡</Text>
          <Text style={styles.headerSub}>
            {coords ? 'Deals near your location' : 'Getting your location…'}
          </Text>
        </View>
      </View>

      {isLoading || !coords ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyBody}>Finding deals near you…</Text>
        </View>
      ) : activeDeals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🌴</Text>
          <Text style={styles.emptyTitle}>No deals nearby right now</Text>
          <Text style={styles.emptyBody}>
            Check back later — partners post flash deals throughout the day
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} styles={styles} colors={colors} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
