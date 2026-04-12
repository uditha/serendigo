import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Check, CircleDollarSign, Clock, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '@/src/services/api';
import { fetchArcProgress, enrollInArc } from '@/src/services/arcs';
import { getArcCommunity } from '@/src/services/community';
import { CommunityGrid } from '@/src/components/CommunityStrip';
import { useAuthStore } from '@/src/stores/authStore';
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'

// World colors — brand colors, same in light & dark
const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A', WILD: '#2D6E4E', MOVE: '#1A5F8A', ROOTS: '#614A9E', RESTORE: '#5E8C6E',
};

const WORLD_LABELS: Record<string, string> = {
  TASTE: 'Taste', WILD: 'Wild', MOVE: 'Move', ROOTS: 'Roots', RESTORE: 'Restore',
};

interface Chapter {
  id: string
  order: number
  title: string
  loreText: string | null
  coinReward: number
  xpCategory: string
  lat: number
  lng: number
  beforeYouGo: {
    bestTime?: string
    dresscode?: string
    entryFee?: string
    etiquette?: string
  } | null
}

interface ArcDetail {
  id: string
  title: string
  slug: string
  worldType: string
  province: string
  narratorName: string | null
  introText: string | null
  coverImage: string | null
  isPublished: boolean
  chapters: Chapter[]
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero
  heroContainer: {
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroFallback: {
    height: 240,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  heroBack: {
    alignSelf: 'flex-start',
  },
  heroBackText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  heroContent: {
    gap: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: 'white',
    lineHeight: 36,
  },
  heroNarrator: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
  },
  worldBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.xs,
  },
  worldBadgeText: {
    ...typography.label,
    color: 'white',
  },

  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 12,
    padding: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  statLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },

  // Enroll section
  enrollSection: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  enrollButton: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  enrollButtonDisabled: {
    opacity: 0.7,
  },
  enrollButtonText: {
    ...typography.h3,
    color: 'white',
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressCount: {
    ...typography.h3,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Chapters
  chapters: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterCardCaptured: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '08',
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumberText: {
    ...typography.h3,
    color: 'white',
  },
  chapterInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  chapterTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  chapterTitleCaptured: {
    color: colors.textSecondary,
  },
  chapterMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chapterCoins: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chapterTime: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  capturedTag: {
    ...typography.label,
    fontSize: 10,
  },
  chapterSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.md,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
})

