# /new-screen

Create a new mobile screen for SerendiGO following our conventions.

## Instructions

1. **Read the theme first**: Check `apps/mobile/src/theme/` for colors, fonts, spacing
2. **Check existing patterns**: Look at similar screens in `apps/mobile/src/app/`
3. **Create the screen file** at the correct Expo Router path

## File Structure
```
apps/mobile/src/app/[route]/
├── index.tsx          # Main screen component
├── _layout.tsx        # Layout wrapper (if needed)
└── [param].tsx        # Dynamic routes (if needed)
```

## Component Template
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, fonts, spacing } from '@/theme';

export default function ScreenName() {
  // TanStack Query for data fetching
  // Zustand for local UI state
  // Expo Router for navigation
  
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
  },
});
```

## Checklist
- [ ] Uses colors from theme (no hardcoded hex)
- [ ] Uses fonts from theme (DM Serif for titles, Space Grotesk for body)
- [ ] Has loading state (skeleton, not spinner)
- [ ] Has error state (illustrated, not generic)
- [ ] Registered in Expo Router file structure
- [ ] TypeScript strict (no `any`)

## Ask me:
1. What is the screen name?
2. What route path? (e.g., /arc/[id], /capture/[chapterId])
3. What data does it need to fetch?
4. What user actions are possible?
