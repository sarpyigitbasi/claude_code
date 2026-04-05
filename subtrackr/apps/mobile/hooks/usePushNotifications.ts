import { useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'

// Configure notification behavior (show alert even when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

  useEffect(() => {
    registerForPushNotifications()
  }, [])

  async function registerForPushNotifications() {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // Request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    setPermissionStatus(finalStatus)

    if (finalStatus !== 'granted') return

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('renewal-reminders', {
        name: 'Renewal Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      })
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID!,
    })
    setExpoPushToken(tokenData.data)

    // Store in profiles table
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ expo_push_token: tokenData.data })
        .eq('id', user.id)
    }
  }

  return { expoPushToken, permissionStatus }
}
