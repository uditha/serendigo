import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, CheckCircle } from 'lucide-react-native'
import { spacing, typography } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useAuthStore } from '@/src/stores/authStore'
import {
  getPartnerOffers,
  redeemOffer,
  type CoinOffer,
} from '@/src/services/redemption'

const CATEGORY_COLOR: Record<string, string> = {
  FOOD: '#B85C1A',
  STAY: '#1A5F8A',
  EXPERIENCE: '#614A9E',
  SHOP: '#2D6E4E',
  TRANSPORT: '#5E8C6E',
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍛',
  STAY: '🏨',
  EXPERIENCE: '🎭',
  SHOP: '🛍️',
  TRANSPORT: '🚗',
}

export default function RedeemScreen() {
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>()
  const { top, bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const userCoins = user?.serendipityCoins ?? 0

  const [selected, setSelected] = useState<CoinOffer | null>(null)
  const [receipt, setReceipt] = useState<{
    code: string
    discount: number
    coinsSpent: number
    coinsRemaining: number
  } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['partner-offers', partnerId],
    queryFn: () => getPartnerOffers(partnerId!),
    enabled: !!partnerId,
    staleTime: 0,          // always fetch fresh — offers change in admin
    refetchOnMount: 'always',
  })

  const { mutate: redeem, isPending } = useMutation({
    mutationFn: () => redeemOffer(selected!.id),
    onSuccess: (result) => {
      setReceipt({
        code: result.confirmationCode,
        discount: result.discountPercent,
        coinsSpent: result.coinsSpent,
        coinsRemaining: result.coinsRemaining,
      })
      queryClient.invalidateQueries({ queryKey: ['story'] })
      refreshUser()
    },
    onError: (err: Error) => {
      Alert.alert('Could not redeem', err.message ?? 'Please try again.')
    },
  })

  const handleRedeem = () => {
    if (!selected) return
    Alert.alert(
      `Spend ${selected.coinsRequired} coins?`,
      `You'll get ${selected.discountPercent}% off at ${data?.partner.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => redeem() },
      ],
    )
  }

  // ─── Receipt screen ────────────────────────────────────────────────────────
  if (receipt) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: top }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#2D6E4E18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={40} color="#2D6E4E" />
          </View>

          <Text
            style={{ ...typography.h1, color: colors.textPrimary, textAlign: 'center' }}
          >
            {receipt.discount}% off unlocked!
          </Text>
          <Text
            style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}
          >
            Show this code to the cashier
          </Text>

          {/* Big confirmation code */}
          <View
            style={{
              backgroundColor: colors.surfaceWhite,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: '#2D6E4E40',
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xxl,
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.textTertiary,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Confirmation code
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontFamily: 'SpaceGrotesk_700Bold',
                color: '#2D6E4E',
                letterSpacing: 6,
              }}
            >
              {receipt.code}
            </Text>
          </View>

          {/* Coin summary */}
          <View
            style={{
              backgroundColor: colors.surfaceWhite,
              borderRadius: 14,
              padding: spacing.md,
              gap: spacing.xs,
              alignSelf: 'stretch',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...typography.body, color: colors.textSecondary }}>
                Coins spent
              </Text>
              <Text
                style={{
                  ...typography.body,
                  color: colors.textPrimary,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                -{receipt.coinsSpent} 🪙
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...typography.body, color: colors.textSecondary }}>
                Coins remaining
              </Text>
              <Text
                style={{
                  ...typography.body,
                  color: colors.textPrimary,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                {receipt.coinsRemaining} 🪙
              </Text>
            </View>
          </View>

          <Text
            style={{
              ...typography.caption,
              color: colors.textTertiary,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            This discount is valid for this visit only. Show the code before paying.
          </Text>
        </View>

        <View style={{ padding: spacing.lg, paddingBottom: bottom + spacing.md }}>
          <Pressable
            style={{
              backgroundColor: '#2D6E4E',
              borderRadius: 14,
              paddingVertical: spacing.md,
              alignItems: 'center',
            }}
            onPress={() => router.back()}
          >
            <Text style={{ ...typography.h3, color: 'white' }}>Done</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading || !data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  const { partner, offers } = data
  const catColor = CATEGORY_COLOR[partner.category] ?? colors.primary

  // ─── Main screen ───────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top + spacing.xs,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flex: 1,
          }}
        >
          <ChevronLeft size={18} color={colors.textPrimary} />
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            Redeem coins
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 14 }}>🪙</Text>
          <Text style={{ ...typography.h3, color: colors.textPrimary }}>{userCoins}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: 120,
        }}
      >
        {/* Partner card */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            alignItems: 'center',
            backgroundColor: colors.surfaceWhite,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
          }}
        >
          {partner.photos[0] ? (
            <Image
              source={{ uri: partner.photos[0] }}
              style={{ width: 64, height: 64, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: catColor + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 28 }}>
                {CATEGORY_EMOJI[partner.category] ?? '📍'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.h3, color: colors.textPrimary }}>
              {partner.name}
            </Text>
            <Text
              style={{ ...typography.caption, color: colors.textSecondary }}
              numberOfLines={1}
            >
              {partner.tagline}
            </Text>
          </View>
        </View>

        {/* Offer selection */}
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>
          Choose an offer
        </Text>

        {offers.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ fontSize: 32 }}>🪙</Text>
            <Text
              style={{
                ...typography.body,
                color: colors.textSecondary,
                marginTop: spacing.sm,
              }}
            >
              No offers available at this partner yet.
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {offers.map((offer) => {
              const canAfford = userCoins >= offer.coinsRequired
              const isSelected = selected?.id === offer.id
              return (
                <Pressable
                  key={offer.id}
                  onPress={() => canAfford && setSelected(offer)}
                  style={{
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? catColor
                      : canAfford
                        ? colors.border
                        : colors.border + '60',
                    backgroundColor: isSelected ? catColor + '10' : colors.surfaceWhite,
                    padding: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    opacity: canAfford ? 1 : 0.5,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? catColor + '20'
                        : colors.border + '40',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>🪙</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...typography.body,
                        color: colors.textPrimary,
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                      }}
                    >
                      {offer.label}
                    </Text>
                    <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                      {offer.coinsRequired} coins required
                    </Text>
                    {!canAfford && (
                      <Text
                        style={{
                          ...typography.caption,
                          color: '#C0392B',
                          marginTop: 2,
                        }}
                      >
                        You need {offer.coinsRequired - userCoins} more coins
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: 'SpaceGrotesk_700Bold',
                      color: catColor,
                    }}
                  >
                    {offer.discountPercent}%
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}

        {/* Info hint */}
        <View
          style={{
            backgroundColor: '#FBF7F0',
            borderRadius: 14,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: '#C4956A30',
          }}
        >
          <Text
            style={{ ...typography.caption, color: '#7A5230', lineHeight: 18 }}
          >
            🪙 Coins are earned by capturing chapters across Sri Lanka. The more you
            explore, the more you unlock.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom confirm button */}
      {selected && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.lg,
            paddingBottom: bottom + spacing.md,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable
            style={{
              backgroundColor: catColor,
              borderRadius: 14,
              paddingVertical: spacing.md,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: spacing.sm,
              opacity: isPending ? 0.7 : 1,
            }}
            onPress={handleRedeem}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ ...typography.h3, color: 'white' }}>
                Spend {selected.coinsRequired} coins for {selected.discountPercent}% off
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  )
}

// Silence unused StyleSheet import warning — styles are inline for flexibility
const _styles = StyleSheet.create({})
