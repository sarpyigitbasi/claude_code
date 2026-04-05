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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { colors, typography, spacing } from '../../lib/theme'

interface DeleteConfirmSheetProps {
  visible: boolean
  serviceName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmSheet({
  visible,
  serviceName,
  onConfirm,
  onCancel,
}: DeleteConfirmSheetProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const translateY = useSharedValue(400)

  useEffect(() => {
    if (visible) {
      // Spring animation: damping 20, stiffness 150 (UI-SPEC)
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 })
    } else {
      // Close: damping 25, stiffness 200 (UI-SPEC)
      translateY.value = withSpring(400, { damping: 25, stiffness: 200 })
    }
  }, [visible])

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      {/* Backdrop — 60% opacity per UI-SPEC */}
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel="Dismiss"
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

        {/* Title: "Delete [Service Name]?" per UI-SPEC copywriting contract */}
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Delete {serviceName}?
        </Text>

        {/* Body per UI-SPEC copywriting contract */}
        <Text style={[styles.body, { color: palette.textSecondary }]}>
          This will permanently remove it from your tracker.
        </Text>

        {/* Cancel — secondary surface, full-width, 48px, ABOVE confirm per UI-SPEC */}
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: palette.surfaceElevated }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.cancelText, { color: palette.textPrimary }]}>Cancel</Text>
        </TouchableOpacity>

        {/* Confirm — destructive fill, full-width, 48px per UI-SPEC */}
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: palette.destructive }]}
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${serviceName}`}
        >
          <Text style={styles.confirmText}>Delete Subscription</Text>
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
    // 60% opacity per UI-SPEC
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
  cancelButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.body,
    fontWeight: '600',
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
