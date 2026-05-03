import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View, Pressable, Linking } from 'react-native';
import { CircleDollarSign, Camera, Clock, MapPin, Shirt, DollarSign, Info, Maximize2, ChevronLeft } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '@/src/services/api';
import { fetchArcProgress } from '@/src/services/arcs';
import { getChapterCommunity } from '@/src/services/community';
import { getChapterPartners } from '@/src/services/partners';
import { CommunityStrip } from '@/src/components/CommunityStrip';
import { PartnerCard } from '@/src/components/PartnerCard';
import { useAuthStore } from '@/src/stores/authStore';
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { WORLD_COLORS, WORLD_EMOJI } from '@/src/constants/world'

interface Chapter {
  id: string
  order: number
  title: string
  loreText: string | null
  coinReward: number
  xpCategory: string
  coverImage: string | null
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

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Floating top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  backBtnText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  chapterPill: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chapterPillText: {
    ...typography.label,
    color: 'white',
    fontSize: 10,
  },

  // Place card image
  imageCardWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  imageCard: {
    width: '100%',
    height: 220,
  },
  imageWorldBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageWorldEmoji: { fontSize: 13 },
  imageWorldLabel: {
    ...typography.label,
    color: 'white',
    fontSize: 10,
  },

  // No-image accent strip
  accentStrip: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  accentEmoji: { fontSize: 48 },
  accentPill: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  accentPillText: {
    ...typography.label,
    color: 'white',
    fontSize: 10,
  },

  // Title block
  titleBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rewardDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  chapterTitle: {
    ...typography.display,
    color: colors.textPrimary,
    lineHeight: 46,
    marginTop: spacing.xs,
  },
  titleDivider: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: spacing.sm,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 124,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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

  // CTA
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
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  captureButtonText: {
    ...typography.h3,
    color: 'white',
  },
})

