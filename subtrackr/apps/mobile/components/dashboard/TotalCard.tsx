import { useState } from 'react'
import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { type Subscription } from '@subtrackr/core'
import { colors, typography, spacing } from '../../lib/theme'
import { SkeletonBlock } from '../ui/SkeletonBlock'

interface TotalCardProps {
  subscriptions: Subscription[] | undefined
  isLoading: boolean
}

/**
 * Normalizes a subscription amount to monthly equivalent.
 * Per UI-SPEC D-01: monthly = sum with normalization, annual = monthly * 12.
 */
function toMonthlyAmount(sub: Subscription): number {
  const amount = sub.amount ?? 0
  switch (sub.billing_frequency) {
    case 'annual':
      return amount / 12
    case 'weekly':
      return amount * 4.33
    case 'quarterly':
      return amount / 3
    default:
      return amount
  }
}

export function TotalCard({ subscriptions, isLoading }: TotalCardProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light
  const [isAnnual, setIsAnnual] = useState(false)

  // Annual toggle flip animation (UI-SPEC: 180ms ease-in-out)
  const animOpacity = useSharedValue(1)
  const animatedAmountStyle = useAnimatedStyle(() => ({ opacity: animOpacity.value }))

  const handleToggle = (annual: boolean) => {
    animOpacity.value = withTiming(0, { duration: 90 }, () => {
      animOpacity.value = withTiming(1, { duration: 90 })
    })
    setIsAnnual(annual)
  }

  const monthlyTotal =
    subscriptions?.reduce((sum, sub) => sum + toMonthlyAmount(sub), 0) ?? 0
  const displayAmount = isAnnual ? monthlyTotal * 12 : monthlyTotal

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: palette.secondary }]}>
        <SkeletonBlock width="60%" height={40} borderRadius={8} />
        <View style={{ height: spacing.sm }} />
        <SkeletonBlock width="40%" height={24} borderRadius={6} />
      </View>
    )
  }

  return (
    <View style={[styles.card, { backgroundColor: palette.secondary }]}>
      {/* Amount — Display typography (32px/600) per UI-SPEC */}
      <Animated.Text
        style={[
          styles.amountText,
          { color: palette.textPrimary },
          animatedAmountStyle,
        ]}
        accessibilityRole="text"
        accessibilityLabel={`Total ${isAnnual ? 'annual' : 'monthly'} spend: $${displayAmount.toFixed(2)}`}
      >
        ${displayAmount.toFixed(2)}
      </Animated.Text>

      {/* Toggle — Body typography labels, accent for active state (UI-SPEC) */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => handleToggle(false)}
          style={[
            styles.toggleButton,
            !isAnnual && { borderBottomWidth: 2, borderBottomColor: palette.accent },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Monthly view"
          accessibilityState={{ selected: !isAnnual }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              styles.toggleLabel,
              { color: !isAnnual ? palette.accent : palette.textSecondary },
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleDivider} />

        <TouchableOpacity
          onPress={() => handleToggle(true)}
          style={[
            styles.toggleButton,
            isAnnual && { borderBottomWidth: 2, borderBottomColor: palette.accent },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Annual view"
          accessibilityState={{ selected: isAnnual }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              styles.toggleLabel,
              { color: isAnnual ? palette.accent : palette.textSecondary },
            ]}
          >
            Annual
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: 16,
  },
  amountText: {
    ...typography.display,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingBottom: 4,
  },
  toggleLabel: {
    ...typography.body,
  },
  toggleDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#334155',
  },
})
