import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, typography, spacing } from '../../lib/theme'

interface EmptyStateProps {
  onAddPress: () => void
}

export function EmptyState({ onAddPress }: EmptyStateProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  // Button press feedback: scale 0.97, 100ms (UI-SPEC animation contract)
  const scale = useSharedValue(1)
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  return (
    <View style={styles.container}>
      {/* Illustration: service icon cluster, 160x160dp, textSecondary at 0.4 opacity (UI-SPEC D-05) */}
      <View style={styles.illustration}>
        <View style={styles.iconGrid}>
          <Ionicons name="tv-outline" size={32} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="musical-notes-outline" size={32} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="game-controller-outline" size={32} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="cloud-outline" size={28} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="briefcase-outline" size={28} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="heart-outline" size={28} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="cart-outline" size={24} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="cash-outline" size={24} color={palette.textSecondary} style={{ opacity: 0.4 }} />
          <Ionicons name="headset-outline" size={24} color={palette.textSecondary} style={{ opacity: 0.4 }} />
        </View>
      </View>

      {/* Heading — Heading typography 20px/600 per UI-SPEC D-05 */}
      <Text style={[styles.heading, { color: palette.textPrimary }]}>
        No subscriptions yet
      </Text>

      {/* Body — Body typography 16px per UI-SPEC D-05 */}
      <Text style={[styles.body, { color: palette.textSecondary }]}>
        Add your first to start tracking what you spend.
      </Text>

      {/* CTA — accent fill, full-width, 48px height, Body semibold per UI-SPEC D-05 */}
      <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: palette.accent }]}
          onPress={onAddPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel="Add Subscription"
        >
          <Text style={styles.ctaText}>Add Subscription</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  illustration: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 140,
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    ...typography.heading,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: spacing.sm,
  },
  ctaButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
