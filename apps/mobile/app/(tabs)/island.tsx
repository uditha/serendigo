import { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@/src/theme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';

const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;

export default function IslandScreen() {
  const { width, height } = useWindowDimensions();

  const padding = spacing.xl * 2;
  const availableWidth = width - padding;
  const availableHeight = height * 0.8;
  const scale = Math.min(
    availableWidth / VIEW_BOX_WIDTH,
    availableHeight / VIEW_BOX_HEIGHT
  );
  const mapWidth = VIEW_BOX_WIDTH * scale;
  const mapHeight = VIEW_BOX_HEIGHT * scale;

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastLabel = useRef('');

  const showToast = useCallback(
    (districtName: string) => {
      toastLabel.current = districtName;
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    },
    [toastOpacity]
  );

  return (
    <View style={styles.container}>
      <Svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {Object.entries(DISTRICT_PATHS).map(([name, d]) => (
          <Path
            key={name}
            d={d}
            fill="#E5E5E0"
            stroke={colors.primary}
            strokeWidth={1.5}
            strokeLinejoin="round"
            onPress={() => showToast(name)}
          />
        ))}
      </Svg>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toastLabel.current}</Text>
      </Animated.View>
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
  toast: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
  },
  toastText: {
    ...typography.body,
    color: colors.surfaceWhite,
  },
});
