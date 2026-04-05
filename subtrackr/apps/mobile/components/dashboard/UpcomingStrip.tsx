import { View, Text, FlatList, useColorScheme, StyleSheet } from 'react-native'
import { type Subscription } from '@subtrackr/core'
import { colors, typography, spacing } from '../../lib/theme'
import { RenewalChip } from './RenewalChip'
import { SkeletonBlock } from '../ui/SkeletonBlock'

interface UpcomingStripProps {
  subscriptions: Subscription[] | undefined
  isLoading: boolean
  onSubscriptionPress?: (subscription: Subscription) => void
}

function getUpcoming(subscriptions: Subscription[]): Subscription[] {
  const now = new Date()
  return subscriptions
    .filter((s) => {
      if (!s.next_billing_date) return false
      const billing = new Date(s.next_billing_date)
      return billing >= now
    })
    .sort((a, b) => {
      const dateA = new Date(a.next_billing_date ?? '').getTime()
      const dateB = new Date(b.next_billing_date ?? '').getTime()
      return dateA - dateB
    })
    .slice(0, 7) // Show 5-7 per UI-SPEC D-03
}

export function UpcomingStrip({ subscriptions, isLoading, onSubscriptionPress }: UpcomingStripProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonBlock width="50%" height={24} borderRadius={6} />
        <View style={{ height: spacing.sm }} />
        <View style={styles.skeletonRow}>
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} width={100} height={44} borderRadius={20} />
          ))}
        </View>
      </View>
    )
  }

  const upcoming = getUpcoming(subscriptions ?? [])

  // Hidden when no upcoming renewals (UI-SPEC D-03: strip hidden, not empty state)
  if (upcoming.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Section header: Heading typography 20px/600 per UI-SPEC */}
      <Text style={[styles.header, { color: palette.textPrimary }]}>
        Upcoming Renewals
      </Text>
      <FlatList
        data={upcoming}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        renderItem={({ item }) => (
          <RenewalChip
            subscription={item}
            onPress={() => onSubscriptionPress?.(item)}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    ...typography.heading,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
})
