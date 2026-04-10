import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { colors, spacing, typography } from '@/src/theme'
import { fetchPassport, type ProvinceStamp } from '@/src/services/passport'

// Emoji icons per province slug as placeholders until illustrated stamps exist
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

export default function PassportScreen() {
  const { top } = useSafeAreaInsets()
  const { data, isLoading, error } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    staleTime: 2 * 60 * 1000,
  })

  const stamped = data?.filter((p) => p.isComplete).length ?? 0
  const total = data?.length ?? 9

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Passport</Text>
        <Text style={styles.headerSubtitle}>Sri Lanka</Text>
      </View>

      {/* Overall progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Provinces Completed</Text>
          <Text style={styles.progressCount}>
            <Text style={styles.progressCountHighlight}>{stamped}</Text>
            {` / ${total}`}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: total > 0 ? `${(stamped / total) * 100}%` : '0%' },
            ]}
          />
        </View>
      </View>

      {/* Stamps grid */}
      {isLoading ? (
        <StampGridSkeleton />
      ) : error ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Could not load passport</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {data?.map((province) => (
            <StampCard key={province.provinceId} province={province} />
          ))}
        </View>
      )}

      <Text style={styles.footer}>Collect all 9 province stamps to complete your passport</Text>
    </ScrollView>
  )
}

function StampCard({ province }: { province: ProvinceStamp }) {
  const icon = PROVINCE_ICONS[province.provinceSlug] ?? '📍'
  const progressPct =
    province.totalArcs > 0
      ? Math.round((province.completedArcs / province.totalArcs) * 100)
      : 0

  return (
    <View style={[styles.stamp, province.isComplete && styles.stampComplete]}>
      {/* Stamp icon */}
      <View
        style={[
          styles.stampIconWrap,
          province.isComplete ? styles.stampIconWrapComplete : styles.stampIconWrapLocked,
        ]}
      >
        <Text style={styles.stampIcon}>{icon}</Text>
        {province.isComplete && (
          <View style={styles.stampedMark}>
            <Text style={styles.stampedMarkText}>✓</Text>
          </View>
        )}
      </View>

      {/* Province name */}
      <Text
        style={[styles.stampName, province.isComplete && styles.stampNameComplete]}
        numberOfLines={2}
      >
        {province.provinceName}
      </Text>

      {/* Arc progress */}
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
  )
}

function StampGridSkeleton() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={[styles.stamp, styles.stampSkeleton]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: {
    paddingTop: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.label,
    color: colors.textTertiary,
    letterSpacing: 3,
  },

  // Progress card
  progressCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5DDD0',
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
    ...typography.body,
    color: colors.textSecondary,
  },
  progressCountHighlight: {
    ...typography.h3,
    color: colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5DDD0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stamp: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
    borderStyle: 'dashed',
    minHeight: 140,
    justifyContent: 'center',
  },
  stampComplete: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: '#FFF8F0',
  },
  stampSkeleton: {
    backgroundColor: '#EDE8E0',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },

  // Stamp icon
  stampIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampIconWrapComplete: {
    backgroundColor: '#FFF0DC',
  },
  stampIconWrapLocked: {
    backgroundColor: '#F0EDE8',
  },
  stampIcon: {
    fontSize: 26,
  },
  stampedMark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampedMarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  // Province name
  stampName: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  stampNameComplete: {
    color: colors.textPrimary,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Arc progress
  arcProgress: {
    width: '100%',
    gap: 3,
    alignItems: 'center',
  },
  arcProgressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#E5DDD0',
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

  // Footer
  footer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Error
  errorState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
})
