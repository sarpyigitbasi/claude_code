import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { type Subscription } from '@subtrackr/core'
import { colors, typography, spacing } from '../../lib/theme'

interface SubscriptionRowProps {
  subscription: Subscription
  onPress: () => void
  onDelete?: () => void
}

const SWIPE_THRESHOLD = -80

function getCategoryIcon(category: string | null): string {
  switch (category) {
    case 'entertainment': return 'tv-outline'
    case 'productivity': return 'briefcase-outline'
    case 'health': return 'heart-outline'
    case 'finance': return 'cash-outline'
    case 'shopping': return 'cart-outline'
    default: return 'ellipsis-horizontal'
  }
}

export function SubscriptionRow({ subscription, onPress, onDelete }: SubscriptionRowProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const translateX = useSharedValue(0)
  // Button press feedback: scale 0.97, 100ms ease-in-out (UI-SPEC animation contract)
  const scale = useSharedValue(1)

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }))

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow left swipe
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, SWIPE_THRESHOLD)
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD / 2) {
        translateX.value = withTiming(SWIPE_THRESHOLD)
      } else {
        translateX.value = withTiming(0)
      }
    })

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  const displayAmount = subscription.amount?.toFixed(2) ?? '—'
  const frequencyLabel =
    subscription.billing_frequency === 'annual'
      ? '/yr'
      : subscription.billing_frequency === 'weekly'
      ? '/wk'
      : '/mo'

  return (
    <View style={styles.wrapper}>
      {/* Swipe-to-delete background */}
      {onDelete && (
        <View style={[styles.deleteBackground, { backgroundColor: palette.destructive }]}>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        </View>
      )}

      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={animatedRowStyle}>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: palette.secondary }]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={`${subscription.service_name}, $${displayAmount} ${frequencyLabel}`}
          >
            {/* Service icon — 24x24dp per UI-SPEC */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={getCategoryIcon(subscription.category) as any}
                size={24}
                color={palette.textSecondary}
                accessibilityElementsHidden
              />
            </View>

            {/* Service name — Body 16px per UI-SPEC */}
            <View style={styles.nameContainer}>
              <Text style={[styles.serviceName, { color: palette.textPrimary }]} numberOfLines={1}>
                {subscription.service_name}
              </Text>
              {/* Category badge — Label 13px, surfaceElevated background per UI-SPEC */}
              {subscription.category && (
                <View style={[styles.categoryBadge, { backgroundColor: palette.surfaceElevated }]}>
                  <Text style={[styles.categoryLabel, { color: palette.textSecondary }]}>
                    {subscription.category}
                  </Text>
                </View>
              )}
            </View>

            {/* Amount — Body 16px, right-aligned per UI-SPEC */}
            <Text style={[styles.amount, { color: palette.textPrimary }]}>
              ${displayAmount}
              <Text style={[styles.frequency, { color: palette.textSecondary }]}>
                {frequencyLabel}
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Min row height 44px per UI-SPEC accessibility
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    ...typography.body,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryLabel: {
    ...typography.label,
  },
  amount: {
    ...typography.body,
    flexShrink: 0,
    textAlign: 'right',
  },
  frequency: {
    ...typography.label,
  },
})
