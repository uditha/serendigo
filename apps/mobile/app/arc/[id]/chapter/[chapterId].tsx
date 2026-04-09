import { ScrollView, StyleSheet, Text, View, Pressable, Linking } from 'react-native';
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

interface Chapter {
  id: string
  order: number
  title: string
  loreText: string | null
  coinReward: number
  xpCategory: string
  lat: number
  lng: number
  radiusMeters: number
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
  worldType: string
  chapters: Chapter[]
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SkeletonLine({ width, height = 16 }: { width: number | string; height?: number }) {
  return (
    <View style={{
      width, height, borderRadius: 6,
      backgroundColor: colors.textTertiary + '30',
      marginBottom: spacing.sm,
    }} />
  );
}

export default function ChapterDetailScreen() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();

  const { data: arc, isLoading } = useQuery({
    queryKey: ['arc', id],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: ArcDetail }>(`/api/arcs/${id}`).then(
        (res) => res.data
      ),
  });

  const chapter = arc?.chapters.find((c) => c.id === chapterId);
  const worldColor = arc ? (WORLD_COLORS[arc.worldType] ?? colors.primary) : colors.primary;

  const openMaps = () => {
    if (!chapter) return;
    const url = `https://maps.google.com/?q=${chapter.lat},${chapter.lng}`;
    Linking.openURL(url);
  };

  if (isLoading || !chapter) {
    return (
      <View style={styles.container}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
          <SkeletonLine width={60} height={12} />
          <SkeletonLine width="90%" height={32} />
          <SkeletonLine width="100%" height={16} />
          <SkeletonLine width="80%" height={16} />
          <SkeletonLine width="70%" height={16} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: worldColor + '40' }]}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← {arc.title}</Text>
          </Pressable>

          <View style={styles.chapterMeta}>
            <View style={[styles.numberBadge, { backgroundColor: worldColor }]}>
              <Text style={styles.numberBadgeText}>{chapter.order}</Text>
            </View>
            <Text style={[styles.xpLabel, { color: worldColor }]}>
              {chapter.xpCategory} · 🪙 {chapter.coinReward}
            </Text>
          </View>

          <Text style={styles.title}>{chapter.title}</Text>
        </View>

        {/* Lore text — revealed after capture in real flow */}
        {chapter.loreText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Story</Text>
            <Text style={styles.loreText}>{chapter.loreText}</Text>
          </View>
        )}

        {/* Before you go */}
        {chapter.beforeYouGo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Before You Go</Text>
            <View style={styles.infoCard}>
              {chapter.beforeYouGo.bestTime && (
                <InfoRow label="⏰ Best time" value={chapter.beforeYouGo.bestTime} />
              )}
              {chapter.beforeYouGo.dresscode && (
                <InfoRow label="👗 Dress code" value={chapter.beforeYouGo.dresscode} />
              )}
              {chapter.beforeYouGo.entryFee && (
                <InfoRow label="💵 Entry fee" value={chapter.beforeYouGo.entryFee} />
              )}
              {chapter.beforeYouGo.etiquette && (
                <InfoRow label="🙏 Etiquette" value={chapter.beforeYouGo.etiquette} />
              )}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <InfoRow label="📍 Coordinates" value={`${chapter.lat.toFixed(4)}, ${chapter.lng.toFixed(4)}`} />
            <InfoRow label="📏 Capture radius" value={`${chapter.radiusMeters}m`} />
          </View>
          <Pressable style={[styles.mapsButton, { borderColor: worldColor }]} onPress={openMaps}>
            <Text style={[styles.mapsButtonText, { color: worldColor }]}>Open in Maps →</Text>
          </Pressable>
        </View>

        {/* Capture CTA */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaHint}>Visit this location to capture your moment</Text>
          <Pressable
            style={[styles.captureButton, { backgroundColor: worldColor }]}
            onPress={() => router.push(`/capture/${chapterId}`)}
          >
            <Text style={styles.captureButtonText}>📸 Capture Moment</Text>
          </Pressable>
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
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backLink: {
    marginBottom: spacing.xs,
  },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    ...typography.h3,
    color: 'white',
  },
  xpLabel: {
    ...typography.label,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    lineHeight: 44,
  },
  section: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  loreText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  infoCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  mapsButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  mapsButtonText: {
    ...typography.body,
  },
  ctaContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  ctaHint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  captureButton: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  captureButtonText: {
    ...typography.h3,
    color: 'white',
  },
});
