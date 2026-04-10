import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '@/src/services/api';
import { fetchArcProgress, enrollInArc } from '@/src/services/arcs';
import { useAuthStore } from '@/src/stores/authStore';
import { colors, spacing, typography } from '@/src/theme';

const WORLD_COLORS: Record<string, string> = {
  TASTE:   colors.taste,
  WILD:    colors.wild,
  MOVE:    colors.move,
  ROOTS:   colors.roots,
  RESTORE: colors.restore,
};

const WORLD_LABELS: Record<string, string> = {
  TASTE:   'Taste',
  WILD:    'Wild',
  MOVE:    'Move',
  ROOTS:   'Roots',
  RESTORE: 'Restore',
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
  isPublished: boolean
  chapters: Chapter[]
}

function SkeletonLine({ width, height = 16 }: { width: number | string; height?: number }) {
  return (
    <View style={{
      width,
      height,
      borderRadius: 6,
      backgroundColor: colors.textTertiary + '30',
      marginBottom: spacing.sm,
    }} />
  );
}

export default function ArcDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
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
    // 404 = not enrolled — treat as null
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
  const completedIds = new Set(progress?.completedChapterIds ?? []);
  const progressPct = progress && progress.totalChapters > 0
    ? (progress.completedChapters / progress.totalChapters) * 100
    : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLine width={80} height={12} />
          <SkeletonLine width="80%" height={32} />
          <SkeletonLine width="60%" height={16} />
        </View>
        <View style={{ padding: spacing.lg }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.chapterSkeleton}>
              <SkeletonLine width={24} height={24} />
              <SkeletonLine width="70%" height={18} />
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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: worldColor + '40', paddingTop: top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← The Island</Text>
          </Pressable>

          <View style={[styles.worldBadge, { backgroundColor: worldColor + '20' }]}>
            <Text style={[styles.worldBadgeText, { color: worldColor }]}>
              {WORLD_LABELS[arc.worldType]}
            </Text>
          </View>

          <Text style={styles.title}>{arc.title}</Text>

          {arc.narratorName && (
            <Text style={styles.narrator}>Narrated by {arc.narratorName}</Text>
          )}

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
                  <Text style={styles.progressLabel}>
                    {progress!.isComplete ? '✓ Completed' : 'In Progress'}
                  </Text>
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
                    <Text style={styles.chapterCheckmark}>✓</Text>
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
                    <Text style={styles.chapterCoins}>🪙 {chapter.coinReward}</Text>
                    {chapter.beforeYouGo?.bestTime && (
                      <Text style={styles.chapterTime} numberOfLines={1}>⏰ {chapter.beforeYouGo.bestTime}</Text>
                    )}
                  </View>
                </View>
                {captured ? (
                  <Text style={[styles.capturedTag, { color: worldColor }]}>Captured</Text>
                ) : (
                  <Text style={styles.chapterArrow}>›</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DDD0',
    gap: spacing.sm,
  },
  backLink: {
    marginBottom: spacing.xs,
  },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  worldBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  worldBadgeText: {
    ...typography.label,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    lineHeight: 44,
  },
  narrator: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
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
    backgroundColor: '#E5DDD0',
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
    backgroundColor: '#E5DDD0',
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
    borderColor: '#E5DDD0',
  },
  chapterCardCaptured: {
    borderColor: colors.primary + '40',
    backgroundColor: '#FFF8F0',
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
  chapterCheckmark: {
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
  chapterArrow: {
    ...typography.h2,
    color: colors.textTertiary,
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
});
