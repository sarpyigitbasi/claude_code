import { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  useColorScheme,
  StyleSheet,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { colors, typography, spacing } from '../../lib/theme'

interface PaywallBottomSheetProps {
  visible: boolean
  onUpgrade: () => void
  onDismiss: () => void
}

const FEATURES = [
  'Unlimited subscriptions',
  'Auto-detection via Gmail (coming soon)',
  'Bank sync (coming soon)',
]

export function PaywallBottomSheet({ visible, onUpgrade, onDismiss }: PaywallBottomSheetProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const translateY = useSharedValue(600)

  useEffect(() => {
    if (visible) {
      // Spring animation: damping 20, stiffness 150 per UI-SPEC D-06
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 })
    } else {
      // Close: damping 25, stiffness 200 per UI-SPEC
      translateY.value = withSpring(600, { damping: 25, stiffness: 200 })
    }
  }, [visible])

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop — 60% opacity per UI-SPEC D-06 */}
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityLabel="Dismiss paywall"
      />

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: palette.secondary },
          animatedSheetStyle,
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        {/* Title — Heading typography per UI-SPEC D-06 */}
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          You've reached your limit
        </Text>

        {/* Body per UI-SPEC D-06 copywriting contract */}
        <Text style={[styles.body, { color: palette.textSecondary }]}>
          Free accounts track up to 5 subscriptions. Upgrade to track unlimited.
        </Text>

        {/* Feature bullets per UI-SPEC D-06 */}
        <View style={styles.featureList}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={palette.accent}
                accessibilityElementsHidden
              />
              <Text style={[styles.featureText, { color: palette.textPrimary }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Primary CTA — accent fill, full-width, 48px per UI-SPEC D-06 */}
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: palette.accent }]}
          onPress={onUpgrade}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro"
        >
          <Text style={styles.upgradeText}>Upgrade to Pro</Text>
        </TouchableOpacity>

        {/* Secondary CTA — text-only, textSecondary, 44px touch per UI-SPEC D-06 */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
        >
          <Text style={[styles.dismissText, { color: palette.textSecondary }]}>
            Maybe later
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Backdrop: 60% opacity per UI-SPEC D-06
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  dragHandle: {
    // Drag handle: 4px height x 32px width per UI-SPEC
    height: 4,
    width: 32,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    flex: 1,
  },
  upgradeButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButton: {
    // 44px touch target per UI-SPEC D-06
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    ...typography.body,
  },
})
