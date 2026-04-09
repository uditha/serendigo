import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '@/src/services/api';
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

  const { data: arc, isLoading, error } = useQuery({
    queryKey: ['arc', id],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: ArcDetail }>(`/api/arcs/${id}`).then(
        (res) => res.data
      ),
  });

  const worldColor = arc ? (WORLD_COLORS[arc.worldType] ?? colors.primary) : colors.primary;

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: worldColor + '40' }]}>
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

        {/* Chapters */}
        <View style={styles.chapters}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          {arc.chapters.map((chapter, idx) => (
            <Pressable
              key={chapter.id}
              style={styles.chapterCard}
              onPress={() => router.push(`/arc/${id}/chapter/${chapter.id}`)}
            >
              <View style={[styles.chapterNumber, { backgroundColor: worldColor }]}>
                <Text style={styles.chapterNumberText}>{chapter.order}</Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <View style={styles.chapterMeta}>
                  <Text style={styles.chapterCoins}>🪙 {chapter.coinReward}</Text>
                  {chapter.beforeYouGo?.bestTime && (
                    <Text style={styles.chapterTime}>⏰ {chapter.beforeYouGo.bestTime}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.chapterArrow}>›</Text>
            </Pressable>
          ))}
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
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
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
  },
  chapterArrow: {
    ...typography.h2,
    color: colors.textTertiary,
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
