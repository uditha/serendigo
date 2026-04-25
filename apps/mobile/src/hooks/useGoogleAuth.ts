import {
  useAuthRequest,
  makeRedirectUri,
  exchangeCodeAsync,
  type AuthRequestConfig,
  type DiscoveryDocument,
} from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useRef, useState } from 'react'

WebBrowser.maybeCompleteAuthSession()

const API_URL = process.env.EXPO_PUBLIC_API_URL

const discovery: DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

function reversedClientId(clientId: string): string {
  return clientId.split('.').reverse().join('.')
}

interface GoogleAuthResult {
  token: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    serendipityCoins: number
    level: number
    travellerCharacter?: string | null
  }
}

export function useGoogleAuth(onSuccess: (result: GoogleAuthResult) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''

  const redirectUri = makeRedirectUri({
    native: `${reversedClientId(iosClientId)}:/oauth2redirect/google`,
  })

  const config: AuthRequestConfig = {
    clientId: iosClientId,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  }

  const [request, response, promptAsync] = useAuthRequest(config, discovery)

  // Capture codeVerifier synchronously when promptAsync is called — before any re-renders
  const codeVerifierRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!response || response.type !== 'success') {
      if (response?.type === 'error' || response?.type === 'dismiss') {
        setError(response.type === 'error' ? 'Google sign-in failed' : null)
        setLoading(false)
      }
      return
    }

    const code = response.params.code
    const codeVerifier = codeVerifierRef.current

    if (!code) {
      setError('Google sign-in failed — missing auth code')
      setLoading(false)
      return
    }

    if (!codeVerifier) {
      setError('Google sign-in failed — missing code verifier')
      setLoading(false)
      return
    }

    exchangeCodeAsync(
      { clientId: iosClientId, code, redirectUri, extraParams: { code_verifier: codeVerifier } },
      discovery
    )
      .then((tokenResponse) => {
        if (!tokenResponse.accessToken) {
          setError('Google sign-in failed — no access token returned')
          setLoading(false)
          return
        }
        verifyWithApi(tokenResponse.accessToken)
      })
      .catch((err) => {
        setError(`Token exchange failed: ${err.message ?? err}`)
        setLoading(false)
      })
  }, [response])

  async function verifyWithApi(accessToken: string) {
    try {
      const res = await fetch(`${API_URL}/api/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })
      const text = await res.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`API error (${res.status}): ${text.slice(0, 120) || '(empty response)'}`)
      }
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Google sign-in failed')
      }
      onSuccess(json)
    } catch (err: any) {
      setError(err.message ?? 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  function signInWithGoogle() {
    setError(null)
    setLoading(true)
    // Capture codeVerifier now — request object may change after re-renders
    codeVerifierRef.current = request?.codeVerifier
    promptAsync()
  }

  return { signInWithGoogle, loading, error, ready: !!request }
}
