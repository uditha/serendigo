import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '@/src/theme';
import { useToday } from '@/src/hooks/useToday';

function SkeletonLine({ width, height = 20 }: { width: number | string; height?: number }) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        backgroundColor: colors.textTertiary + '40',
        marginBottom: spacing.sm,
      }}
    />
  );
}

export default function TodayScreen() {
  const { data, isLoading, error } = useToday();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <SkeletonLine width={200} height={36} />
          <SkeletonLine width={160} />
        </>
      ) : error ? (
        <>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={[styles.subtitle, { color: colors.error }]}>
            Could not reach server
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.greeting}>{data?.greeting}</Text>
          <Text style={styles.subtitle}>{data?.location}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
