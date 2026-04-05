import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { createSubscriptionSchema, type Category } from '@subtrackr/core'
import { type ServiceInfo } from '../../lib/services'
import { useAddSubscription } from '../../hooks/useSubscriptions'
import { colors, typography, spacing } from '../../lib/theme'
import { ServicePicker } from './ServicePicker'
import { CategoryPicker } from './CategoryPicker'

interface AddSubscriptionFormProps {
  visible: boolean
  onClose: () => void
  onPaywallRequired: () => void
}

type BillingFrequency = 'monthly' | 'annual' | 'weekly' | 'unknown'

const FREQUENCY_OPTIONS: Array<{ value: BillingFrequency; label: string }> = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'unknown', label: 'Custom' },
]

export function AddSubscriptionForm({ visible, onClose, onPaywallRequired }: AddSubscriptionFormProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const [serviceName, setServiceName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')

  const addSubscription = useAddSubscription()

  // Button press feedback: scale 0.97, 100ms ease-in-out (UI-SPEC)
  const scale = useSharedValue(1)
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const canSave = serviceName.trim().length > 0 && amount.trim().length > 0

  const handleServiceSelect = (service: ServiceInfo) => {
    setServiceName(service.name)
    if (service.default_amount != null) {
      setAmount(service.default_amount.toFixed(2))
    }
    if (service.default_category) {
      setCategory(service.default_category as Category)
    }
    if (service.default_frequency) {
      setFrequency(service.default_frequency as BillingFrequency)
    }
  }

  const handleSave = async () => {
    // Validation per UI-SPEC copywriting contract
    let hasError = false
    if (!serviceName.trim()) {
      setNameError('Service name is required.')
      hasError = true
    } else {
      setNameError('')
    }

    const parsedAmount = parseFloat(amount)
    if (!amount.trim()) {
      setAmountError('Amount is required.')
      hasError = true
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter a valid amount (e.g. 14.99).')
      hasError = true
    } else {
      setAmountError('')
    }

    if (hasError) return

    // Validate with createSubscriptionSchema from @subtrackr/core
    const input = {
      service_name: serviceName.trim(),
      amount: parsedAmount,
      billing_frequency: frequency,
      next_billing_date: nextBillingDate || undefined,
      category: category ?? undefined,
    }

    try {
      createSubscriptionSchema.parse(input)
    } catch (e: any) {
      // Zod validation error — show first issue
      const firstIssue = e.issues?.[0]?.message
      if (firstIssue?.includes('name')) setNameError(firstIssue)
      else if (firstIssue?.includes('amount') || firstIssue?.includes('valid')) setAmountError(firstIssue)
      return
    }

    try {
      await addSubscription.mutateAsync(input)
      handleClose()
    } catch (err: any) {
      if (err.message === 'FREE_TIER_LIMIT_REACHED') {
        onClose()
        onPaywallRequired()
      }
    }
  }

  const handleClose = () => {
    setServiceName('')
    setAmount('')
    setFrequency('monthly')
    setNextBillingDate('')
    setCategory(null)
    setNameError('')
    setAmountError('')
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: palette.dominant }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
              Add Subscription
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={[styles.closeText, { color: palette.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Service Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
              Service Name *
            </Text>
            <ServicePicker
              value={serviceName}
              onChange={setServiceName}
              onServiceSelect={handleServiceSelect}
              error={nameError}
            />
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
              Amount *
            </Text>
            <View
              style={[
                styles.amountInputContainer,
                {
                  backgroundColor: palette.secondary,
                  borderColor: amountError ? palette.destructive : palette.surfaceElevated,
                },
              ]}
            >
              {/* "$" prefix per UI-SPEC */}
              <Text style={[styles.currencyPrefix, { color: palette.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: palette.textPrimary }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={palette.textSecondary}
                keyboardType="decimal-pad"
                accessibilityLabel="Amount in dollars"
              />
            </View>
            {amountError ? (
              <Text style={[styles.errorText, { color: palette.destructive }]}>
                {amountError}
              </Text>
            ) : null}
          </View>

          {/* Billing Frequency — segmented control per UI-SPEC */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
              Billing Frequency
            </Text>
            <View style={styles.segmentedControl}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor:
                        frequency === opt.value ? palette.accent : palette.secondary,
                    },
                  ]}
                  onPress={() => setFrequency(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: frequency === opt.value }}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      {
                        color:
                          frequency === opt.value ? '#FFFFFF' : palette.textSecondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
              Category
            </Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </View>

          {/* Save button — accent fill, full-width, 48px, Body semibold per UI-SPEC */}
          <Animated.View style={[styles.saveButtonWrapper, animatedButtonStyle]}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: palette.accent,
                  // Disabled: opacity 0.4 until name + amount filled per UI-SPEC
                  opacity: canSave ? 1 : 0.4,
                },
              ]}
              onPress={handleSave}
              disabled={!canSave || addSubscription.isPending}
              onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
              onPressOut={() => { scale.value = withTiming(1, { duration: 100 }) }}
              accessibilityRole="button"
              accessibilityLabel="Add Subscription"
              accessibilityState={{ disabled: !canSave || addSubscription.isPending }}
            >
              <Text style={styles.saveButtonText}>
                {addSubscription.isPending ? 'Saving...' : 'Add Subscription'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.heading,
  },
  closeButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  closeText: {
    ...typography.body,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  currencyPrefix: {
    ...typography.body,
    marginRight: spacing.xs,
  },
  amountInput: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.label,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  segmentLabel: {
    ...typography.label,
    textAlign: 'center',
  },
  saveButtonWrapper: {
    marginTop: spacing.sm,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
