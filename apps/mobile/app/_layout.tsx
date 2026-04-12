import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { useTheme } from '@/src/hooks/useTheme';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Tell TanStack Query about network state — queries pause when offline
// and automatically refetch when connection returns
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && state.isInternetReachable !== false)
  })
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep cached data while offline — don't show stale errors
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      // Retry once after a short delay, then give up
      retry: 1,
      retryDelay: 2000,
      // Don't refetch on window focus in React Native
      refetchOnWindowFocus: false,
    },
  },
});

function PushNotificationProvider() {
  usePushNotifications()
  return null
}

function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSerifDisplay_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemedStatusBar />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PushNotificationProvider />
        <OfflineBanner />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/quiz" options={{ headerShown: false }} />
          <Stack.Screen name="arc/index" options={{ headerShown: false }} />
          <Stack.Screen name="arc/[id]/index" options={{ headerShown: false }} />
          <Stack.Screen name="arc/[id]/chapter/[chapterId]" options={{ headerShown: false }} />
          <Stack.Screen name="arc/[id]/captures" options={{ headerShown: false }} />
          <Stack.Screen name="capture/[chapterId]" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="capture/submit" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="discover" options={{ headerShown: false }} />
          <Stack.Screen name="partner/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="redeem/scan" options={{ headerShown: false }} />
          <Stack.Screen name="redeem/[partnerId]" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
