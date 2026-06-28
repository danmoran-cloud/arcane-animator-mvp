import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { CookieSettingsButton } from '@/components/legal/cookie-settings-button'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Cookie Policy — Arcane Animator',
  description: 'The cookies and similar technologies Arcane Animator uses, and your choices.',
}

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies, and how to control them."
    >
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your browser.
        Similar technologies include local storage and pixels. We use these to
        keep you signed in, remember your preferences, and — with your consent —
        understand how the Service is used.
      </p>

      <h2>2. Categories we use</h2>
      <h3>Strictly necessary (always on)</h3>
      <p>
        These are required for the Service to function and cannot be switched
        off. They include your authentication session (provided by Supabase) and
        the record of your cookie choice itself. Because they are essential, they
        do not require consent.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie / storage</th>
            <th>Purpose</th>
            <th>Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase auth session</td>
            <td>Keeps you signed in securely</td>
            <td>Session / until sign-out</td>
          </tr>
          <tr>
            <td>aa_cookie_consent</td>
            <td>Remembers your cookie preferences</td>
            <td>1 year</td>
          </tr>
        </tbody>
      </table>

      <h3>Analytics (optional — consent required)</h3>
      <p>
        With your consent, we use Vercel Web Analytics to measure aggregate usage
        (such as which features are popular) so we can improve the Service. These
        are loaded only after you select "Accept all cookies." If you reject
        non-essential cookies, analytics are not loaded.
      </p>

      <h2>3. Managing your choices</h2>
      <p>
        When you first visit, we ask for your consent through a banner. You can
        change your decision at any time:
      </p>
      <p>
        <CookieSettingsButton />
      </p>
      <p>
        You can also clear or block cookies through your browser settings, though
        disabling strictly necessary cookies may prevent parts of the Service
        (such as signing in) from working.
      </p>

      <h2>4. Do Not Track</h2>
      <p>
        Because analytics are off by default and only enabled with your explicit
        consent, the Service effectively honors a "do not track" preference until
        you opt in.
      </p>

      <h2>5. More information</h2>
      <p>
        For how we handle personal data generally, see our{' '}
        <Link href="/legal/privacy">Privacy Policy</Link>. Questions can be sent
        to <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalPage>
  )
}
