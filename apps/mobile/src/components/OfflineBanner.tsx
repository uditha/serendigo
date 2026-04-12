import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WifiOff } from 'lucide-react-native'
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus'
import { spacing, typography, AppColors } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'

const makeStyles = (colors: AppColors) => StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: colors.textPrimary,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
})

export function OfflineBanner() {
  const { offline } = useNetworkStatus()
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const styles = makeStyles(colors)
  const translateY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (offline) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [offline])

  // Don't mount anything until we know connection state (null = unknown)
  const { isConnected } = useNetworkStatus()
  if (isConnected === null) return null

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: top + spacing.xs, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <WifiOff size={14} color="white" />
        <Text style={styles.text}>No internet connection · Showing cached data</Text>
      </View>
    </Animated.View>
  )
}
