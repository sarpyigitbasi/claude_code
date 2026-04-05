// packages/supabase/client.ts
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as aesjs from 'aes-js'
import 'react-native-get-random-values'

/**
 * LargeSecureStore — hybrid storage adapter for Supabase auth in Expo.
 *
 * Problem: expo-secure-store has a 2048-byte limit per value.
 * Supabase session tokens routinely exceed this limit.
 *
 * Solution: Store an AES-256 encryption key in SecureStore (small, under limit),
 * and store the encrypted session payload in AsyncStorage (no size limit).
 * This is the ONLY correct storage adapter for Supabase auth in Expo.
 */
class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8))
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1))
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value))
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey))
    return aesjs.utils.hex.fromBytes(encryptedBytes)
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key)
    if (!encryptionKeyHex) return null
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    )
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)))
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key)
    if (!encrypted) return null
    return this._decrypt(key, encrypted)
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key)
    await SecureStore.deleteItemAsync(key)
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value)
    await AsyncStorage.setItem(key, encrypted)
  }
}

/**
 * Supabase client for React Native / Expo.
 * Uses LargeSecureStore adapter for encrypted session persistence.
 */
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // MUST be false on native — no URL-based OAuth callbacks
    },
  },
)

/**
 * createWebClient — Supabase client factory for Next.js (server + client components).
 * Uses @supabase/ssr cookie-based storage instead of SecureStore (web has no SecureStore).
 *
 * Usage: Import and call in your server/client component utilities per @supabase/ssr docs.
 * Full implementation wired in Plan 01-02 alongside the Next.js auth flow.
 */
export function createWebClient(
  cookieStore: { get: (name: string) => { value: string } | undefined },
) {
  // Dynamic import to avoid bundling @supabase/ssr into mobile builds
  // This function should only be called in Next.js server/client contexts
  const { createServerClient } = require('@supabase/ssr')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
}
