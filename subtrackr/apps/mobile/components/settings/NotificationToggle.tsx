import { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/theme'

export function NotificationToggle() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreference()
  }, [])

  async function loadPreference() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()
    if (data?.notification_preferences) {
      setEnabled(data.notification_preferences.renewal_reminders !== false)
    }
    setLoading(false)
  }

  async function togglePreference(value: boolean) {
    setEnabled(value)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({
        notification_preferences: { renewal_reminders: value },
      })
      .eq('id', user.id)
  }

  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Renewal Reminders</Text>
        <Text style={styles.description}>Get notified 3 days before a subscription renews</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={togglePreference}
        disabled={loading}
        trackColor={{ false: colors.light.surfaceElevated, true: colors.light.accent }}
        thumbColor={'#ffffff'}
        ios_backgroundColor={colors.light.surfaceElevated}
        style={styles.switch}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
})
