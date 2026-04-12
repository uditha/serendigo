import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { MessageCircle, Star, MapPin, Phone } from 'lucide-react-native'
import { router } from 'expo-router'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { logContactClick, type PartnerSummary } from '@/src/services/partners'

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍛', STAY: '🏨', EXPERIENCE: '🎭', SHOP: '🛍️', TRANSPORT: '🚗',
}

const CATEGORY_COLOR: Record<string, string> = {
  FOOD: '#B85C1A', STAY: '#1A5F8A', EXPERIENCE: '#614A9E',
  SHOP: '#2D6E4E', TRANSPORT: '#5E8C6E',
}

function formatDistance(m: number) {
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

function formatPrice(min: number | null, max: number | null) {
  if (!min && !max) return null
  if (min && max) return `USD ${min}–${max}`
  if (min) return `From USD ${min}`
  return `Up to USD ${max}`
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    height: 100,
  },
  featuredCard: {
    borderColor: '#C9920A40',
    backgroundColor: '#C9920A08',
  },
  photo: {
    width: 100,
    height: '100%',
  },
  photoFallback: {
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 32,
  },
  body: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  topRow: {
    gap: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  categoryBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    ...typography.label,
    color: 'white',
    fontSize: 9,
  },
  featuredBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#C9920A',
  },
  featuredText: {
    ...typography.label,
    color: 'white',
    fontSize: 9,
  },
  localBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#C4956A40',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  localText: {
    ...typography.label,
    color: '#8B5E3C',
    fontSize: 9,
  },
  name: {
    ...typography.body,
    color: '#1A1A2E',
    fontWeight: '600',
    fontSize: 14,
  },
  tagline: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    ...typography.caption,
    fontSize: 11,
  },
  distanceText: {
    ...typography.caption,
    fontSize: 11,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#25D36620',
  },
  waBtnText: {
    ...typography.label,
    color: '#25D366',
    fontSize: 10,
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
})

interface Props {
  partner: PartnerSummary
  whatsapp?: string | null
  phone?: string | null
  showDistance?: boolean
}

export function PartnerCard({ partner, whatsapp, phone, showDistance = true }: Props) {
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const catColor = CATEGORY_COLOR[partner.category] ?? colors.primary
  const priceLabel = formatPrice(partner.priceMin, partner.priceMax)

  const openWhatsApp = (e: any) => {
    e.stopPropagation?.()
    logContactClick(partner.id)
    const number = whatsapp?.replace(/[^0-9]/g, '')
    Linking.openURL(`https://wa.me/${number}`)
  }

  const openPhone = (e: any) => {
    e.stopPropagation?.()
    logContactClick(partner.id)
    Linking.openURL(`tel:${phone}`)
  }

  return (
    <Pressable
      style={[styles.card, partner.isFeatured && styles.featuredCard]}
      onPress={() => router.push(`/partner/${partner.id}` as never)}
    >
      {/* Photo or emoji fallback */}
      {partner.photos[0] ? (
        <Image source={{ uri: partner.photos[0] }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photoFallback, { backgroundColor: catColor + '18' }]}>
          <Text style={styles.photoEmoji}>{CATEGORY_EMOJI[partner.category]}</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
              <Text style={styles.categoryText}>{partner.category}</Text>
            </View>
            {partner.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>✦ Featured</Text>
              </View>
            )}
            {partner.isLocal && (
              <View style={styles.localBadge}>
                <Text style={{ fontSize: 9 }}>🏠</Text>
                <Text style={styles.localText}>Family run</Text>
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {partner.name}
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]} numberOfLines={2}>
            {partner.tagline}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {partner.avgRating !== null && (
              <View style={styles.ratingRow}>
                <Star size={11} color="#C9920A" fill="#C9920A" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {partner.avgRating}
                </Text>
              </View>
            )}
            {showDistance && partner.distanceM !== undefined && (
              <View style={styles.ratingRow}>
                <MapPin size={11} color={colors.textTertiary} />
                <Text style={[styles.distanceText, { color: colors.textTertiary }]}>
                  {formatDistance(partner.distanceM)}
                </Text>
              </View>
            )}
            {priceLabel && (
              <Text style={[styles.distanceText, { color: colors.textTertiary }]}>
                {priceLabel}
              </Text>
            )}
          </View>

          {whatsapp ? (
            <Pressable style={styles.waBtn} onPress={openWhatsApp} hitSlop={8}>
              <MessageCircle size={11} color="#25D366" />
              <Text style={styles.waBtnText}>WhatsApp</Text>
            </Pressable>
          ) : phone ? (
            <Pressable style={[styles.phoneBtn, { backgroundColor: catColor + '15' }]} onPress={openPhone} hitSlop={8}>
              <Phone size={11} color={catColor} />
              <Text style={[styles.waBtnText, { color: catColor }]}>Call</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}
