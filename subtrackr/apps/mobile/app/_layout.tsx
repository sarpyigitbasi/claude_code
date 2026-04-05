import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Slot, Redirect } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { useAuth } from '../hooks/useAuth'

const queryClient = new QueryClient()

function RootLayoutContent() {
  const { session, loading } = useAuth()

  if (loading) {
    // Show nothing while session is being restored from LargeSecureStore
    return null
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)" />
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
    // Auth state listener wired in Plan 01-02
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  )
}
