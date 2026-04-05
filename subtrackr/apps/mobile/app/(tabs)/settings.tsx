import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { NotificationToggle } from '../../components/settings/NotificationToggle'
import { colors, typography, spacing } from '../../lib/theme'

export default function SettingsScreen() {
  const { signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Notifications section */}
      <Text style={styles.sectionHeader}>Notifications</Text>
      <View style={styles.section}>
        <NotificationToggle />
      </View>

      {/* Account section */}
      <Text style={styles.sectionHeader}>Account</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder sections for future phases */}
      <Text style={styles.sectionHeader}>Integrations</Text>
      <View style={styles.section}>
        <View style={styles.placeholderRow}>
          <Text style={styles.placeholderText}>Gmail &amp; bank connections — coming in Phase 2</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Subscription</Text>
      <View style={styles.section}>
        <View style={styles.placeholderRow}>
          <Text style={styles.placeholderText}>Pro plan management — coming in Phase 4</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.dominant,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  title: {
    ...typography.display,
    color: colors.light.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  signOutButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: colors.light.destructive,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
})
