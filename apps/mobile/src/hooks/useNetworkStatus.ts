import { useEffect, useState } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected)
      setIsInternetReachable(state.isInternetReachable)
    })

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected)
      setIsInternetReachable(state.isInternetReachable)
    })

    return unsubscribe
  }, [])

  const offline = isConnected === false || isInternetReachable === false

  return { isConnected, isInternetReachable, offline }
}
