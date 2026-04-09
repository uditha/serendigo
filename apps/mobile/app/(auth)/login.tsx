import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { colors, spacing, typography } from '@/src/theme';
import { fetchFromApi } from '@/src/services/api';
import { useAuthStore } from '@/src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetchFromApi<{ token: string; user: any }>('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(res.token, res.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surfaceWhite} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Create one</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.h3,
    color: colors.surfaceWhite,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
  },
});
