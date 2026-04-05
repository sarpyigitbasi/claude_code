import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Slot } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

const queryClient = new QueryClient()

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    }
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
