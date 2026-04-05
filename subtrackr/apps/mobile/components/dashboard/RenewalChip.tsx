import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { type Subscription } from '@subtrackr/core'
import { colors, typography, spacing } from '../../lib/theme'

interface RenewalChipProps {
  subscription: Subscription
  onPress?: () => void
}

function getDaysUntil(dateStr: string | null): number {
  if (!dateStr) return 0
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function RenewalChip({ subscription, onPress }: RenewalChipProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const daysUntil = getDaysUntil(subscription.next_billing_date)
  const daysLabel = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'in 1 day' : `in ${daysUntil} days`

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, { backgroundColor: palette.surfaceElevated }]}
      accessibilityRole="button"
      accessibilityLabel={`${subscription.service_name} renews ${daysLabel}`}
    >
      {/* Service icon — UI-SPEC: 24x24dp */}
      <Ionicons
        name="calendar-outline"
        size={16}
        color={palette.textSecondary}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text
          style={[styles.serviceName, { color: palette.textPrimary }]}
          numberOfLines={1}
        >
          {subscription.service_name}
        </Text>
        {/* Label typography 13px per UI-SPEC */}
        <Text style={[styles.daysLabel, { color: palette.textSecondary }]}>
          {daysLabel}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    // Horizontal padding 8px (sm) per UI-SPEC
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    // Min touch target 44x44px per UI-SPEC accessibility
    minHeight: 44,
    minWidth: 44,
    gap: spacing.xs,
  },
  icon: {
    flexShrink: 0,
  },
  textContainer: {
    flexDirection: 'column',
    flexShrink: 1,
  },
  serviceName: {
    ...typography.label,
    fontWeight: '600',
  },
  daysLabel: {
    ...typography.label,
  },
})
