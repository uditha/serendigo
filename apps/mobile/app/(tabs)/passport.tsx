import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '@/src/theme';

export default function PassportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passport</Text>
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
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
});
