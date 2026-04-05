import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { type Category } from '@subtrackr/core'
import { colors, typography, spacing } from '../../lib/theme'

const CATEGORIES: Array<{ value: Category; label: string; icon: string }> = [
  { value: 'entertainment', label: 'Entertainment', icon: 'tv-outline' },
  { value: 'productivity', label: 'Productivity', icon: 'briefcase-outline' },
  { value: 'health', label: 'Health', icon: 'heart-outline' },
  { value: 'finance', label: 'Finance', icon: 'cash-outline' },
  { value: 'shopping', label: 'Shopping', icon: 'cart-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
]

interface CategoryPickerProps {
  value: Category | null
  onChange: (category: Category | null) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isSelected = value === cat.value
        return (
          <TouchableOpacity
            key={cat.value}
            onPress={() => onChange(isSelected ? null : cat.value)}
            style={[
              styles.cell,
              {
                backgroundColor: palette.secondary,
                borderColor: isSelected ? palette.accent : 'transparent',
                borderWidth: 2,
              },
            ]}
            // Min 44x44 touch target per UI-SPEC accessibility
            accessibilityRole="button"
            accessibilityLabel={cat.label}
            accessibilityState={{ selected: isSelected }}
          >
            <Ionicons
              name={cat.icon as any}
              size={24}
              color={isSelected ? palette.accent : palette.textSecondary}
            />
            <Text
              style={[
                styles.cellLabel,
                { color: isSelected ? palette.accent : palette.textSecondary },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    // ~30% width in 3-column grid with gaps
    width: '30%',
    // Min 44x44 touch target per UI-SPEC
    minHeight: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  cellLabel: {
    ...typography.label,
    textAlign: 'center',
  },
})
