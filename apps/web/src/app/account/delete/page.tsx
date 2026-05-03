import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete Your Account — SerendiGO',
}

export default function DeleteAccountPage() {
  return (
    <main style={{ fontFamily: 'var(--font-sans, system-ui)', minHeight: '100vh', background: '#F7F0E3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>🏝️</div>
          <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 28, color: '#1A1A2E', margin: '0 0 0.5rem' }}>
            Delete Your SerendiGO Account
          </h1>
          <p style={{ color: '#5A5A7A', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            We're sorry to see you go. Here's how to permanently delete your account and all associated data.
          </p>
        </div>

        {/* In-app method */}
        <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 20, color: '#1A1A2E', margin: '0 0 0.75rem' }}>
            Delete inside the app
          </h2>
          <p style={{ color: '#5A5A7A', fontSize: 14, lineHeight: 1.7, margin: '0 0 1rem' }}>
            The easiest way — no waiting, instant deletion:
          </p>
          <ol style={{ color: '#1A1A2E', fontSize: 14, lineHeight: 2, paddingLeft: '1.25rem', margin: 0 }}>
            <li>Open the SerendiGO app</li>
            <li>Tap your avatar in the Today tab to go to your Profile</li>
            <li>Scroll to the <strong>Account</strong> section</li>
            <li>Tap <strong>Delete account</strong></li>
            <li>Confirm twice — your account is deleted immediately</li>
          </ol>
        </div>

        {/* Email method */}
        <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 20, color: '#1A1A2E', margin: '0 0 0.75rem' }}>
            Request deletion by email
          </h2>
          <p style={{ color: '#5A5A7A', fontSize: 14, lineHeight: 1.7, margin: '0 0 0.75rem' }}>
            If you no longer have access to the app, email us from the address linked to your account:
          </p>
          <a
            href="mailto:privacy@serendigo.app?subject=Account%20deletion%20request&body=Please%20delete%20my%20SerendiGO%20account%20and%20all%20associated%20data.%0A%0AEmail%20address%3A%20"
            style={{ display: 'inline-block', background: '#E8832A', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 22px', borderRadius: 100, textDecoration: 'none' }}
          >
            Email privacy@serendigo.app →
          </a>
          <p style={{ color: '#9A9AB0', fontSize: 13, lineHeight: 1.6, margin: '0.75rem 0 0' }}>
            We'll process your request within 7 days and confirm by email once complete.
          </p>
        </div>

        {/* What gets deleted */}
        <div style={{ background: '#FDF0EE', border: '1px solid #F5C5BF', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <p style={{ color: '#A8332A', fontWeight: 700, fontSize: 13, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What gets deleted
          </p>
          <ul style={{ color: '#5A5A7A', fontSize: 13, lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
            <li>Your account and profile information</li>
            <li>All captures and photos you've submitted</li>
            <li>Journey progress, badges, and Serendipity Coins</li>
            <li>Likes and community activity</li>
            <li>Login sessions and credentials</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
