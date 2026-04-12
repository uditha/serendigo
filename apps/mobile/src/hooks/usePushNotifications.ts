import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { fetchFromApi } from '@/src/services/api'
import { useAuthStore } from '@/src/stores/authStore'

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function registerPushToken(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    })
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  })

  return token.data
}

export function usePushNotifications() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    if (!isLoggedIn) return

    // Register token with API
    registerPushToken().then((token) => {
      if (!token) return
      fetchFromApi('/api/user/push-token', {
        method: 'PATCH',
        body: JSON.stringify({ token }),
      }).catch(() => {})
    })

    // Handle notification tap (app in background/killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>

      if (data?.type === 'badge') {
        router.push('/profile')
      } else if (data?.type === 'arc_complete') {
        if (data.arcId) router.push(`/arc/${data.arcId}` as never)
      }
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [isLoggedIn])
}
