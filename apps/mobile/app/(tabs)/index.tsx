import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/src/theme';
import { useToday } from '@/src/hooks/useToday';
import { useAuthStore } from '@/src/stores/authStore';

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
  const { isLoggedIn, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace('/(auth)/login');
  };

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

      {isLoggedIn && user ? (
        <>
          <Text style={styles.userText}>Signed in as {user.name}</Text>
          <Pressable
            onPress={() => router.push('/onboarding/quiz')}
            style={styles.testButton}
          >
            <Text style={styles.testButtonText}>→ Take personality quiz</Text>
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>→ Sign in</Text>
        </Pressable>
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
  userText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.caption,
    color: colors.error,
  },
  testButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  testButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
