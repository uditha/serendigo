# /test-milestone

Verify a milestone is complete before moving to the next one.

## Philosophy

**You don't move forward until you've seen it work with your own eyes.**

Every milestone has:
1. A clear GOAL
2. Specific things to TEST
3. Visual confirmation points

## Milestone Testing Checklist

### Before Testing
```bash
# Ensure everything is running
cd apps/api && bun dev          # API on :3000
cd apps/mobile && npx expo start # Mobile with QR code
```

### Testing Categories

**Visual Tests** (you look at the screen)
- [ ] Does it look right?
- [ ] Are colors from the theme?
- [ ] Are fonts correct (DM Serif / Space Grotesk)?
- [ ] Does it work on different screen sizes?

**Interaction Tests** (you tap things)
- [ ] All buttons respond to taps?
- [ ] Navigation works correctly?
- [ ] Loading states appear?
- [ ] Error states handled?

**Data Tests** (you check the database)
- [ ] Data saved correctly?
- [ ] Data fetched correctly?
- [ ] Updates reflected in UI?

**Edge Case Tests** (you try to break it)
- [ ] No internet?
- [ ] Slow network?
- [ ] Invalid input?
- [ ] Permission denied?

## Reporting Results

After testing, tell me:

```
MILESTONE: [Number] - [Name]

PASSED:
✓ [Thing that works]
✓ [Thing that works]

FAILED:
✗ [Thing that doesn't work] — [What happens instead]

CONCERNS:
⚠ [Thing that works but seems fragile/wrong]
```

## Quick Test Commands

```bash
# Check API is responding
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/api/provinces

# Check auth is working
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# View Expo logs
npx expo start --clear  # Also clears cache

# Check mobile network requests
# (React Native Debugger or Flipper)
```

## Definition of Done

A milestone is DONE when:
1. All visual tests pass
2. All interaction tests pass  
3. All data tests pass
4. At least basic edge cases handled
5. You can demo it to someone else

## Common "Not Quite Done" Issues

**"It works on my phone"**
→ Test on a different screen size (small iPhone SE, large tablet)

**"It works with test data"**
→ Test with real data (actual Sri Lanka coordinates, real images)

**"It works when everything is perfect"**
→ Test offline, with slow network, with permissions denied

## Ask me:
1. Which milestone are you testing?
2. What's your testing environment? (iOS/Android, device type)
3. What passed?
4. What failed or concerns you?
