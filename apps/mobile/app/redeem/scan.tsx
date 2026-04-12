import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { spacing, typography } from '@/src/theme'
import { useTheme } from '@/src/hooks/useTheme'

export default function QRScanScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [permission?.granted])

  const handleBarCode = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)

    // Parse serendigo://redeem/{partnerId}
    const match = data.match(/serendigo:\/\/redeem\/(.+)/)
    if (match?.[1]) {
      router.replace(`/redeem/${match[1]}`)
    } else {
      // Not a valid SerendiGO QR — reset so user can try again
      setScanned(false)
    }
  }

  if (!permission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
          padding: spacing.xl,
        }}
      >
        <Text
          style={{ ...typography.h3, color: 'white', textAlign: 'center' }}
        >
          Camera access needed to scan QR codes
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
          }}
        >
          <Text style={{ ...typography.h3, color: 'white' }}>Allow camera</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarCode}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay UI */}
      <View style={{ flex: 1 }}>
        {/* Top bar */}
        <View
          style={{
            paddingTop: top + spacing.sm,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ ...typography.h3, color: 'white' }}>Scan partner QR</Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: spacing.sm,
            }}
          >
            <X size={20} color="white" />
          </Pressable>
        </View>

        {/* Viewfinder */}
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <View
            style={{
              width: 240,
              height: 240,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.6)',
            }}
          />
          <Text
            style={{
              ...typography.body,
              color: 'rgba(255,255,255,0.8)',
              marginTop: spacing.lg,
              textAlign: 'center',
            }}
          >
            Point at the partner's QR code
          </Text>
        </View>

        {/* Bottom hint */}
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text
            style={{
              ...typography.caption,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
            }}
          >
            🪙 Spend your SerendiGO coins for discounts at partner locations
          </Text>
        </View>
      </View>
    </View>
  )
}