function InfoRow({ icon: Icon, label, value, styles, colors }: {
  icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
  value: string
  styles: ReturnType<typeof makeStyles>
  colors: AppColors
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelWrap}>
        <Icon size={14} color={colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ChapterDetailScreen() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { data: arc, isLoading } = useQuery({
    queryKey: ['arc', id],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: ArcDetail }>(`/api/arcs/${id}`).then(
        (res) => res.data
      ),
  });

  const { data: progress } = useQuery({
    queryKey: ['arc-progress', id],
    queryFn: () => fetchArcProgress(id!),
    enabled: isLoggedIn && !!id,
    retry: false,
  });

  const isEnrolled = !!progress;

  const chapter = arc?.chapters.find((c) => c.id === chapterId);

  const communityQueryKey = ['chapter-community', chapterId]
  const { data: community = [] } = useQuery({
    queryKey: communityQueryKey,
    queryFn: () => getChapterCommunity(chapterId!),
    enabled: !!chapterId,
    staleTime: 2 * 60 * 1000,
  });

  // Partners nearby this chapter — only fetched once we have the chapter coords
  const { data: chapterPartners } = useQuery({
    queryKey: ['chapter-partners', chapterId],
    queryFn: () => getChapterPartners(chapterId!, chapter!.lat, chapter!.lng),
    enabled: !!chapter,
    staleTime: 5 * 60 * 1000,
  });
  const allPartners = [
    ...(chapterPartners?.featured ?? []),
    ...(chapterPartners?.nearby ?? []),
  ];

  const worldColor = arc ? (WORLD_COLORS[arc.worldType] ?? colors.primary) : colors.primary;

  const openMaps = () => {
    if (!chapter) return;
    const coords = `${chapter.lat},${chapter.lng}`;
    const url = Platform.OS === 'ios'
      ? `maps://?q=${coords}&ll=${coords}`
      : `https://maps.google.com/?q=${coords}`;
    Linking.openURL(url);
  };

  if (isLoading || !chapter) {
    return (
      <View style={styles.container}>
        <View style={{ padding: spacing.lg, paddingTop: top + spacing.md }}>
          <View style={{ width: 60, height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
          <View style={{ width: '90%', height: 32, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
          <View style={{ width: '100%', height: 16, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
          <View style={{ width: '80%', height: 16, borderRadius: 6, backgroundColor: colors.textTertiary + '30', marginBottom: spacing.sm }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating back bar — always visible, over content */}
      <View style={[styles.topBar, { paddingTop: top + spacing.xs }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={18} color={colors.textPrimary} />
          <Text style={styles.backBtnText} numberOfLines={1}>{arc.title}</Text>
        </Pressable>

        {/* Chapter number pill */}
        <View style={[styles.chapterPill, { backgroundColor: worldColor }]}>
          <Text style={styles.chapterPillText}>Ch. {chapter.order}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + 52 }}
      >
        {/* Place card image */}
        {chapter.coverImage ? (
          <View style={styles.imageCardWrap}>
            <Image
              source={{ uri: chapter.coverImage }}
              style={styles.imageCard}
              resizeMode="cover"
            />
            {/* World type badge overlay */}
            <View style={[styles.imageWorldBadge, { backgroundColor: worldColor }]}>
              <Text style={styles.imageWorldEmoji}>{WORLD_EMOJI[arc.worldType]}</Text>
              <Text style={styles.imageWorldLabel}>{arc.worldType}</Text>
            </View>
          </View>
        ) : (
          /* No image: colored accent strip */
          <View style={[styles.accentStrip, { backgroundColor: worldColor + '18' }]}>
            <Text style={styles.accentEmoji}>{WORLD_EMOJI[arc.worldType]}</Text>
            <View style={[styles.accentPill, { backgroundColor: worldColor }]}>
              <Text style={styles.accentPillText}>{arc.worldType}</Text>
            </View>
          </View>
        )}

        {/* Title block */}
        <View style={styles.titleBlock}>
          <View style={styles.rewardRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <CircleDollarSign size={13} color={worldColor} />
              <Text style={[styles.rewardText, { color: worldColor }]}>{chapter.coinReward} coins</Text>
            </View>
            <Text style={styles.rewardDot}>·</Text>
            <Text style={styles.rewardText}>{chapter.xpCategory} XP</Text>
          </View>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <View style={[styles.titleDivider, { backgroundColor: worldColor + '50' }]} />
        </View>

        {/* Lore text */}
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
                <InfoRow icon={Clock} label="Best time" value={chapter.beforeYouGo.bestTime} styles={styles} colors={colors} />
              )}
              {chapter.beforeYouGo.dresscode && (
                <InfoRow icon={Shirt} label="Dress code" value={chapter.beforeYouGo.dresscode} styles={styles} colors={colors} />
              )}
              {chapter.beforeYouGo.entryFee && (
                <InfoRow icon={DollarSign} label="Entry fee" value={chapter.beforeYouGo.entryFee} styles={styles} colors={colors} />
              )}
              {chapter.beforeYouGo.etiquette && (
                <InfoRow icon={Info} label="Etiquette" value={chapter.beforeYouGo.etiquette} styles={styles} colors={colors} />
              )}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <InfoRow icon={MapPin} label="Coordinates" value={`${chapter.lat.toFixed(4)}, ${chapter.lng.toFixed(4)}`} styles={styles} colors={colors} />
            <InfoRow icon={Maximize2} label="Capture radius" value={`${chapter.radiusMeters}m`} styles={styles} colors={colors} />
          </View>
          <Pressable style={[styles.mapsButton, { borderColor: worldColor }]} onPress={openMaps}>
            <MapPin size={14} color={worldColor} />
            <Text style={[styles.mapsButtonText, { color: worldColor }]}>Open in Maps</Text>
          </Pressable>
        </View>

        {/* Community photos */}
        <CommunityStrip
          captures={community}
          queryKey={communityQueryKey}
          title="Others who visited"
        />

        {/* Places nearby */}
        {allPartners.length > 0 && (
          <View style={{ paddingBottom: spacing.lg, gap: spacing.sm }}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>
              Places nearby
            </Text>
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              {allPartners.map((p) => (
                <PartnerCard key={p.id} partner={p} showDistance />
              ))}
            </View>
          </View>
        )}

        {/* Capture CTA */}
        <View style={styles.ctaContainer}>
          {!isLoggedIn ? (
            <>
              <Text style={styles.ctaHint}>Sign in to capture this moment</Text>
              <Pressable
                style={[styles.captureButton, { backgroundColor: worldColor }]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.captureButtonText}>Sign In to Continue</Text>
              </Pressable>
            </>
          ) : !isEnrolled ? (
            <>
              <Text style={styles.ctaHint}>Start this journey to unlock captures</Text>
              <Pressable
                style={[styles.captureButton, { backgroundColor: worldColor + '20', borderWidth: 1.5, borderColor: worldColor }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.captureButtonText, { color: worldColor }]}>Start Journey First →</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.ctaHint}>Visit this location to capture your moment</Text>
              <Pressable
                style={[styles.captureButton, { backgroundColor: worldColor }]}
                onPress={() => router.push(`/capture/${chapterId}`)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Camera size={18} color="white" />
                  <Text style={styles.captureButtonText}>Capture Moment</Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
