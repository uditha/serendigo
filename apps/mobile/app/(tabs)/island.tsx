import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '@/src/theme';
import { DISTRICT_PATHS } from '@/src/data/sriLankaDistricts';

// SVG viewBox from the source file
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
            fill={colors.surface}
            stroke={colors.primary}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ))}
      </Svg>
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
});
