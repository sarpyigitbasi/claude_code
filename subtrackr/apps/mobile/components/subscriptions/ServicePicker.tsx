import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { searchServices, type ServiceInfo } from '../../lib/services'
import { colors, typography, spacing } from '../../lib/theme'

interface ServicePickerProps {
  value: string
  onChange: (name: string) => void
  onServiceSelect: (service: ServiceInfo) => void
  error?: string
}

export function ServicePicker({ value, onChange, onServiceSelect, error }: ServicePickerProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light
  const [suggestions, setSuggestions] = useState<ServiceInfo[]>([])
  const [reduceMotion, setReduceMotion] = useState(false)

  // Auto-suggest list height animation — 150ms ease-out (UI-SPEC)
  const listHeight = useSharedValue(0)
  const animatedListStyle = useAnimatedStyle(() => ({
    height: listHeight.value,
    overflow: 'hidden',
  }))

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
  }, [])

  const handleChangeText = (text: string) => {
    onChange(text)
    const results = searchServices(text)
    setSuggestions(results)
    // Animate list: 150ms ease-out (UI-SPEC)
    const targetHeight = results.length > 0 ? results.length * 56 : 0
    if (reduceMotion) {
      listHeight.value = targetHeight
    } else {
      listHeight.value = withTiming(targetHeight, { duration: 150 })
    }
  }

  const handleSelect = (service: ServiceInfo) => {
    onChange(service.name)
    setSuggestions([])
    listHeight.value = reduceMotion ? 0 : withTiming(0, { duration: 150 })
    onServiceSelect(service)
  }

  return (
    <View style={styles.container}>
      {/* Text input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: palette.secondary,
            borderColor: error ? palette.destructive : palette.surfaceElevated,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: palette.textPrimary }]}
          value={value}
          onChangeText={handleChangeText}
          placeholder="e.g. Netflix, Spotify..."
          placeholderTextColor={palette.textSecondary}
          accessibilityLabel="Service name"
          returnKeyType="done"
        />
      </View>

      {/* Inline error — textDestructive, Label size (UI-SPEC) */}
      {error && (
        <Text style={[styles.errorText, { color: palette.destructive }]}>
          {error}
        </Text>
      )}

      {/* Auto-suggest list with height animation */}
      <Animated.View style={[styles.suggestionContainer, animatedListStyle]}>
        {suggestions.map((service) => (
          <TouchableOpacity
            key={service.key}
            style={[styles.suggestionRow, { backgroundColor: palette.secondary }]}
            onPress={() => handleSelect(service)}
            accessibilityRole="button"
            accessibilityLabel={`${service.name}${service.default_amount ? `, $${service.default_amount}` : ''}`}
          >
            {/* Service icon — 24x24dp per UI-SPEC D-08 */}
            <View style={styles.suggestionIcon}>
              <Ionicons
                name={service.icon as any}
                size={24}
                color={palette.textSecondary}
              />
            </View>
            {/* Service name — Body typography per UI-SPEC D-08 */}
            <Text style={[styles.suggestionName, { color: palette.textPrimary }]}>
              {service.name}
            </Text>
            {/* Known amount — Label, textSecondary per UI-SPEC D-08 */}
            {service.default_amount != null && (
              <Text style={[styles.suggestionAmount, { color: palette.textSecondary }]}>
                ${service.default_amount.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.label,
  },
  suggestionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  suggestionIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionName: {
    ...typography.body,
    flex: 1,
  },
  suggestionAmount: {
    ...typography.label,
    flexShrink: 0,
  },
})
