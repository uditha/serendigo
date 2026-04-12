import { useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Heart, X, Compass } from 'lucide-react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { getDiscoveryFeed, likeCapture, unlikeCapture, type CommunityCapture } from '@/src/services/community'
import { useAuthStore } from '@/src/stores/authStore'

const { width: SW } = Dimensions.get('window')
const CARD_W = (SW - spacing.lg * 2 - spacing.sm) / 2

type WorldFilter = 'ALL' | 'TASTE' | 'WILD' | 'MOVE' | 'ROOTS' | 'RESTORE'

// World colors — brand colors, same in light & dark
const WORLD_COLORS: Record<string, string> = {
  TASTE: '#B85C1A', WILD: '#2D6E4E', MOVE: '#1A5F8A', ROOTS: '#614A9E', RESTORE: '#5E8C6E',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  backBtn: { width: 32 },
  backBtnText: { ...typography.h2, color: colors.textSecondary },
  headerTitle: { ...typography.h2, color: colors.textPrimary },

  filtersRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWhite,
  },
  chipLabel: { ...typography.label, color: colors.textSecondary },
  chipLabelActive: { color: 'white' },

  grid: { padding: spacing.lg, paddingBottom: spacing.xxl },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },

  card: {
    width: CARD_W,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: { width: '100%', height: CARD_W * 1.1 },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: CARD_W * 1.1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardWorldBadge: {
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardWorldText: { ...typography.label, color: 'white', fontSize: 9 },
  cardLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardLikeCount: { ...typography.caption, color: 'white', fontSize: 10 },
  cardBody: { padding: spacing.sm, gap: 2 },
  cardChapter: { ...typography.body, color: colors.textPrimary, fontSize: 13 },
  cardMeta: { ...typography.caption, color: colors.textTertiary, fontSize: 11 },

  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  skeletonCard: {
    height: CARD_W * 1.4,
    borderRadius: 16,
    backgroundColor: colors.textTertiary + '20',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { ...typography.h2, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textTertiary, textAlign: 'center' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' },
  modalClose: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, padding: spacing.sm },
  modalPhoto: { width: SW, height: SW },
  modalInfo: { padding: spacing.lg, gap: spacing.sm },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modalWorldBadge: { borderRadius: 20, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  modalWorldText: { ...typography.label, color: 'white', fontSize: 10 },
  modalArc: { ...typography.h3, color: 'white' },
  modalChapter: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
  modalVisit: { ...typography.caption, color: colors.primary },
  modalNote: { ...typography.body, color: 'white', lineHeight: 24 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalUser: { ...typography.h3, color: 'white' },
  modalDate: { ...typography.caption, color: 'rgba(255,255,255,0.5)' },
})

function CaptureCard({
  item,
  onPress,
  queryKey,
  styles,
  colors,
}: {
  item: CommunityCapture
  onPress: () => void
  queryKey: string[]
  styles: ReturnType<typeof makeStyles>
  colors: AppColors
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const queryClient = useQueryClient()
  const worldColor = WORLD_COLORS[item.arc.worldType] ?? colors.primary

  const { mutate, isPending } = useMutation({
    mutationFn: () => item.likedByMe ? unlikeCapture(item.id) : likeCapture(item.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: CommunityCapture[] | undefined) =>
        old?.map((c) =>
          c.id === item.id
            ? { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }
            : c
        )
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.photoUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <View style={[styles.cardWorldBadge, { backgroundColor: worldColor }]}>
          <Text style={styles.cardWorldText}>{item.arc.worldType}</Text>
        </View>
        <Pressable
          style={styles.cardLikeBtn}
          onPress={() => isLoggedIn && mutate()}
          disabled={isPending || !isLoggedIn}
        >
          <Heart
            size={13}
            color={item.likedByMe ? colors.error : 'rgba(255,255,255,0.9)'}
            fill={item.likedByMe ? colors.error : 'transparent'}
          />
          {item.likeCount > 0 && <Text style={styles.cardLikeCount}>{item.likeCount}</Text>}
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardChapter} numberOfLines={1}>{item.chapter.title}</Text>
        <Text style={styles.cardMeta}>{item.user.name ?? 'Explorer'} · {timeAgo(item.capturedAt)}</Text>
      </View>
    </Pressable>
  )
}

function PhotoModal({ capture, onClose, queryKey, styles, colors }: {
  capture: CommunityCapture
  onClose: () => void
  queryKey: string[]
  styles: ReturnType<typeof makeStyles>
  colors: AppColors
}) {
  const worldColor = WORLD_COLORS[capture.arc.worldType] ?? colors.primary
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <Pressable style={styles.modalClose} onPress={onClose}>
          <X size={22} color="white" />
        </Pressable>
        <Image source={{ uri: capture.photoUrl }} style={styles.modalPhoto} resizeMode="cover" />
        <View style={styles.modalInfo}>
          <Pressable onPress={() => { onClose(); router.push(`/arc/${capture.arc.id}` as never) }}>
            <View style={styles.modalMeta}>
              <View style={[styles.modalWorldBadge, { backgroundColor: worldColor }]}>
                <Text style={styles.modalWorldText}>{capture.arc.worldType}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalArc} numberOfLines={1}>{capture.arc.title}</Text>
                <Text style={styles.modalChapter}>Ch. {capture.chapter.order} · {capture.chapter.title}</Text>
              </View>
              <Text style={styles.modalVisit}>Visit →</Text>
            </View>
          </Pressable>
          {capture.note && <Text style={styles.modalNote}>{capture.note}</Text>}
          <View style={styles.modalFooter}>
            <Text style={styles.modalUser}>{capture.user.name ?? 'Explorer'}</Text>
            <Text style={styles.modalDate}>{timeAgo(capture.capturedAt)}</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function DiscoverScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const [filter, setFilter] = useState<WorldFilter>('ALL')
  const [selected, setSelected] = useState<CommunityCapture | null>(null)

  // FILTERS inside component — uses colors.textSecondary which changes between themes
  const FILTERS: { key: WorldFilter; label: string; color: string }[] = [
    { key: 'ALL',     label: 'All',     color: colors.textSecondary },
    { key: 'TASTE',   label: 'Taste',   color: '#B85C1A' },
    { key: 'WILD',    label: 'Wild',    color: '#2D6E4E' },
    { key: 'MOVE',    label: 'Move',    color: '#1A5F8A' },
    { key: 'ROOTS',   label: 'Roots',   color: '#614A9E' },
    { key: 'RESTORE', label: 'Restore', color: '#5E8C6E' },
  ]

  const queryKey = ['discover', filter]
  const { data: captures = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getDiscoveryFeed(filter === 'ALL' ? undefined : filter),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Compass size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Discover</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <Pressable
                key={f.key}
                style={[styles.chip, active && { backgroundColor: f.color, borderColor: f.color }]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{f.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.loadingGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.skeletonCard, { width: CARD_W }]} />
          ))}
        </View>
      ) : captures.length === 0 ? (
        <View style={styles.empty}>
          <Compass size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No captures yet</Text>
          <Text style={styles.emptyBody}>Be the first to explore and share this world type.</Text>
        </View>
      ) : (
        <FlatList
          data={captures}
          keyExtractor={(c) => c.id}
          extraData={captures}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CaptureCard
              item={item}
              onPress={() => setSelected(item)}
              queryKey={queryKey}
              styles={styles}
              colors={colors}
            />
          )}
        />
      )}

      {selected && (
        <PhotoModal
          capture={selected}
          onClose={() => setSelected(null)}
          queryKey={queryKey}
          styles={styles}
          colors={colors}
        />
      )}
    </View>
  )
}
