import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '@/src/theme';

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good morning</Text>
      <Text style={styles.subtitle}>Your Sri Lanka adventure awaits</Text>
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
