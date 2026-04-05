import { View, FlatList, useColorScheme, StyleSheet } from 'react-native'
import { type Subscription } from '@subtrackr/core'
import { colors, spacing } from '../../lib/theme'
import { SkeletonBlock } from '../ui/SkeletonBlock'
import { SubscriptionRow } from './SubscriptionRow'
import { EmptyState } from './EmptyState'

interface SubscriptionListProps {
  subscriptions: Subscription[] | undefined
  isLoading: boolean
  onSubscriptionPress: (subscription: Subscription) => void
  onDeleteSubscription?: (id: string) => void
  onAddPress: () => void
}

/**
 * Sorts subscriptions by amount descending (D-02), ties broken alphabetically.
 */
function sortSubscriptions(subs: Subscription[]): Subscription[] {
  return [...subs].sort((a, b) => {
    const amountDiff = (b.amount ?? 0) - (a.amount ?? 0)
    if (amountDiff !== 0) return amountDiff
    return (a.service_name ?? '').localeCompare(b.service_name ?? '')
  })
}

export function SubscriptionList({
  subscriptions,
  isLoading,
  onSubscriptionPress,
  onDeleteSubscription,
  onAddPress,
}: SubscriptionListProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  if (isLoading) {
    // Loading: 5 SkeletonBlock rows per UI-SPEC
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} width="100%" height={64} borderRadius={12} />
        ))}
      </View>
    )
  }

  const sorted = sortSubscriptions(subscriptions ?? [])

  if (sorted.length === 0) {
    return <EmptyState onAddPress={onAddPress} />
  }

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <SubscriptionRow
          subscription={item}
          onPress={() => onSubscriptionPress(item)}
          onDelete={onDeleteSubscription ? () => onDeleteSubscription(item.id) : undefined}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
  },
})
