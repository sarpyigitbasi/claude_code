import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const email = params.email ?? ''
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async () => {
    setError(null)
    setResendSuccess(false)
    setResending(true)
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (resendError) {
        setError('Something went wrong. Check your connection and try again.')
      } else {
        setResendSuccess(true)
      }
    } catch {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.body}>
        We sent a verification link to{'\n'}
        <Text style={styles.emailText}>{email || 'your email address'}</Text>.
      </Text>
      <Text style={styles.body}>
        Open the link to activate your account, then come back to log in.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {resendSuccess ? (
        <Text style={styles.successText}>Verification email resent!</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, resending && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={resending}
      >
        {resending ? (
          <ActivityIndicator color="#4F46E5" />
        ) : (
          <Text style={styles.buttonText}>Resend verification email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.linkText}>Back to login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
  },
  button: {
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
})
