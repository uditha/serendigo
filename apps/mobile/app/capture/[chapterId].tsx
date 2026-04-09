import { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '@/src/theme';

export default function CaptureScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturing, setCapturing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (result) setPhoto(result.uri);
    } catch (e) {
      console.error('Capture error:', e);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => setPhoto(null);

  const handleSubmit = async () => {
    if (!photo) return;
    // Navigate to submit screen with photo + chapterId
    router.push({
      pathname: '/capture/submit',
      params: { chapterId, photoUri: photo },
    });
  };

  // Permission request
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionText}>Camera access is needed to capture moments</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.cancelLink}>
          <Text style={styles.cancelLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Photo preview
  if (photo) {
    return (
      <View style={styles.container}>
        {/* Preview overlay using camera frozen */}
        <View style={styles.preview}>
          <CameraView style={StyleSheet.absoluteFill} />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewLabel}>Moment captured</Text>
          </View>
        </View>

        <View style={styles.previewActions}>
          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Use this photo →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Pressable
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            style={styles.flipButton}
          >
            <Text style={styles.flipText}>⇄</Text>
          </Pressable>
        </View>

        {/* Viewfinder guide */}
        <View style={styles.viewfinder} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Capture button */}
        <View style={styles.bottomBar}>
          <Text style={styles.hint}>Position the location in frame</Text>
          <Pressable
            style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 20,
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'white',
  },
  cornerTL: {
    top: '25%',
    left: '15%',
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: '25%',
    right: '15%',
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: '25%',
    left: '15%',
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: '25%',
    right: '15%',
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    ...typography.caption,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  // Preview
  preview: {
    flex: 1,
    position: 'relative',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  previewLabel: {
    color: 'white',
    ...typography.h3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewActions: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: spacing.lg,
    gap: spacing.md,
  },
  retakeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'white',
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  retakeText: {
    color: 'white',
    ...typography.body,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    ...typography.h3,
  },
  // Permission
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  permissionButtonText: {
    ...typography.h3,
    color: 'white',
  },
  cancelLink: {
    padding: spacing.sm,
  },
  cancelLinkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
