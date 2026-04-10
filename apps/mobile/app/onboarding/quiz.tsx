import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/src/theme';
import { fetchFromApi } from '@/src/services/api';
import { useAuthStore } from '@/src/stores/authStore';

type WorldType = 'TASTE' | 'WILD' | 'MOVE' | 'ROOTS' | 'RESTORE';

interface Answer {
  text: string;
  world: WorldType;
  emoji: string;
}

interface Question {
  prompt: string;
  answers: Answer[];
}

const QUESTIONS: Question[] = [
  {
    prompt: "You have one free day in Sri Lanka. What calls to you?",
    answers: [
      { text: "Finding the best kottu spot the locals actually eat at", world: 'TASTE', emoji: '🍛' },
      { text: "Getting to Yala at dawn to spot a leopard", world: 'WILD', emoji: '🐆' },
      { text: "Surfing Weligama or hiking Ella Rock", world: 'MOVE', emoji: '🏄' },
      { text: "Climbing Sigiriya at sunrise before the crowds", world: 'ROOTS', emoji: '🏛️' },
      { text: "A slow morning, an Ayurveda massage, and doing absolutely nothing", world: 'RESTORE', emoji: '🌿' },
    ],
  },
  {
    prompt: "The best souvenir from a trip is...",
    answers: [
      { text: "A recipe or ingredient you can't get at home", world: 'TASTE', emoji: '🌶️' },
      { text: "A photo of a wild animal in its natural habitat", world: 'WILD', emoji: '🐘' },
      { text: "The memory of a physical challenge you conquered", world: 'MOVE', emoji: '🧗' },
      { text: "A story about a place that changed how you see the world", world: 'ROOTS', emoji: '📖' },
      { text: "A feeling of deep rest you carried home with you", world: 'RESTORE', emoji: '✨' },
    ],
  },
  {
    prompt: "Your ideal Sri Lanka evening looks like...",
    answers: [
      { text: "A street food crawl through Colombo Fort", world: 'TASTE', emoji: '🌆' },
      { text: "Watching sea turtles nest on a dark beach", world: 'WILD', emoji: '🐢' },
      { text: "Night surfing or a bonfire with other travellers", world: 'MOVE', emoji: '🔥' },
      { text: "A Kandyan dance performance or temple festival", world: 'ROOTS', emoji: '💃' },
      { text: "Sunset from a hilltop, tea in hand, no plans", world: 'RESTORE', emoji: '🍵' },
    ],
  },
];

const CHARACTER_MAP: Record<WorldType, { name: string; tagline: string; color: string }> = {
  TASTE:   { name: 'The Gourmand',    tagline: "Sri Lanka's table is your compass",       color: colors.taste },
  WILD:    { name: 'The Adventurer',  tagline: "The wild calls and you always answer",      color: colors.wild },
  MOVE:    { name: 'The Wanderer',    tagline: "You move through places, never just visiting", color: colors.move },
  ROOTS:   { name: 'The Storyteller', tagline: "Every stone has a story and you find them",  color: colors.roots },
  RESTORE: { name: 'The Seeker',      tagline: "You travel to find stillness",              color: colors.restore },
};

const CALC_PHRASES = [
  'Reading your answers…',
  'Mapping your soul to the island…',
  'Consulting the ancient texts…',
  'Almost there…',
];

const CALC_EMOJIS = ['🍛', '🐆', '🏄', '🏛️', '🌿', '🗺️', '✨', '🌊'];

function CalculatingScreen({ onDone }: { onDone: () => void }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [emojiIdx, setEmojiIdx] = useState(0);
  const barWidth = useSharedValue(0);
  const emojiScale = useSharedValue(1);

  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }));
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));

  useEffect(() => {
    // Animate bar to 100% over 4.8s
    barWidth.value = withTiming(1, { duration: 4800, easing: Easing.out(Easing.quad) });

    // Cycle phrases every 1200ms
    const phraseTimer = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % CALC_PHRASES.length);
    }, 1200);

    // Cycle emojis every 600ms
    const emojiTimer = setInterval(() => {
      setEmojiIdx((i) => (i + 1) % CALC_EMOJIS.length);
      emojiScale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withTiming(1, { duration: 250 })
      );
    }, 600);

    // Reveal result after 5s
    const doneTimer = setTimeout(onDone, 5000);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(emojiTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <View style={[styles.container, styles.resultContainer]}>
      <Animated.Text style={[styles.calcEmoji, emojiStyle]}>
        {CALC_EMOJIS[emojiIdx]}
      </Animated.Text>
      <Text style={styles.calcPhrase}>{CALC_PHRASES[phraseIdx]}</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, barStyle]} />
      </View>
    </View>
  );
}

