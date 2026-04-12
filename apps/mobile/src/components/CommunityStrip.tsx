'use client'
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
import { Heart, X } from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { likeCapture, unlikeCapture, type CommunityCapture } from '@/src/services/community'
import { useAuthStore } from '@/src/stores/authStore'
import { WORLD_COLORS } from '@/src/constants/world'

const { width: SW } = Dimensions.get('window')

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
  container: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
  },
  strip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  thumb: {
    width: 110,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.textTertiary + '20',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  thumbArcBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
  },
  thumbArcText: {
    ...typography.label,
    color: 'white',
    fontSize: 9,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  likeBtnCount: {
    ...typography.caption,
    color: 'white',
    fontSize: 11,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  gridThumb: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.textTertiary + '20',
  },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  modalPhoto: {
    width: SW,
    height: SW,
  },
  modalInfo: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalWorldBadge: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  modalWorldText: {
    ...typography.label,
    color: 'white',
    fontSize: 10,
  },
  modalChapter: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  modalNote: {
    ...typography.body,
    color: 'white',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modalUser: {
    ...typography.h3,
    color: 'white',
  },
  modalDate: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
})

function LikeButton({ capture, queryKey }: { capture: CommunityCapture; queryKey: string[] }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const queryClient = useQueryClient()
  const { colors } = useTheme()
  const styles = makeStyles(colors)

  const { mutate, isPending } = useMutation({
    mutationFn: () => capture.likedByMe ? unlikeCapture(capture.id) : likeCapture(capture.id),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: CommunityCapture[] | undefined) =>
        old?.map((c) =>
          c.id === capture.id
            ? { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }
            : c
        )
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return (
    <Pressable
      style={styles.likeBtn}
      onPress={() => isLoggedIn && mutate()}
      disabled={isPending || !isLoggedIn}
    >
      <Heart
        size={14}
        color={capture.likedByMe ? colors.error : 'rgba(255,255,255,0.8)'}
        fill={capture.likedByMe ? colors.error : 'transparent'}
      />
      {capture.likeCount > 0 && (
        <Text style={styles.likeBtnCount}>{capture.likeCount}</Text>
      )}
    </Pressable>
  )
}

function PhotoModal({
  capture,
  visible,
  onClose,
  queryKey,
}: {
  capture: CommunityCapture
  visible: boolean
  onClose: () => void
  queryKey: string[]
}) {
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const worldColor = WORLD_COLORS[capture.arc.worldType] ?? colors.primary
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <Pressable style={styles.modalClose} onPress={onClose}>
          <X size={22} color="white" />
        </Pressable>
        <Image source={{ uri: capture.photoUrl }} style={styles.modalPhoto} resizeMode="cover" />
        <View style={styles.modalInfo}>
          <View style={styles.modalMeta}>
            <View style={[styles.modalWorldBadge, { backgroundColor: worldColor }]}>
              <Text style={styles.modalWorldText}>{capture.arc.worldType}</Text>
            </View>
            <Text style={styles.modalChapter}>Ch. {capture.chapter.order} · {capture.chapter.title}</Text>
          </View>
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

interface Props {
  captures: CommunityCapture[]
  queryKey: string[]
  title?: string
  showArcLabel?: boolean
}

export function CommunityStrip({ captures, queryKey, title = 'Community', showArcLabel = false }: Props) {
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const [selected, setSelected] = useState<CommunityCapture | null>(null)

  if (captures.length === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        data={captures}
        keyExtractor={(c) => c.id}
        extraData={captures}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        renderItem={({ item }) => (
          <Pressable style={styles.thumb} onPress={() => setSelected(item)}>
            <Image source={{ uri: item.photoUrl }} style={styles.thumbImage} resizeMode="cover" />
            <View style={styles.thumbOverlay}>
              <LikeButton capture={item} queryKey={queryKey} />
            </View>
            {showArcLabel && (
              <View style={[styles.thumbArcBadge, { backgroundColor: WORLD_COLORS[item.arc.worldType] ?? colors.primary }]}>
                <Text style={styles.thumbArcText} numberOfLines={1}>{item.chapter.title}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
      {selected && (
        <PhotoModal
          capture={selected}
          visible={!!selected}
          onClose={() => setSelected(null)}
          queryKey={queryKey}
        />
      )}
    </View>
  )
}

// Grid variant for arc detail
export function CommunityGrid({ captures, queryKey }: { captures: CommunityCapture[]; queryKey: string[] }) {
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const [selected, setSelected] = useState<CommunityCapture | null>(null)
  const THUMB = (SW - spacing.lg * 2 - spacing.sm * 2) / 3

  if (captures.length === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Community</Text>
      <View style={styles.grid}>
        {captures.slice(0, 9).map((item) => (
          <Pressable key={item.id} style={[styles.gridThumb, { width: THUMB, height: THUMB }]} onPress={() => setSelected(item)}>
            <Image source={{ uri: item.photoUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={styles.thumbOverlay}>
              <LikeButton capture={item} queryKey={queryKey} />
            </View>
          </Pressable>
        ))}
      </View>
      {selected && (
        <PhotoModal
          capture={selected}
          visible={!!selected}
          onClose={() => setSelected(null)}
          queryKey={queryKey}
        />
      )}
    </View>
  )
}
