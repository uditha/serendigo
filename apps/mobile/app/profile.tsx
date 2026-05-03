import React, { useState } from 'react'
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleDollarSign, Camera, Map, CheckCircle2, Repeat2, LogOut, Trash2, ChevronRight, Sun, Moon, Smartphone } from 'lucide-react-native'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { useThemeStore, type ThemeMode } from '@/src/stores/themeStore'
import { useAuthStore } from '@/src/stores/authStore'
import { fetchStory, type StoryXP } from '@/src/services/story'
import { fetchBadges, type UserBadge } from '@/src/services/badges'
import { deleteAccount } from '@/src/services/api'
import { WORLD_COLORS } from '@/src/constants/world'

// ─── Config — brand colors, same in light & dark ──────────────────────────
const CHARACTER_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  TASTE:   { emoji: '🍛', label: 'The Taster',     color: '#B85C1A' },
  WILD:    { emoji: '🐘', label: 'The Explorer',   color: '#2D6E4E' },
  MOVE:    { emoji: '🏄', label: 'The Adventurer', color: '#1A5F8A' },
  ROOTS:   { emoji: '🏛️', label: 'The Historian',  color: '#614A9E' },
  RESTORE: { emoji: '🌿', label: 'The Wanderer',   color: '#5E8C6E' },
}

