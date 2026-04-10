import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import * as Haptics from 'expo-haptics'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitCapture, type CaptureResult, type BadgeEarned } from '@/src/services/captures'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, spacing, typography } from '@/src/theme'

type Phase = 'preview' | 'submitting' | 'success' | 'error'

function BadgeCard({ badge }: { badge: BadgeEarned }) {
  return (
    <View style={badgeStyles.card}>
      <Text style={badgeStyles.icon}>{badge.icon}</Text>
      <View style={badgeStyles.info}>
        <Text style={badgeStyles.name}>{badge.name}</Text>
        <Text style={badgeStyles.description}>{badge.description}</Text>
      </View>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,200,50,0.4)',
  },
  icon: { fontSize: 32 },
  info: { flex: 1, gap: 2 },
  name: { ...typography.h3, color: colors.coinGold },
  description: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
})

export default function CaptureSubmitScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const { chapterId, photoUri } = useLocalSearchParams<{
    chapterId: string
    photoUri: string
  }>()

  const [note, setNote] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('preview')
  const [result, setResult] = useState<CaptureResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const queryClient = useQueryClient()
  const refreshUser = useAuthStore((s) => s.refreshUser)

  // Coin bounce animation
  const coinScale = useRef(new Animated.Value(0)).current
  const coinOpacity = useRef(new Animated.Value(0)).current
  const loreOpacity = useRef(new Animated.Value(0)).current
  const badgeOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    getLocation()
  }, [])

  useEffect(() => {
    if (phase === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Animated.sequence([
        Animated.parallel([
          Animated.spring(coinScale, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(coinOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(badgeOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(loreOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    }
  }, [phase])

  const getLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationError('Location permission required to verify your visit')
        return
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
    } catch {
      setLocationError('Could not get your location — please try again')
    }
  }

  const mutation = useMutation({
    mutationFn: () => {
      if (!coords) throw new Error('Location not available')
      return submitCapture({
        chapterId: chapterId!,
        photoUri: photoUri!,
        lat: coords.lat,
        lng: coords.lng,
        note: note.trim() || undefined,
      })
    },
    onSuccess: (data) => {
      setResult(data)
      setPhase('success')
      // Refresh coins/XP in auth store + invalidate cached queries
      refreshUser()
      queryClient.invalidateQueries({ queryKey: ['story'] })
      queryClient.invalidateQueries({ queryKey: ['arc-progress'] })
      queryClient.invalidateQueries({ queryKey: ['passport'] })
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
    onError: (err: Error) => {
      setErrorMessage(err.message)
      setPhase('error')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    },
  })

  const handleSubmit = () => {
    if (!coords) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    setPhase('submitting')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    mutation.mutate()
  }

  const handleDone = () => {
    // Navigate back to the arc — pop capture + submit off the stack
    router.dismissAll()
  }

  // ─── Success screen ───────────────────────────────────────────
  if (phase === 'success' && result) {
    return (
      <View style={styles.successContainer}>
        <Image source={{ uri: photoUri }} style={styles.successPhoto} />
        <View style={styles.successOverlay} />

        <ScrollView
          style={styles.successContent}
          contentContainerStyle={[styles.successContentInner, { paddingTop: top + spacing.xl }]}
        >
          <Text style={styles.successTitle}>Moment Captured!</Text>

          {/* Coins + XP */}
          <Animated.View
            style={[
              styles.rewardRow,
              { opacity: coinOpacity, transform: [{ scale: coinScale }] },
            ]}
          >
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardValue}>+{result.coinsEarned}</Text>
              <Text style={styles.rewardLabel}>coins</Text>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardIcon}>⚡</Text>
              <Text style={styles.rewardValue}>+{result.xpEarned}</Text>
              <Text style={styles.rewardLabel}>{result.xpCategory.toLowerCase()} xp</Text>
            </View>
          </Animated.View>

          {/* Arc complete banner */}
          {result.arcComplete && (
            <Animated.View style={[styles.arcCompleteBanner, { opacity: coinOpacity }]}>
              <Text style={styles.arcCompleteText}>🏆 Arc Complete!</Text>
            </Animated.View>
          )}

          {/* Badge unlocks */}
          {result.badgesEarned?.length > 0 && (
            <Animated.View style={[styles.badgesWrap, { opacity: badgeOpacity }]}>
              <Text style={styles.badgesLabel}>Badge{result.badgesEarned.length > 1 ? 's' : ''} Unlocked</Text>
              {result.badgesEarned.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </Animated.View>
          )}

          {/* Lore reveal */}
          <Animated.View style={[styles.loreCard, { opacity: loreOpacity }]}>
            <Text style={styles.loreLabelText}>The Story Revealed</Text>
            <Text style={styles.loreText}>{result.loreText}</Text>
          </Animated.View>

          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Continue your journey →</Text>
          </Pressable>
        </ScrollView>
      </View>
    )
  }

  // ─── Error screen ─────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <View style={[styles.container, styles.center, { paddingTop: top }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Capture Failed</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Pressable style={styles.retryButton} onPress={() => setPhase('preview')}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.cancelLink}>
          <Text style={styles.cancelLinkText}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  // ─── Preview / submitting ─────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />

      <ScrollView
        style={styles.bottomSheet}
        contentContainerStyle={styles.bottomSheetContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Location status */}
        <View style={styles.locationRow}>
          {coords ? (
            <>
              <View style={styles.locationDot} />
              <Text style={styles.locationText}>Location locked</Text>
            </>
          ) : locationError ? (
            <>
              <Text style={styles.locationErrorDot}>⚠️</Text>
              <Text style={styles.locationErrorText}>{locationError}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.locationText}>Getting your location…</Text>
            </>
          )}
        </View>

        {/* Optional note */}
        <TextInput
          style={styles.noteInput}
          placeholder="Add a note… (optional)"
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
          maxLength={200}
          multiline
        />

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={phase === 'submitting'}
          >
            <Text style={styles.backButtonText}>← Retake</Text>
          </Pressable>

          <Pressable
            style={[
              styles.submitButton,
              (!coords || phase === 'submitting') && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!coords || phase === 'submitting'}
          >
            {phase === 'submitting' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Capture</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewImage: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    maxHeight: 320,
  },
  bottomSheetContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Location row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationErrorDot: {
    fontSize: 14,
  },
  locationErrorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },

  // Note input
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5DDD0',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.textTertiary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.h3,
    color: 'white',
  },

  // ─── Success ───────────────────────────────────────────────────
  successContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  successPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.6)',
  },
  successContent: {
    flex: 1,
  },
  successContentInner: {
    padding: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  successTitle: {
    ...typography.h1,
    color: 'white',
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rewardBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
    minWidth: 90,
    gap: 2,
  },
  rewardIcon: {
    fontSize: 28,
  },
  rewardValue: {
    ...typography.h2,
    color: colors.coinGold,
  },
  rewardLabel: {
    ...typography.label,
    color: 'rgba(255,255,255,0.7)',
  },
  arcCompleteBanner: {
    backgroundColor: colors.coinGold,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  arcCompleteText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  badgesWrap: {
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  badgesLabel: {
    ...typography.label,
    color: colors.coinGold,
    letterSpacing: 1,
  },

  loreCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loreLabelText: {
    ...typography.label,
    color: colors.primary,
  },
  loreText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  doneButtonText: {
    ...typography.h3,
    color: 'white',
  },

  // ─── Error ─────────────────────────────────────────────────────
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryButtonText: {
    ...typography.h3,
    color: 'white',
  },
  cancelLink: {
    padding: spacing.sm,
  },
  cancelLinkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
})
