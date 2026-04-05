import { View, Text, useColorScheme, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '../../lib/theme'

const FREE_TIER_LIMIT = 5

interface UsageCounterProps {
  count: number
  isPro: boolean
}

export function UsageCounter({ count, isPro }: UsageCounterProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  // Only rendered when isPro is false per D-07
  if (isPro) {
    return null
  }

  const ratio = Math.min(count / FREE_TIER_LIMIT, 1)

  return (
    <View style={styles.container}>
      {/* Label: "N of 5 subscriptions used" — Label typography per UI-SPEC D-07 */}
      <Text style={[styles.label, { color: palette.textSecondary }]}>
        {count} of {FREE_TIER_LIMIT} subscriptions used
      </Text>

      {/* Progress bar — accent fill per UI-SPEC */}
      <View style={[styles.progressTrack, { backgroundColor: palette.surfaceElevated }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: palette.accent,
              width: `${ratio * 100}%` as any,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
})
