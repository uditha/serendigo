import { useState, useRef } from 'react'
import {
  Dimensions, Image, KeyboardAvoidingView, Linking, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, View, FlatList, TextInput,
} from 'react-native'

const SCREEN_W = Dimensions.get('window').width
import {
  ChevronLeft, MapPin, Phone, Globe, MessageCircle,
  Star, Clock, Tag, CheckCircle2, ExternalLink,
} from 'lucide-react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { getPartnerById, logContactClick, submitReview } from '@/src/services/partners'
import { useAuthStore } from '@/src/stores/authStore'

const CATEGORY_COLOR: Record<string, string> = {
  FOOD: '#B85C1A', STAY: '#1A5F8A', EXPERIENCE: '#614A9E',
  SHOP: '#2D6E4E', TRANSPORT: '#5E8C6E',
}

const DAYS: [string, string][] = [
  ['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'],
  ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun'],
]

function StarRow({ rating, size = 16, color = '#C9920A' }: { rating: number; size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} color={color} fill={i <= Math.round(rating) ? color : 'transparent'} />
      ))}
    </View>
  )
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  backText: { ...typography.body, color: colors.textSecondary },
  catBadge: { borderRadius: 20, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  catBadgeText: { ...typography.label, color: 'white', fontSize: 10 },

  // Gallery
  gallery: { width: SCREEN_W, height: 280 },
  gallerySlide: { width: SCREEN_W, height: 280 },
  galleryFallback: { width: SCREEN_W, height: 200, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 48 },
  galleryCounter: {
    position: 'absolute', bottom: spacing.sm, right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  galleryCounterText: { color: 'white', fontSize: 11, fontWeight: '600' },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 5, paddingVertical: spacing.sm,
  },

  // Content
  content: { padding: spacing.lg, gap: spacing.md },
  name: { ...typography.h1, color: colors.textPrimary, lineHeight: 34 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ratingNum: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  ratingCount: { ...typography.caption, color: colors.textTertiary },
  tagline: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 26 },
  divider: { height: 1, backgroundColor: colors.border },

  // Section
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },

  // Contact buttons
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderWidth: 1.5, flex: 1, minWidth: 140,
  },
  contactBtnText: { ...typography.body, fontWeight: '600', fontSize: 15 },

  // Price & tags
  priceText: { ...typography.h3, color: colors.textPrimary },
  priceSub: { ...typography.caption, color: colors.textTertiary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    borderRadius: 20, paddingHorizontal: spacing.sm, paddingVertical: 4,
    backgroundColor: colors.border,
  },
  tagText: { ...typography.caption, color: colors.textSecondary, fontSize: 12 },

  // Hours
  hoursCard: {
    backgroundColor: colors.surfaceWhite, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  hoursRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  hoursDay: { ...typography.body, color: colors.textSecondary, fontSize: 14 },
  hoursTime: { ...typography.body, color: colors.textPrimary, fontSize: 14 },

  // Reviews
  reviewCard: {
    backgroundColor: colors.surfaceWhite, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reviewName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { ...typography.caption, color: '#2D6E4E', fontSize: 11 },
  reviewBody: { ...typography.body, color: colors.textSecondary, lineHeight: 22, fontSize: 14 },
  reviewDate: { ...typography.caption, color: colors.textTertiary },

  // Write review
  writeBtn: {
    borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  writeBtnText: { ...typography.body, color: colors.textSecondary },

  // Review modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, gap: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  starBtn: { padding: spacing.sm },
  reviewInput: {
    ...typography.body, color: colors.textPrimary,
    backgroundColor: colors.surfaceWhite, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    minHeight: 90, textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center',
  },
  submitBtnText: { ...typography.h3, color: 'white' },
})

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const queryClient = useQueryClient()

  const [reviewModal, setReviewModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewBody, setReviewBody] = useState('')
  const [activePhoto, setActivePhoto] = useState(0)

  const { data: partner, isLoading } = useQuery({
    queryKey: ['partner', id],
    queryFn: () => getPartnerById(id!),
    enabled: !!id,
  })

  const { mutate: postReview, isPending: submitting } = useMutation({
    mutationFn: () => submitReview(id!, selectedRating, reviewBody || undefined),
    onSuccess: () => {
      setReviewModal(false)
      setSelectedRating(0)
      setReviewBody('')
      queryClient.invalidateQueries({ queryKey: ['partner', id] })
    },
  })

  if (isLoading || !partner) {
    return (
      <View style={styles.container}>
        <View style={[styles.heroFallback, { backgroundColor: colors.border + '40', height: 120 }]} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[180, 120, 80].map((w, i) => (
            <View key={i} style={{ width: w, height: 14, borderRadius: 7, backgroundColor: colors.border }} />
          ))}
        </View>
      </View>
    )
  }

  const catColor = CATEGORY_COLOR[partner.category] ?? colors.primary
  const hours = partner.openingHours ?? {}
  const hasHours = Object.keys(hours).filter((k) => k !== 'note').length > 0

  const openWhatsApp = () => {
    if (!partner.whatsapp) return
    logContactClick(partner.id)
    Linking.openURL(`https://wa.me/${partner.whatsapp.replace(/[^0-9]/g, '')}`)
  }
  const openPhone = () => {
    if (!partner.phone) return
    logContactClick(partner.id)
    Linking.openURL(`tel:${partner.phone}`)
  }
  const openWebsite = () => {
    if (!partner.website) return
    logContactClick(partner.id)
    Linking.openURL(partner.website)
  }
  const openMaps = () => {
    logContactClick(partner.id)
    Linking.openURL(`https://maps.google.com/?q=${partner.lat},${partner.lng}`)
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: top + spacing.xs }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={18} color={colors.textPrimary} />
          <Text style={styles.backText} numberOfLines={1}>{partner.name}</Text>
        </Pressable>
        <View style={[styles.catBadge, { backgroundColor: catColor }]}>
          <Text style={styles.catBadgeText}>{partner.category}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: top + 52, paddingBottom: spacing.xxl }}>

        {/* Photo gallery */}
        {partner.photos.length > 0 ? (
          <View>
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={partner.photos}
              keyExtractor={(u, i) => u + i}
              style={styles.gallery}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
                setActivePhoto(idx)
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.gallerySlide} resizeMode="cover" />
              )}
            />
            {/* Counter pill */}
            {partner.photos.length > 1 && (
              <View style={styles.galleryCounter}>
                <Text style={styles.galleryCounterText}>
                  {activePhoto + 1} / {partner.photos.length}
                </Text>
              </View>
            )}
            {/* Dot indicators */}
            {partner.photos.length > 1 && (
              <View style={styles.dotsRow}>
                {partner.photos.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === activePhoto ? 16 : 6,
                      height: 6, borderRadius: 3,
                      backgroundColor: i === activePhoto ? catColor : colors.border,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.galleryFallback, { backgroundColor: catColor + '18' }]}>
            <Text style={styles.heroEmoji}>
              {{ FOOD: '🍛', STAY: '🏨', EXPERIENCE: '🎭', SHOP: '🛍️', TRANSPORT: '🚗' }[partner.category] ?? '📍'}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Name + rating */}
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.name}>{partner.name}</Text>
            {partner.avgRating !== null ? (
              <View style={styles.ratingRow}>
                <StarRow rating={partner.avgRating} size={15} />
                <Text style={styles.ratingNum}>{partner.avgRating}</Text>
                <Text style={styles.ratingCount}>({partner.reviewCount} reviews)</Text>
              </View>
            ) : (
              <Text style={styles.ratingCount}>No reviews yet — be the first</Text>
            )}
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>"{partner.tagline}"</Text>

          {/* Community impact card — only for family-run partners */}
          {partner.isLocal && (
            <View style={{
              backgroundColor: '#FBF7F0',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#C4956A30',
              borderLeftWidth: 3,
              borderLeftColor: '#8B5E3C',
              padding: spacing.md,
              gap: spacing.xs,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ fontSize: 18 }}>🏠</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#5C3D1E' }}>
                  Family run & independently owned
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#7A5230', lineHeight: 18 }}>
                A Sri Lankan family operates this place — not a chain or resort. When you eat here, stay here, or book through them, your money goes directly to the people who live in this community.
              </Text>
              <Text style={{ fontSize: 11, color: '#8B5E3C', fontStyle: 'italic', marginTop: 2 }}>
                SerendiGO recommends choosing family-run wherever you can.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.description}>{partner.description}</Text>

          <View style={styles.divider} />

          {/* Contact buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get in touch</Text>
            <View style={styles.contactGrid}>
              {partner.whatsapp && (
                <Pressable style={[styles.contactBtn, { borderColor: '#25D366', backgroundColor: '#25D36612' }]} onPress={openWhatsApp}>
                  <MessageCircle size={18} color="#25D366" />
                  <Text style={[styles.contactBtnText, { color: '#25D366' }]}>WhatsApp</Text>
                </Pressable>
              )}
              {partner.phone && (
                <Pressable style={[styles.contactBtn, { borderColor: catColor, backgroundColor: catColor + '12' }]} onPress={openPhone}>
                  <Phone size={18} color={catColor} />
                  <Text style={[styles.contactBtnText, { color: catColor }]}>Call</Text>
                </Pressable>
              )}
              {partner.website && (
                <Pressable style={[styles.contactBtn, { borderColor: colors.border }]} onPress={openWebsite}>
                  <Globe size={18} color={colors.textSecondary} />
                  <Text style={[styles.contactBtnText, { color: colors.textSecondary }]}>Website</Text>
                </Pressable>
              )}
              <Pressable style={[styles.contactBtn, { borderColor: colors.border }]} onPress={openMaps}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text style={[styles.contactBtnText, { color: colors.textSecondary }]}>Maps</Text>
              </Pressable>
            </View>
            {partner.district && (
              <Text style={[styles.ratingCount, { marginTop: 2 }]}>
                {[partner.district, partner.province.replace(/_/g, ' ')].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Price */}
          {(partner.priceMin !== null || partner.priceMax !== null) && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price</Text>
                <Text style={styles.priceText}>
                  {partner.priceMin && partner.priceMax
                    ? `USD ${partner.priceMin} – ${partner.priceMax}`
                    : partner.priceMin
                    ? `From USD ${partner.priceMin}`
                    : `Up to USD ${partner.priceMax}`}
                </Text>
                <Text style={styles.priceSub}>Per person / per visit</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Opening hours */}
          {hasHours && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Opening hours</Text>
                <View style={styles.hoursCard}>
                  {DAYS.map(([key, label]) =>
                    hours[key] ? (
                      <View key={key} style={styles.hoursRow}>
                        <Text style={styles.hoursDay}>{label}</Text>
                        <Text style={styles.hoursTime}>{hours[key]}</Text>
                      </View>
                    ) : null
                  )}
                  {hours.note && (
                    <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
                      <Clock size={13} color={colors.textTertiary} />
                      <Text style={[styles.hoursDay, { color: colors.textTertiary, flex: 1 }]}>{hours.note}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Tags */}
          {partner.tags.length > 0 && (
            <>
              <View style={styles.section}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Tag size={16} color={colors.textTertiary} />
                  <View style={styles.tagsRow}>
                    {partner.tags.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews {partner.reviewCount > 0 ? `(${partner.reviewCount})` : ''}
            </Text>

            {partner.reviews.length === 0 ? (
              <Text style={[styles.ratingCount, { marginBottom: spacing.sm }]}>
                No reviews yet. Be the first to share your experience.
              </Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {partner.reviews.slice(0, 10).map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={{ gap: 2 }}>
                        <Text style={styles.reviewName}>{r.user.name ?? 'Explorer'}</Text>
                        {r.isVerified && (
                          <View style={styles.verifiedRow}>
                            <CheckCircle2 size={11} color="#2D6E4E" />
                            <Text style={styles.verifiedText}>Verified visitor</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <StarRow rating={r.rating} size={13} />
                        <Text style={styles.reviewDate}>{timeAgo(r.createdAt)}</Text>
                      </View>
                    </View>
                    {r.body && <Text style={styles.reviewBody}>{r.body}</Text>}
                  </View>
                ))}
              </View>
            )}

            {isLoggedIn && (
              <Pressable style={styles.writeBtn} onPress={() => setReviewModal(true)}>
                <Text style={styles.writeBtnText}>
                  {partner.reviews.some((r) => r.user.id)
                    ? 'Leave a review'
                    : '★  ' + ({
                        FOOD: 'Review this meal',
                        STAY: 'Review your stay',
                        EXPERIENCE: 'Review this experience',
                        SHOP: 'Rate this shop',
                        TRANSPORT: 'Rate this service',
                      }[partner.category] ?? 'Rate this place')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review modal */}
      <Modal visible={reviewModal} transparent animationType="slide" onRequestClose={() => setReviewModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <Pressable style={styles.modalBg} onPress={() => setReviewModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {({ FOOD: 'How was the food?', STAY: 'How was your stay?', EXPERIENCE: 'How was the experience?', SHOP: 'How was the shop?', TRANSPORT: 'How was the service?' }[partner.category] ?? 'Rate your visit')}
            </Text>

            {/* Star picker */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} style={styles.starBtn} onPress={() => setSelectedRating(n)}>
                  <Star size={36} color="#C9920A" fill={n <= selectedRating ? '#C9920A' : 'transparent'} />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.reviewInput, { color: colors.textPrimary }]}
              placeholder="Share what you loved (optional)"
              placeholderTextColor={colors.textTertiary}
              value={reviewBody}
              onChangeText={setReviewBody}
              multiline
              maxLength={400}
            />

            <Pressable
              style={[styles.submitBtn, { backgroundColor: selectedRating > 0 ? catColor : colors.border }]}
              onPress={() => selectedRating > 0 && postReview()}
              disabled={selectedRating === 0 || submitting}
            >
              <Text style={[styles.submitBtnText, { color: selectedRating > 0 ? 'white' : colors.textTertiary }]}>
                {submitting ? 'Submitting…' : 'Submit review'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}
