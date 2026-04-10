import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRef, useState } from 'react'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'

// ─── Step definitions ──────────────────────────────────────────────────────
const FEATURE_SLIDES = [
  {
    emoji: '🗺️',
    title: 'Story Arcs',
    body: 'Follow curated journeys across the island — hidden temples, street food trails, wildlife encounters and more.',
    color: colors.roots,
  },
  {
    emoji: '📸',
    title: 'Capture Moments',
    body: 'Visit locations in person, take a photo, and earn Serendipity Coins. No faking it — GPS verified.',
    color: colors.move,
  },
  {
    emoji: '📖',
    title: 'Your Passport',
    body: 'Collect province stamps as you explore. Build a living record of your Sri Lanka story.',
    color: colors.primary,
  },
]

// ─── Screen ────────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const { setIsLocal } = useAuthStore()

  // Steps: 0 = welcome, 1 = who are you, 2–4 = feature slides
  const [step, setStep] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const transition = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
    // Small delay so fade-out completes before content changes
    setTimeout(() => setStep(nextStep), 150)
  }

  const handleLocalChoice = (local: boolean) => {
    setIsLocal(local)
    transition(2)
  }

  const handleNext = () => {
    const slideIndex = step - 2 // 0, 1, 2
    if (slideIndex < FEATURE_SLIDES.length - 1) {
      transition(step + 1)
    } else {
      router.replace('/onboarding/quiz')
    }
  }

  const handleSkip = () => {
    router.replace('/onboarding/quiz')
  }

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom || spacing.lg }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && <WelcomeStep onNext={() => transition(1)} />}
        {step === 1 && <WhoAreYouStep onChoose={handleLocalChoice} />}
        {step >= 2 && (
          <FeatureSlide
            slide={FEATURE_SLIDES[step - 2]}
            currentIndex={step - 2}
            total={FEATURE_SLIDES.length}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        )}
      </Animated.View>
    </View>
  )
}

// ─── Step 0: Welcome ───────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.topSection}>
        <View style={styles.logoMark}>
          <Text style={styles.logoEmoji}>🌴</Text>
        </View>
        <Text style={styles.appName}>SerendiGO</Text>
        <Text style={styles.tagline}>The living guide to Sri Lanka</Text>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.welcomeBody}>
          Discover the island through guided story arcs, capture moments at real locations, and build your own Sri Lanka adventure.
        </Text>

        <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={onNext}>
          <Text style={styles.primaryButtonText}>Begin your journey →</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Step 1: Who are you? ──────────────────────────────────────────────────
function WhoAreYouStep({ onChoose }: { onChoose: (local: boolean) => void }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.topSection}>
        <Text style={styles.stepTitle}>Who's exploring?</Text>
        <Text style={styles.stepSubtitle}>
          We'll tailor your experience to match your relationship with the island.
        </Text>
      </View>

      <View style={styles.choiceRow}>
        <Pressable style={styles.choiceCard} onPress={() => onChoose(false)}>
          <Text style={styles.choiceEmoji}>✈️</Text>
          <Text style={styles.choiceTitle}>I'm visiting</Text>
          <Text style={styles.choiceBody}>Discover the real Sri Lanka beyond the tourist trail</Text>
          <View style={[styles.choiceChip, { backgroundColor: colors.move + '20' }]}>
            <Text style={[styles.choiceChipText, { color: colors.move }]}>Traveller</Text>
          </View>
        </Pressable>

        <Pressable style={styles.choiceCard} onPress={() => onChoose(true)}>
          <Text style={styles.choiceEmoji}>🏝️</Text>
          <Text style={styles.choiceTitle}>I'm local</Text>
          <Text style={styles.choiceBody}>Rediscover your island — see home through new eyes</Text>
          <View style={[styles.choiceChip, { backgroundColor: colors.roots + '20' }]}>
            <Text style={[styles.choiceChipText, { color: colors.roots }]}>Islander</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Feature slide ─────────────────────────────────────────────────────────
function FeatureSlide({
  slide,
  currentIndex,
  total,
  onNext,
  onSkip,
}: {
  slide: { emoji: string; title: string; body: string; color: string }
  currentIndex: number
  total: number
  onNext: () => void
  onSkip: () => void
}) {
  const isLast = currentIndex === total - 1

  return (
    <View style={styles.stepContainer}>
      <View style={styles.topSection}>
        <View style={[styles.featureIconWrap, { backgroundColor: slide.color + '20' }]}>
          <Text style={styles.featureEmoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.featureTitle}>{slide.title}</Text>
        <Text style={styles.featureBody}>{slide.body}</Text>
      </View>

      <View style={styles.bottomSection}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.dotActive, { backgroundColor: slide.color }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable style={[styles.primaryButton, { backgroundColor: slide.color }]} onPress={onNext}>
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Choose your character →' : 'Next →'}
          </Text>
        </Pressable>

        {!isLast && (
          <Pressable style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },

  stepContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  bottomSection: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Welcome step
  logoMark: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    ...typography.display,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  welcomeBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.sm,
  },

  // Who are you step
  stepTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
    alignItems: 'center',
    gap: spacing.sm,
  },
  choiceEmoji: { fontSize: 40 },
  choiceTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  choiceBody: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  choiceChip: {
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: spacing.xs,
  },
  choiceChipText: {
    ...typography.label,
    fontSize: 10,
  },

  // Feature slides
  featureIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureEmoji: { fontSize: 56 },
  featureTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  featureBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E5DDD0',
  },

  // Buttons
  primaryButton: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.h3,
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textTertiary,
  },
})
