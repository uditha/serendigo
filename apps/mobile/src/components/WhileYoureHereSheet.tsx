import { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { X, Zap, Clock } from 'lucide-react-native'
import { spacing, typography } from '@/src/theme'
import type { FlashDeal } from '@/src/services/partners'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.62, 520)

// Format time remaining until expiry
function timeUntil(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍛',
  STAY: '🏡',
  EXPERIENCE: '🎭',
  TRANSPORT: '🚌',
  WELLNESS: '🧘',
  SHOP: '🛍️',
}

interface Props {
  visible: boolean
  deals: FlashDeal[]
  onDismiss: () => void
}

export function WhileYoureHereSheet({ visible, deals, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleViewPartner = (deal: FlashDeal) => {
    onDismiss()
    router.push(`/partner/${deal.partnerId}` as never)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.zapWrap}>
              <Zap size={16} color="#E8832A" fill="#E8832A" />
            </View>
            <View>
              <Text style={styles.title}>While you're here</Text>
              <Text style={styles.subtitle}>
                {deals.length} flash deal{deals.length !== 1 ? 's' : ''} nearby
              </Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={onDismiss} hitSlop={10}>
            <X size={20} color="#5A5A7A" />
          </Pressable>
        </View>

        {/* Deal cards */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {deals.map((deal) => {
            const emoji = CATEGORY_EMOJI[deal.partner.category] ?? '🏪'
            const urgent = new Date(deal.expiresAt).getTime() - Date.now() < 3 * 60 * 60 * 1000

            return (
              <Pressable
                key={deal.id}
                style={styles.dealCard}
                onPress={() => handleViewPartner(deal)}
                android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
              >
                {/* Left accent */}
                <View style={styles.dealLeft}>
                  <View style={styles.dealEmoji}>
                    <Text style={styles.dealEmojiText}>{emoji}</Text>
                  </View>
                </View>

                {/* Body */}
                <View style={styles.dealBody}>
                  <View style={styles.dealTopRow}>
                    <Text style={styles.dealTitle} numberOfLines={1}>
                      {deal.title}
                    </Text>
                    <View style={[styles.discountPill, urgent && styles.discountPillUrgent]}>
                      <Text style={[styles.discountText, urgent && styles.discountTextUrgent]}>
                        {deal.discountText}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.partnerName} numberOfLines={1}>
                    {deal.partner.name}
                    {deal.partner.isLocal ? '  🏠' : ''}
                  </Text>

                  {deal.description ? (
                    <Text style={styles.dealDesc} numberOfLines={2}>
                      {deal.description}
                    </Text>
                  ) : null}

                  <View style={styles.dealFooter}>
                    <View style={styles.timeRow}>
                      <Clock size={11} color={urgent ? '#E74C3C' : '#9A9AB0'} />
                      <Text style={[styles.timeText, urgent && styles.timeTextUrgent]}>
                        {timeUntil(deal.expiresAt)}
                      </Text>
                    </View>
                    {deal.minCoins > 0 && (
                      <Text style={styles.coinsRequired}>
                        {deal.minCoins}+ coins required
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable style={styles.doneButton} onPress={onDismiss}>
            <Text style={styles.doneButtonText}>Continue your journey →</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FDFAF5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0CBBB',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  zapWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8832A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: '#1A1A2E',
  },
  subtitle: {
    ...typography.caption,
    color: '#5A5A7A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  dealCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE8DE',
  },
  dealLeft: {
    backgroundColor: '#F7F0E3',
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  dealEmoji: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealEmojiText: { fontSize: 20 },
  dealBody: {
    flex: 1,
    padding: spacing.md,
    gap: 3,
  },
  dealTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dealTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#1A1A2E',
    flex: 1,
  },
  discountPill: {
    backgroundColor: '#E8832A18',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountPillUrgent: {
    backgroundColor: '#E74C3C18',
  },
  discountText: {
    ...typography.label,
    color: '#E8832A',
    fontSize: 10,
  },
  discountTextUrgent: {
    color: '#E74C3C',
  },
  partnerName: {
    ...typography.caption,
    color: '#5A5A7A',
  },
  dealDesc: {
    ...typography.caption,
    color: '#9A9AB0',
    lineHeight: 18,
  },
  dealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...typography.caption,
    color: '#9A9AB0',
    fontSize: 11,
  },
  timeTextUrgent: {
    color: '#E74C3C',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  coinsRequired: {
    ...typography.caption,
    color: '#9A9AB0',
    fontSize: 11,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#EDE8DE',
  },
  doneButton: {
    backgroundColor: '#E8832A',
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneButtonText: {
    ...typography.h3,
    color: 'white',
  },
})