const XP_KEYS = ['taste', 'wild', 'move', 'roots', 'restore'] as const
const XP_LABELS: Record<string, string> = {
  taste: 'Taste', wild: 'Wild', move: 'Move', roots: 'Roots', restore: 'Restore',
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  backLink: { marginBottom: spacing.xs },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Hero card
  heroCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingPlain: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatarPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  characterBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  characterBadgeEmoji: {
    fontSize: 14,
  },
  avatarEmoji: { fontSize: 48 },
  avatarInitial: {
    ...typography.display,
    color: 'white',
    lineHeight: 48,
  },
  characterName: {
    ...typography.h2,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  localBadge: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  localBadgeText: {
    ...typography.label,
    color: colors.secondary,
  },
  quizCta: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  quizCtaText: {
    ...typography.caption,
    color: colors.primary,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  statValue: {
    ...typography.h2,
  },
  statLabel: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 9,
  },

  // Section
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  // XP card
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpLabel: {
    ...typography.label,
    color: colors.textSecondary,
    width: 52,
  },
  xpBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpValue: {
    ...typography.label,
    width: 32,
    textAlign: 'right',
  },

  // Badges
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  unearnedLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    width: '30%',
    flexGrow: 1,
  },
  badgeCardUnearned: {
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
  },
  badgeIcon: { fontSize: 28 },
  badgeIconUnearned: { opacity: 0.3 },
  badgeName: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 9,
  },
  badgeNameUnearned: {
    color: colors.textTertiary,
  },
  badgeProgressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  badgeProgressText: {
    ...typography.label,
    fontSize: 8,
    color: colors.textTertiary,
  },
  badgesEmpty: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.md,
  },

  // Badge modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalIconWrapEarned: {
    backgroundColor: colors.primary + '18',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  modalIconWrapUnearned: {
    backgroundColor: colors.textTertiary + '15',
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalIcon: { fontSize: 48 },
  modalName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalNameUnearned: {
    color: colors.textSecondary,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalEarnedWrap: { width: '100%', alignItems: 'center' },
  modalEarnedBadge: {
    backgroundColor: colors.success + '18',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modalEarnedText: {
    ...typography.label,
    color: colors.success,
  },
  modalProgressWrap: { width: '100%', gap: spacing.xs },
  modalProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalProgressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalProgressCount: {
    ...typography.h3,
    color: colors.primary,
  },
  modalProgressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  modalProgressHint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  modalClose: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  modalCloseText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Theme picker
  themePicker: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  themePickerLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  themeOptionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
  themeOptionLabelActive: {
    color: colors.primary,
  },

  // Actions card
  actionsCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  actionLabelDestructive: {
    color: colors.error,
  },
})

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore()
  const { user, isLocal, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['story'],
    queryFn: fetchStory,
    staleTime: 2 * 60 * 1000,
  })

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges,
    staleTime: 2 * 60 * 1000,
  })

  const character = user?.travellerCharacter ? CHARACTER_CONFIG[user.travellerCharacter] : null

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Sign Out', style: 'destructive', onPress: () => { clearAuth(); router.replace('/(tabs)') } },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all captures, badges, and progress. This cannot be undone.',
      [
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be deleted immediately and cannot be recovered.',
              [
                {
                  text: 'Yes, delete everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount()
                      queryClient.clear()
                      clearAuth()
                      router.replace('/(tabs)')
                    } catch {
                      Alert.alert('Error', 'Failed to delete account. Please try again.')
                    }
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            )
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>

      {/* Character hero */}
      <View style={[styles.heroCard, character && { borderColor: character.color + '50' }]}>
        {/* Avatar — always shows Google photo when available */}
        <View style={styles.avatarWrapper}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatarPhoto} />
          ) : character ? (
            <View style={[styles.avatarRing, { backgroundColor: character.color + '20', borderColor: character.color + '40' }]}>
              <Text style={styles.avatarEmoji}>{character.emoji}</Text>
            </View>
          ) : (
            <View style={styles.avatarRingPlain}>
              <Text style={styles.avatarInitial}>
                {(user?.name ?? 'T').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Character badge overlay */}
          {character && user?.image && (
            <View style={[styles.characterBadge, { backgroundColor: character.color }]}>
              <Text style={styles.characterBadgeEmoji}>{character.emoji}</Text>
            </View>
          )}
        </View>

        {character ? (
          <Text style={[styles.characterName, { color: character.color }]}>{character.label}</Text>
        ) : (
          <Pressable style={styles.quizCta} onPress={() => router.push('/onboarding/quiz')}>
            <Text style={styles.quizCtaText}>Discover your traveller type →</Text>
          </Pressable>
        )}

        <Text style={styles.userName}>{user?.name ?? 'Traveller'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {isLocal !== null && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>{isLocal ? '🏝️ Islander' : '✈️ Traveller'}</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsCard}>
        <StatCell Icon={CircleDollarSign} value={user?.serendipityCoins ?? 0} label="Coins" color={colors.coinGold} styles={styles} />
        <View style={styles.statDivider} />
        <StatCell Icon={Camera} value={isLoading ? '—' : (data?.stats?.totalCaptures ?? 0)} label="Captures" color={colors.primary} styles={styles} />
        <View style={styles.statDivider} />
        <StatCell Icon={Map} value={isLoading ? '—' : (data?.stats?.arcsEnrolled ?? 0)} label="Journeys" color={colors.secondary} styles={styles} />
        <View style={styles.statDivider} />
        <StatCell Icon={CheckCircle2} value={isLoading ? '—' : (data?.stats?.arcsCompleted ?? 0)} label="Done" color={colors.success} styles={styles} />
      </View>

      {/* XP breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.card}>
          {isLoading ? (
            <View style={{ gap: spacing.sm }}>
              {XP_KEYS.map((k) => (
                <View key={k} style={styles.xpRow}>
                  <View style={{ width: 52, height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.textTertiary + '30' }} />
                  <View style={{ width: 28, height: 12, borderRadius: 6, backgroundColor: colors.textTertiary + '30' }} />
                </View>
              ))}
            </View>
          ) : data ? (
            <XPBars xp={data.xp} styles={styles} />
          ) : null}
        </View>
      </View>

      {/* Badges */}
      <BadgesSection badges={badges} styles={styles} colors={colors} />

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        {/* Theme picker */}
        <View style={styles.themePicker}>
          <Text style={styles.themePickerLabel}>Appearance</Text>
          <View style={styles.themeOptions}>
            {([
              { key: 'system', label: 'System', Icon: Smartphone },
              { key: 'light',  label: 'Light',  Icon: Sun },
              { key: 'dark',   label: 'Dark',   Icon: Moon },
            ] as { key: ThemeMode; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[]).map(({ key, label, Icon }) => {
              const active = themeMode === key
              return (
                <Pressable
                  key={key}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => setThemeMode(key)}
                >
                  <Icon size={18} color={active ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.themeOptionLabel, active && styles.themeOptionLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={styles.actionsCard}>
          {character && (
            <ActionRow
              Icon={Repeat2}
              label="Retake character quiz"
              onPress={() => router.push('/onboarding/quiz')}
              styles={styles}
              colors={colors}
            />
          )}
          <ActionRow
            Icon={LogOut}
            label="Sign out"
            onPress={handleSignOut}
            destructive
            styles={styles}
            colors={colors}
          />
          <ActionRow
            Icon={Trash2}
            label="Delete account"
            onPress={handleDeleteAccount}
            destructive
            styles={styles}
            colors={colors}
          />
        </View>
      </View>
    </ScrollView>
  )
}

// ─── Badges section ────────────────────────────────────────────────────────
function BadgesSection({ badges, styles, colors }: { badges?: UserBadge[]; styles: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const [selected, setSelected] = useState<UserBadge | null>(null)

  const earned = badges?.filter((b) => b.earned) ?? []
  const unearned = badges?.filter((b) => !b.earned) ?? []

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
        {earned.length > 0 && (
          <Text style={styles.badgeCount}>{earned.length} earned</Text>
        )}
      </View>

      {!badges ? null : badges.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.badgesEmpty}>Complete captures to unlock badges 🏅</Text>
        </View>
      ) : (
        <>
          {/* Earned */}
          {earned.length > 0 && (
            <View style={styles.badgesGrid}>
              {earned.map((badge) => (
                <Pressable key={badge.id} style={styles.badgeCard} onPress={() => setSelected(badge)}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Unearned */}
          {unearned.length > 0 && (
            <>
              <Text style={styles.unearnedLabel}>In progress</Text>
              <View style={styles.badgesGrid}>
                {unearned.map((badge) => (
                  <Pressable key={badge.id} style={[styles.badgeCard, styles.badgeCardUnearned]} onPress={() => setSelected(badge)}>
                    <Text style={[styles.badgeIcon, styles.badgeIconUnearned]}>{badge.icon}</Text>
                    <Text style={[styles.badgeName, styles.badgeNameUnearned]} numberOfLines={2}>{badge.name}</Text>
                    <View style={styles.badgeProgressTrack}>
                      <View style={[styles.badgeProgressFill, { width: `${Math.round((badge.progress / badge.target) * 100)}%` }]} />
                    </View>
                    <Text style={styles.badgeProgressText}>{badge.progress}/{badge.target}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </>
      )}

      {/* Badge detail modal */}
      {selected && (
        <BadgeModal badge={selected} onClose={() => setSelected(null)} styles={styles} />
      )}
    </View>
  )
}

function BadgeModal({ badge, onClose, styles }: { badge: UserBadge; onClose: () => void; styles: ReturnType<typeof makeStyles> }) {
  const pct = Math.round((badge.progress / badge.target) * 100)
  const earnedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={[styles.modalIconWrap, badge.earned ? styles.modalIconWrapEarned : styles.modalIconWrapUnearned]}>
            <Text style={styles.modalIcon}>{badge.icon}</Text>
          </View>

          {/* Name + description */}
          <Text style={[styles.modalName, !badge.earned && styles.modalNameUnearned]}>{badge.name}</Text>
          <Text style={styles.modalDescription}>{badge.description}</Text>

          {badge.earned ? (
            /* Earned state */
            <View style={styles.modalEarnedWrap}>
              <View style={styles.modalEarnedBadge}>
                <Text style={styles.modalEarnedText}>✓ Earned{earnedDate ? ` · ${earnedDate}` : ''}</Text>
              </View>
            </View>
          ) : (
            /* Progress state */
            <View style={styles.modalProgressWrap}>
              <View style={styles.modalProgressRow}>
                <Text style={styles.modalProgressLabel}>Progress</Text>
                <Text style={styles.modalProgressCount}>{badge.progress} / {badge.target}</Text>
              </View>
              <View style={styles.modalProgressTrack}>
                <View style={[styles.modalProgressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.modalProgressHint}>{pct}% complete</Text>
            </View>
          )}

          <Pressable style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── Stat cell ─────────────────────────────────────────────────────────────
function StatCell({ Icon, value, label, color, styles }: {
  Icon: React.ComponentType<{ size?: number; color?: string }>
  value: number | string
  label: string
  color: string
  styles: ReturnType<typeof makeStyles>
}) {
  return (
    <View style={styles.statCell}>
      <Icon size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── XP Bars ───────────────────────────────────────────────────────────────
function XPBars({ xp, styles }: { xp: StoryXP; styles: ReturnType<typeof makeStyles> }) {
  const max = Math.max(...XP_KEYS.map((k) => xp[k]), 100)

  return (
    <View style={{ gap: spacing.sm }}>
      {XP_KEYS.map((key) => {
        const value = xp[key]
        const color = WORLD_COLORS[key.toUpperCase()] ?? '#E8832A'
        const pct = max > 0 ? (value / max) * 100 : 0
        return (
          <View key={key} style={styles.xpRow}>
            <Text style={styles.xpLabel}>{XP_LABELS[key]}</Text>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.xpValue, { color }]}>{value}</Text>
          </View>
        )
      })}
    </View>
  )
}

// ─── Action row ────────────────────────────────────────────────────────────
function ActionRow({ Icon, label, onPress, destructive, styles, colors }: {
  Icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
  onPress: () => void
  destructive?: boolean
  styles: ReturnType<typeof makeStyles>
  colors: AppColors
}) {
  const iconColor = destructive ? colors.error : colors.textSecondary
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <Icon size={18} color={iconColor} />
      <Text style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}>
        {label}
      </Text>
      <ChevronRight size={16} color={colors.textTertiary} />
    </Pressable>
  )
}
