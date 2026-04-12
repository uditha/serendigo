import { useColorScheme } from 'react-native'
import { lightColors, darkColors, type AppColors } from '@/src/theme'
import { useThemeStore } from '@/src/stores/themeStore'

export function useTheme(): { colors: AppColors; isDark: boolean } {
  const systemScheme = useColorScheme()
  const mode = useThemeStore((s) => s.mode)

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemScheme === 'dark')

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  }
}
