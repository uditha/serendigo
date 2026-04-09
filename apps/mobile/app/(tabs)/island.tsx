import { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { colors, spacing, typography } from '@/src/theme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';
import { PROVINCES } from '@/src/data/sriLankaProvinces';

// SVG viewBox from the source file
const VIEW_BOX_WIDTH = 449.68774;
const VIEW_BOX_HEIGHT = 792.54926;

// Light fill per province — all use the same neutral for now
const PROVINCE_FILL = '#E5E5E0';

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

  // Toast state
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastLabel = useRef('');

  const showToast = useCallback(
    (provinceName: string) => {
      toastLabel.current = provinceName;
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
        {PROVINCES.map((province) => (
          <G key={province.id} onPress={() => showToast(province.name)}>
            {province.districts.map((districtName) => {
              const d = DISTRICT_PATHS[districtName];
              if (!d) return null;
              return (
                <Path
                  key={districtName}
                  d={d}
                  fill={PROVINCE_FILL}
                  stroke={colors.primary}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
              );
            })}
          </G>
        ))}
      </Svg>

      {/* Toast */}
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
