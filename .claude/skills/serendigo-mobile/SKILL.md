---
name: serendigo-mobile
description: Build the SerendiGO React Native mobile app. Use this skill whenever working on mobile screens, components, navigation, animations, or any Expo/React Native code for SerendiGO. Triggers for creating screens, implementing gestures, building the illustrated map, capture flow, passport animations, or any mobile UI work. Also use when the user mentions Expo, React Native, Skia animations, or mobile-specific features.
---

# SerendiGO Mobile Development Skill

## Project Context

SerendiGO is a gamified travel app for Sri Lanka. The mobile app is the primary product — a beautifully illustrated guide that rewards exploration.

**Core Features:**
- Illustrated SVG map of Sri Lanka with 9 provinces
- Story arcs (curated journeys) with chapters (locations to visit)
- Capture Moment flow (camera → GPS → upload → celebration)
- Passport book with stamps for visited locations
- Gamification (Serendipity Coins, badges, XP, leaderboards)

## Tech Stack

```
Framework:     Expo SDK 52+ with Expo Router
Navigation:    Expo Router (file-based)
Animations:    @shopify/react-native-skia + react-native-reanimated
Gestures:      react-native-gesture-handler
Storage:       react-native-mmkv (sync, fast)
Offline DB:    WatermelonDB (Phase 2)
Server State:  @tanstack/react-query 5
Client State:  zustand
Camera:        expo-camera
Location:      expo-location
Haptics:       expo-haptics
```

## File Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Main tab screens
│   │   ├── index.tsx       # Today tab
│   │   ├── island.tsx      # The Island (map)
│   │   ├── story.tsx       # Your Story (journal)
│   │   └── passport.tsx    # Passport book
│   ├── (auth)/             # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── arc/[id]/           # Arc detail
│   │   ├── index.tsx
│   │   └── chapter/[chapterId].tsx
│   ├── capture/[chapterId].tsx
│   └── onboarding/
├── src/
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API calls
│   ├── stores/             # Zustand stores
│   ├── theme/              # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── utils/
```

## Design System

### Colors

```typescript
export const colors = {
  // Primary
  primary: '#E8832A',        // Temple Amber
  secondary: '#1A6B7A',      // Ocean Teal
  
  // Surfaces
  surface: '#F7F0E3',        // Coconut Cream (main bg)
  surfaceWhite: '#FDFAF5',   // Warm White (cards)
  backgroundDark: '#1C1A2E', // Night (dark mode)
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A7A',
  textTertiary: '#9A9AB0',
  
  // World Colors (for arcs/chapters)
  taste: '#E67E22',          // Food arcs
  wild: '#27AE60',           // Wildlife arcs
  move: '#2980B9',           // Adventure arcs
  roots: '#8E44AD',          // Culture arcs
  restore: '#F39C12',        // Wellness arcs
  
  // Gamification
  coinGold: '#F1C40F',
  success: '#27AE60',
  warning: '#E67E22',
  error: '#E74C3C',
};
```

### Typography

```typescript
export const typography = {
  // Display (DM Serif Display)
  display: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 40 },
  h1: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28 },
  
  // Body (Space Grotesk)
  h2: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 22 },
  h3: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 18 },
  body: { fontFamily: 'SpaceGrotesk_400Regular', fontSize: 16 },
  caption: { fontFamily: 'SpaceGrotesk_400Regular', fontSize: 13 },
  label: { fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, textTransform: 'uppercase' },
};
```

### Spacing

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## Component Patterns

### Screen Template

```tsx
import { View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing } from '@/theme';

export default function ScreenName() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData,
  });

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorState error={error} />;

  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
});
```

### Animation Pattern (Skia + Reanimated)

```tsx
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';

export function CoinAnimation() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animate = () => {
    scale.value = withSpring(1.2, { damping: 10 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Canvas style={{ width: 50, height: 50 }}>
        <Circle cx={25} cy={25} r={20} color={colors.coinGold} />
      </Canvas>
    </Animated.View>
  );
}
```

### Gesture Pattern

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export function PanZoomMap() {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(e.scale, 1), 4);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={animatedStyle}>
        {/* Map content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

## Key Animations

### Stamp Press Animation
```typescript
// Press down: scale 1.0 → 0.92 (15ms)
// Hold: 120ms
// Release: 0.92 → 1.0 with overshoot to 1.04
// Ink spread: radial fill from center (300ms)
// Haptics: heavy on press, medium on release
```

### Coin Rain Animation
```typescript
// 10-14 coins emit from capture button
// Arc upward then fall with gravity
// Travel to coin counter in header
// Counter increments with spring per arrival
// Haptics: light per coin, medium on settle
// Duration: ~1.2 seconds total
```

### Province Glow Animation
```typescript
// Province polygon pulses twice (scale 1.0 → 1.02 → 1.0)
// Amber glow effect
// Banner slides from top
// Haptics: heavy impact
```

## API Integration

### TanStack Query Setup

```typescript
// src/services/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchFromApi<T>(path: string): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('API Error');
  return response.json();
}
```

### Query Hook Pattern

```typescript
// src/hooks/useArcs.ts
export function useArcs(province?: string) {
  return useQuery({
    queryKey: ['arcs', province],
    queryFn: () => fetchFromApi(`/api/arcs?province=${province}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Critical Rules

1. **Never hardcode colors** — Always use `colors.X` from theme
2. **Never hardcode fonts** — Always use `typography.X` from theme
3. **Use Skia for complex animations** — Not the Animated API
4. **Use Reanimated worklets** — Keep animations on UI thread
5. **Use MMKV, not AsyncStorage** — 30x faster, synchronous
6. **Skeleton loaders, not spinners** — Better perceived performance
7. **Haptic feedback on key interactions** — Stamp, coin, button press
8. **Illustrated empty states** — Never generic grey text

## Common Tasks

### Creating a new screen
1. Create file in `app/` matching the route
2. Import theme values
3. Use TanStack Query for data
4. Add loading/error states
5. Test on device

### Adding an animation
1. Use Skia Canvas for drawing
2. Use Reanimated shared values
3. Use worklets for 60fps
4. Add haptic feedback
5. Test performance on mid-range device

### Connecting to API
1. Add endpoint to services
2. Create query hook
3. Handle loading/error in component
4. Add optimistic updates where appropriate