export default function ArcDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: arc, isLoading, error } = useQuery({
    queryKey: ['arc', id],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: ArcDetail }>(`/api/arcs/${id}`).then(
        (res) => res.data
      ),
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['arc-progress', id],
    queryFn: () => fetchArcProgress(id!),
    enabled: isLoggedIn && !!id,
    retry: false,
  });

  const { mutate: enroll, isPending: enrolling } = useMutation({
    mutationFn: () => enrollInArc(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(['arc-progress', id], data);
      queryClient.invalidateQueries({ queryKey: ['story'] });
    },
    onError: (err: Error) => {
      Alert.alert('Could not start journey', err.message ?? 'Please try again.')
    },
  });

  const worldColor = arc ? (WORLD_COLORS[arc.worldType] ?? colors.primary) : colors.primary;
  const isEnrolled = !!progress;

  const communityQueryKey = ['arc-community', id]
  const { data: community = [] } = useQuery({
    queryKey: communityQueryKey,
    queryFn: () => getArcCommunity(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
  const completedIds = new Set(progress?.completedChapterIds ?? []);
  const progressPct = progress && progress.totalChapters > 0
    ? (progress.completedChapters / progress.totalChapters) * 100
    : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
          <View style={{ width: '80%', height: 32, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
          <View style={{ width: '60%', height: 16, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
        </View>
        <View style={{ padding: spacing.lg }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.chapterSkeleton}>
              <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
              <View style={{ width: '70%', height: 18, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error || !arc) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not load arc</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Hero header */}
        <View style={styles.heroContainer}>
          {arc.coverImage ? (
            <ImageBackground
              source={{ uri: arc.coverImage }}
              style={styles.heroImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
                style={[styles.heroGradient, { paddingTop: top + spacing.sm }]}
              >
                <Pressable onPress={() => router.back()} style={styles.heroBack}>
                  <Text style={styles.heroBackText}>← The Island</Text>
                </Pressable>
                <View style={styles.heroContent}>
                  <View style={[styles.worldBadge, { backgroundColor: worldColor }]}>
                    <Text style={styles.worldBadgeText}>{WORLD_LABELS[arc.worldType]}</Text>
                  </View>
                  <Text style={styles.heroTitle}>{arc.title}</Text>
                  {arc.narratorName && (
                    <Text style={styles.heroNarrator}>Narrated by {arc.narratorName}</Text>
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[worldColor + 'CC', worldColor + '99']}
              style={[styles.heroFallback, { paddingTop: top + spacing.sm }]}
            >
              <Pressable onPress={() => router.back()} style={styles.heroBack}>
                <Text style={styles.heroBackText}>← The Island</Text>
              </Pressable>
              <View style={styles.heroContent}>
                <View style={[styles.worldBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={styles.worldBadgeText}>{WORLD_LABELS[arc.worldType]}</Text>
                </View>
                <Text style={styles.heroTitle}>{arc.title}</Text>
                {arc.narratorName && (
                  <Text style={styles.heroNarrator}>Narrated by {arc.narratorName}</Text>
                )}
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Intro text + stats */}
        <View style={[styles.header, { borderBottomColor: worldColor + '40' }]}>
          {arc.introText && (
            <Text style={styles.intro}>{arc.introText}</Text>
          )}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{arc.chapters.length}</Text>
              <Text style={styles.statLabel}>Chapters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {arc.chapters.reduce((sum, c) => sum + c.coinReward, 0)}
              </Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{arc.province.replace('_', ' ')}</Text>
              <Text style={styles.statLabel}>Province</Text>
            </View>
          </View>
        </View>

        {/* Enrollment / Progress */}
        {isLoggedIn && !progressLoading && (
          <View style={styles.enrollSection}>
            {isEnrolled ? (
              <View style={styles.progressBlock}>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {progress!.isComplete && <Check size={12} color={colors.textSecondary} />}
                    <Text style={styles.progressLabel}>
                      {progress!.isComplete ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                  <Text style={[styles.progressCount, { color: worldColor }]}>
                    {progress!.completedChapters}/{progress!.totalChapters}
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPct}%`, backgroundColor: worldColor },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                style={[styles.enrollButton, { backgroundColor: worldColor }, enrolling && styles.enrollButtonDisabled]}
                onPress={() => enroll()}
                disabled={enrolling}
              >
                {enrolling ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.enrollButtonText}>Start Journey →</Text>
                )}
              </Pressable>
            )}
          </View>
        )}

        {/* Community grid */}
        {community.length > 0 && (
          <View style={{ paddingTop: spacing.lg }}>
            <CommunityGrid captures={community} queryKey={communityQueryKey} />
          </View>
        )}

        {/* Chapters */}
        <View style={styles.chapters}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          {arc.chapters.map((chapter) => {
            const captured = completedIds.has(chapter.id);
            return (
              <Pressable
                key={chapter.id}
                style={[styles.chapterCard, captured && styles.chapterCardCaptured]}
                onPress={() => router.push(`/arc/${id}/chapter/${chapter.id}`)}
              >
                <View style={[
                  styles.chapterNumber,
                  { backgroundColor: captured ? worldColor : worldColor + '30' },
                ]}>
                  {captured ? (
                    <Check size={14} color="white" />
                  ) : (
                    <Text style={[styles.chapterNumberText, { color: captured ? 'white' : worldColor }]}>
                      {chapter.order}
                    </Text>
                  )}
                </View>
                <View style={styles.chapterInfo}>
                  <Text style={[styles.chapterTitle, captured && styles.chapterTitleCaptured]}>
                    {chapter.title}
                  </Text>
                  <View style={styles.chapterMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <CircleDollarSign size={12} color={colors.textSecondary} />
                      <Text style={styles.chapterCoins}>{chapter.coinReward}</Text>
                    </View>
                    {chapter.beforeYouGo?.bestTime && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 }}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={styles.chapterTime} numberOfLines={1}>{chapter.beforeYouGo.bestTime}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {captured ? (
                  <Text style={[styles.capturedTag, { color: worldColor }]}>Captured</Text>
                ) : (
                  <ChevronRight size={18} color={colors.textTertiary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
