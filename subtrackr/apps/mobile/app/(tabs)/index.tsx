import { useState } from 'react'
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { type Subscription } from '@subtrackr/core'
import { useSubscriptions, useSubscriptionCount, useDeleteSubscription } from '../../hooks/useSubscriptions'
import { useIsPro } from '../../hooks/useEntitlements'
import { colors, spacing } from '../../lib/theme'
import { TotalCard } from '../../components/dashboard/TotalCard'
import { UpcomingStrip } from '../../components/dashboard/UpcomingStrip'
import { UsageCounter } from '../../components/dashboard/UsageCounter'
import { SubscriptionList } from '../../components/dashboard/SubscriptionList'
import { AddSubscriptionForm } from '../../components/subscriptions/AddSubscriptionForm'
import { EditSubscriptionForm } from '../../components/subscriptions/EditSubscriptionForm'
import { PaywallBottomSheet } from '../../components/paywall/PaywallBottomSheet'

export default function DashboardScreen() {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions()
  const { data: subscriptionCount = 0 } = useSubscriptionCount()
  const { data: isPro = false } = useIsPro()
  const deleteSubscription = useDeleteSubscription()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleAddPress = () => {
    // Check free-tier limit before opening form (D-06)
    if (!isPro && subscriptionCount >= 5) {
      setShowPaywall(true)
      return
    }
    setShowAddForm(true)
  }

  const handleSubscriptionPress = (subscription: Subscription) => {
    setEditingSubscription(subscription)
  }

  const handleDeleteSubscription = async (id: string) => {
    await deleteSubscription.mutateAsync(id)
  }

  const handleUpgrade = () => {
    setShowPaywall(false)
    // TODO Phase 4: Navigate to RevenueCat paywall
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.dominant }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TotalCard — monthly/annual total with toggle (D-01) */}
        <TotalCard subscriptions={subscriptions} isLoading={subsLoading} />

        {/* Section spacing: 48px (2xl) between major sections per UI-SPEC */}
        <View style={{ height: spacing['2xl'] }} />

        {/* 2. UpcomingStrip — hidden if no upcoming renewals (D-03) */}
        <UpcomingStrip
          subscriptions={subscriptions}
          isLoading={subsLoading}
          onSubscriptionPress={handleSubscriptionPress}
        />

        {/* 3. UsageCounter — hidden if pro (D-07) */}
        {!isPro && subscriptionCount > 0 && (
          <>
            <View style={{ height: spacing['2xl'] }} />
            <UsageCounter count={subscriptionCount} isPro={isPro} />
          </>
        )}

        <View style={{ height: spacing['2xl'] }} />

        {/* 4. SubscriptionList or EmptyState */}
        <View style={styles.listContainer}>
          <SubscriptionList
            subscriptions={subscriptions}
            isLoading={subsLoading}
            onSubscriptionPress={handleSubscriptionPress}
            onDeleteSubscription={handleDeleteSubscription}
            onAddPress={handleAddPress}
          />
        </View>
      </ScrollView>

      {/* FAB: "+" to open AddSubscriptionForm per UI-SPEC */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: palette.accent }]}
        onPress={handleAddPress}
        accessibilityRole="button"
        accessibilityLabel="Add subscription"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Forms and Sheets */}
      <AddSubscriptionForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onPaywallRequired={() => setShowPaywall(true)}
      />

      <EditSubscriptionForm
        visible={editingSubscription !== null}
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onDelete={handleDeleteSubscription}
      />

      <PaywallBottomSheet
        visible={showPaywall}
        onUpgrade={handleUpgrade}
        onDismiss={() => setShowPaywall(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    // Screen padding: 16px (md) horizontal per UI-SPEC
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 120, // clearance for FAB + tab bar
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
    minHeight: 300,
  },
  fab: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
