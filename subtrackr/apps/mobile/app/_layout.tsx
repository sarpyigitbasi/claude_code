import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Slot, Redirect } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { useAuth } from '../hooks/useAuth'
import { usePushNotifications } from '../hooks/usePushNotifications'

const queryClient = new QueryClient()

function AuthGuard() {
  const { session, loading } = useAuth()

  if (loading) {
    // Show nothing while session is being restored from LargeSecureStore (AUTH-04)
    return null
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)" />
}

// Registers push token after auth session is confirmed
function PushRegistrar() {
  usePushNotifications()
  return null
}

export default function RootLayout() {
  useEffect(() => {
    // RevenueCat initialization (per RESEARCH.md Pattern 2)
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    Purchases.configure({
      apiKey: Platform.select({
        ios: process.env.EXPO_PUBLIC_RC_IOS_KEY!,
        android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY!,
      })!,
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
      <PushRegistrar />
      <Slot />
    </QueryClientProvider>
  )
}
