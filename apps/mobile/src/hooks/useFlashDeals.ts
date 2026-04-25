import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import { useQuery } from '@tanstack/react-query'
import { getFlashDeals } from '@/src/services/partners'

interface Coords {
  lat: number
  lng: number
}

// Sri Lanka geographic centre — fallback when location permission not granted
const SL_CENTER: Coords = { lat: 7.8731, lng: 80.7718 }

/**
 * Fetch flash deals near the user's current location.
 * Falls back to Sri Lanka's centre so the banner always loads even without
 * location permission (the 200km test radius covers the whole island anyway).
 */
export function useFlashDeals(overrideCoords?: Coords) {
  // Start with SL centre so the query fires immediately on mount
  const [coords, setCoords] = useState<Coords>(overrideCoords ?? SL_CENTER)

  useEffect(() => {
    // If caller passed explicit coords (e.g. from a capture), use those
    if (overrideCoords) {
      setCoords(overrideCoords)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        // Fast path: last known position
        const last = await Location.getLastKnownPositionAsync()
        if (!cancelled && last) {
          setCoords({ lat: last.coords.latitude, lng: last.coords.longitude })
        }

        // Accurate path: fresh GPS if permission granted
        const { status } = await Location.getForegroundPermissionsAsync()
        if (status !== 'granted') return

        const fresh = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (!cancelled) {
          setCoords({ lat: fresh.coords.latitude, lng: fresh.coords.longitude })
        }
      } catch {
        // Location unavailable — SL centre fallback already set
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const query = useQuery({
    queryKey: ['flash-deals', coords?.lat?.toFixed(3), coords?.lng?.toFixed(3)],
    queryFn: () => getFlashDeals(coords!.lat, coords!.lng),
    enabled: !!coords,
    staleTime: 2 * 60 * 1000,   // 2 min — deals change frequently
    gcTime: 5 * 60 * 1000,
  })

  return { ...query, coords }
}