export default function QuizScreen() {
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0); // 0,1,2 = questions; 3 = calculating; 4 = result
  const [scores, setScores] = useState<Record<WorldType, number>>({
    TASTE: 0, WILD: 0, MOVE: 0, ROOTS: 0, RESTORE: 0,
  });
  const [selected, setSelected] = useState<WorldType | null>(null);
  const [result, setResult] = useState<WorldType | null>(null);
  const { user, setAuth, token } = useAuthStore();

  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleSelect = (world: WorldType) => {
    setSelected(world);
  };

  const handleNext = () => {
    if (!selected) return;

    const newScores = { ...scores, [selected]: scores[selected] + 1 };
    setScores(newScores);
    setSelected(null);

    if (step < QUESTIONS.length - 1) {
      progress.value = withTiming((step + 1) / QUESTIONS.length);
      setStep(step + 1);
    } else {
      // Calculate winner
      const winner = (Object.keys(newScores) as WorldType[]).reduce((a, b) =>
        newScores[a] >= newScores[b] ? a : b
      );
      progress.value = withTiming(1);
      setResult(winner);
      setStep(3); // show calculating screen first
    }
  };

  const handleContinue = async () => {
    if (result && token && user) {
      try {
        await fetchFromApi('/api/user/character', {
          method: 'PATCH',
          body: JSON.stringify({ character: result }),
        });
        // Update local store so the character is immediately available
        setAuth(token, { ...user, travellerCharacter: result })
      } catch (e) {
        // Non-blocking — character can be set again later
        console.warn('Failed to save character:', e)
      }
    }
    router.replace('/(tabs)');
  };

  // Calculating screen
  if (step === 3) {
    return <CalculatingScreen onDone={() => setStep(4)} />;
  }

  // Result screen
  if (step === 4 && result) {
    const character = CHARACTER_MAP[result];
    return (
      <View style={[styles.container, styles.resultContainer, { paddingTop: top + spacing.xl }]}>
        <View style={[styles.characterBadge, { backgroundColor: character.color + '22', borderColor: character.color }]}>
          <Text style={styles.characterEmoji}>
            {result === 'TASTE' ? '🍛' : result === 'WILD' ? '🐆' : result === 'MOVE' ? '🏄' : result === 'ROOTS' ? '🏛️' : '🌿'}
          </Text>
        </View>
        <Text style={styles.resultTitle}>{character.name}</Text>
        <Text style={styles.resultTagline}>{character.tagline}</Text>
        <Text style={styles.resultBody}>
          Your SerendiGO journey is shaped around your character. The island will reveal itself to you in your own way.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: character.color }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Begin the journey →</Text>
        </Pressable>
      </View>
    );
  }

  const question = QUESTIONS[step];

  return (
    <View style={[styles.container, { paddingTop: top + spacing.lg }]}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <Text style={styles.stepText}>{step + 1} of {QUESTIONS.length}</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.prompt}>{question.prompt}</Text>

        <View style={styles.answers}>
          {question.answers.map((answer) => {
            const isSelected = selected === answer.world;
            return (
              <Pressable
                key={answer.world}
                style={[styles.answer, isSelected && styles.answerSelected]}
                onPress={() => handleSelect(answer.world)}
              >
                <Text style={styles.answerEmoji}>{answer.emoji}</Text>
                <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                  {answer.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>
            {step < QUESTIONS.length - 1 ? 'Next →' : 'See my character →'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xl,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  prompt: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  answers: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
  },
  answerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  answerEmoji: {
    fontSize: 24,
  },
  answerText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  answerTextSelected: {
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.h3,
    color: colors.surfaceWhite,
  },
  // Result screen
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  calcEmoji: {
    fontSize: 72,
    marginBottom: spacing.xl,
  },
  calcPhrase: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  characterBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  characterEmoji: {
    fontSize: 52,
  },
  resultTitle: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resultTagline: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  resultBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
