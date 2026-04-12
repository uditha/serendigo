import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'
import { fetchPassport, type ProvinceStamp } from '@/src/services/passport'

const PROVINCE_ICONS: Record<string, string> = {
  'western': '🏙️',
  'central': '🏔️',
  'southern': '🐢',
  'northern': '🏛️',
  'eastern': '🌊',
  'north_western': '🌴',
  'north_central': '🦁',
  'uva': '🍵',
  'sabaragamuwa': '💎',
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing.xxl,
  },

  // ─── Passport cover ────────────────────────────────────────────
  passportCover: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  passportEmblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  passportEmblemEmoji: { fontSize: 32 },
  passportWordmark: {
    ...typography.label,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 6,
    fontSize: 10,
  },
  passportTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 42,
    color: 'white',
    lineHeight: 48,
  },
  passportDivider: {
    width: 48,
    height: 1.5,
    backgroundColor: colors.primary,
    marginVertical: spacing.xs,
  },
  passportSubtitle: {
    ...typography.label,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.2,
    fontSize: 8,
    textAlign: 'center',
  },

  stampCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  stampCountItem: {
    alignItems: 'center',
    gap: 2,
  },
  stampCountNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: 'white',
    lineHeight: 32,
  },
  stampCountLabel: {
    ...typography.label,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    letterSpacing: 1,
  },
  stampCountDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  coverProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  coverProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  coverProgressLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },

  // ─── Stamps section ─────────────────────────────────────────────
  stampsSection: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stampsSectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  // ─── Grid ───────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  // ─── Stamp: completed ──────────────────────────────────────────
  stampComplete: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: '#FFF5E8',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  stampInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  perforationRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  perforation: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '60',
  },
  perforationLocked: {
    borderColor: colors.border,
  },
  stampSealWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampSeal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampSealRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary + '50',
    borderStyle: 'dashed',
  },
  stampSealEmoji: { fontSize: 30 },
  stampNameComplete: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stampedLabel: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 2,
    fontSize: 9,
  },
  stampArcCount: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 9,
  },

  // ─── Stamp: locked ─────────────────────────────────────────────
  stampLocked: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stampIconWrapLocked: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampIcon: { fontSize: 26 },
  stampName: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Arc progress bar
  arcProgress: {
    width: '100%',
    gap: 4,
    alignItems: 'center',
  },
  arcProgressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  arcProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  arcProgressText: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 9,
  },
  comingSoon: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 9,
  },

  // ─── Footer / Error ─────────────────────────────────────────────
  footer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
})

export default function PassportScreen() {
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    staleTime: 2 * 60 * 1000,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['passport'] })
    setRefreshing(false)
  }

  const stamped = data?.filter((p) => p.isComplete).length ?? 0
  const total = data?.length ?? 9
  const pct = total > 0 ? (stamped / total) * 100 : 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Passport cover header */}
      <LinearGradient
        colors={['#1C1A2E', '#2A2440']}
        style={styles.passportCover}
      >
        <View style={styles.passportEmblem}>
          <Text style={styles.passportEmblemEmoji}>🌴</Text>
        </View>
        <Text style={styles.passportWordmark}>SERENDIGO</Text>
        <Text style={styles.passportTitle}>Passport</Text>
        <View style={styles.passportDivider} />
        <Text style={styles.passportSubtitle}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>

        <View style={styles.stampCountRow}>
          <View style={styles.stampCountItem}>
            <Text style={styles.stampCountNumber}>{stamped}</Text>
            <Text style={styles.stampCountLabel}>Stamped</Text>
          </View>
          <View style={styles.stampCountDivider} />
          <View style={styles.stampCountItem}>
            <Text style={styles.stampCountNumber}>{total - stamped}</Text>
            <Text style={styles.stampCountLabel}>Remaining</Text>
          </View>
          <View style={styles.stampCountDivider} />
          <View style={styles.stampCountItem}>
            <Text style={styles.stampCountNumber}>{total}</Text>
            <Text style={styles.stampCountLabel}>Provinces</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.coverProgressTrack}>
          <LinearGradient
            colors={[colors.primary, colors.coinGold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.coverProgressFill, { width: `${pct}%` }]}
          />
        </View>
        <Text style={styles.coverProgressLabel}>
          {stamped === 0
            ? 'Begin your journey'
            : stamped === total
            ? 'Passport complete! 🎉'
            : `${Math.round(pct)}% of Sri Lanka explored`}
        </Text>
      </LinearGradient>

      {/* Stamps */}
      <View style={styles.stampsSection}>
        <Text style={styles.stampsSectionTitle}>Province Stamps</Text>

        {isLoading ? (
          <StampGridSkeleton styles={styles} />
        ) : error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Could not load passport</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {data?.map((province) => (
              <StampCard key={province.provinceId} province={province} styles={styles} />
            ))}
          </View>
        )}

        <Text style={styles.footer}>Collect all 9 province stamps to complete your passport</Text>
      </View>
    </ScrollView>
  )
}

function StampCard({ province, styles }: { province: ProvinceStamp; styles: ReturnType<typeof makeStyles> }) {
  const icon = PROVINCE_ICONS[province.provinceSlug] ?? '📍'
  const progressPct =
    province.totalArcs > 0
      ? Math.round((province.completedArcs / province.totalArcs) * 100)
      : 0

  if (province.isComplete) {
    return (
      <View style={styles.stampComplete}>
        {/* Perforated top edge */}
        <View style={styles.perforationRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.perforation} />
          ))}
        </View>

        <View style={styles.stampInner}>
          <View style={styles.stampSealWrap}>
            <View style={styles.stampSeal}>
              <Text style={styles.stampSealEmoji}>{icon}</Text>
            </View>
            <View style={styles.stampSealRing} />
          </View>

          <Text style={styles.stampNameComplete} numberOfLines={2}>{province.provinceName}</Text>
          <Text style={styles.stampedLabel}>STAMPED</Text>

          {province.totalArcs > 0 && (
            <Text style={styles.stampArcCount}>
              {province.completedArcs}/{province.totalArcs} arcs
            </Text>
          )}
        </View>

        {/* Perforated bottom edge */}
        <View style={styles.perforationRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.perforation} />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.stampLocked}>
      <View style={styles.perforationRow}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.perforation, styles.perforationLocked]} />
        ))}
      </View>

      <View style={styles.stampInner}>
        <View style={styles.stampIconWrapLocked}>
          <Text style={styles.stampIcon}>{icon}</Text>
        </View>

        <Text style={styles.stampName} numberOfLines={2}>{province.provinceName}</Text>

        {province.totalArcs > 0 ? (
          <View style={styles.arcProgress}>
            <View style={styles.arcProgressTrack}>
              <View style={[styles.arcProgressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.arcProgressText}>
              {province.completedArcs}/{province.totalArcs} arcs
            </Text>
          </View>
        ) : (
          <Text style={styles.comingSoon}>Coming soon</Text>
        )}
      </View>

      <View style={styles.perforationRow}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.perforation, styles.perforationLocked]} />
        ))}
      </View>
    </View>
  )
}

function StampGridSkeleton({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={[styles.stampLocked, { opacity: 0.4 }]} />
      ))}
    </View>
  )
}
