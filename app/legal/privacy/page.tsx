import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Privacy Policy — Arcane Animator',
  description: 'How Arcane Animator collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle={`How ${LEGAL.company} collects, uses, and shares personal data when you use ${LEGAL.serviceName}.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {LEGAL.company} ("we", "us") is the controller of personal data
        processed through {LEGAL.serviceName}. You can reach us about privacy at{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>

      <h2>2. Data we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li><strong>Account data:</strong> email address, display name, and password (stored in hashed form by our authentication provider).</li>
        <li><strong>Content:</strong> maps and images you upload, projects you create and save, and related metadata.</li>
        <li><strong>Payment data:</strong> when you buy tokens, our payment processor collects your payment details. We receive limited information such as a transaction identifier and the status of the payment — not your full card number.</li>
        <li><strong>Communications:</strong> messages you send us for support or other inquiries.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Usage and device data:</strong> pages viewed, features used, approximate location derived from IP, browser and device type, and similar log data.</li>
        <li><strong>Cookies and similar technologies:</strong> see our <Link href="/legal/cookies">Cookie Policy</Link>. Analytics cookies are used only with your consent.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>to provide, operate, and maintain the Service (including authentication, saving and rendering your projects, and processing exports);</li>
        <li>to process payments and manage token balances;</li>
        <li>to communicate with you about your account, transactions, and support requests;</li>
        <li>with your consent, to understand usage through analytics so we can improve the Service;</li>
        <li>to maintain security, prevent fraud and abuse, and enforce our <Link href="/legal/terms">Terms of Service</Link>;</li>
        <li>to comply with legal obligations.</li>
      </ul>

      <h2>4. Legal bases (for EEA/UK users)</h2>
      <p>
        Where the GDPR or UK GDPR applies, we rely on: <strong>performance of a
        contract</strong> (to provide the Service), <strong>consent</strong> (for
        analytics cookies and optional communications), <strong>legitimate
        interests</strong> (to secure and improve the Service), and{' '}
        <strong>legal obligation</strong> (to meet our compliance duties).
      </p>

      <h2>5. How we share data</h2>
      <p>We do not sell your personal data. We share it only with:</p>
      <ul>
        <li><strong>Service providers ("processors")</strong> who help us run the Service, including Supabase (database, authentication, storage), Stripe (payments), and Vercel (hosting and privacy-friendly analytics);</li>
        <li><strong>Authorities or third parties</strong> where required by law, to enforce our terms, or to protect rights, safety, and security;</li>
        <li><strong>A successor</strong> in connection with a merger, acquisition, or sale of assets, subject to this Policy.</li>
      </ul>

      <h2>6. International transfers</h2>
      <p>
        Our providers may process data in the United States and other countries.
        Where required, we rely on appropriate safeguards (such as Standard
        Contractual Clauses) for international transfers.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep personal data for as long as your account is active or as needed
        to provide the Service, and afterwards only as required for legitimate
        business or legal purposes (such as accounting and fraud prevention).
        You can delete your projects and request account deletion at any time.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        delete, or port your personal data, to object to or restrict certain
        processing, and to withdraw consent. To exercise these rights, contact{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. You
        also have the right to lodge a complaint with your local data protection
        authority.
      </p>
      <p>
        <strong>California residents:</strong> we do not sell or "share" personal
        information as those terms are defined under the CCPA/CPRA, and we will
        not discriminate against you for exercising your privacy rights.
      </p>

      <h2>9. Children's privacy</h2>
      <p>
        The Service is not directed to children under 13, and we do not knowingly
        collect personal data from them. If you believe a child has provided us
        personal data, contact us and we will delete it.
      </p>

      <h2>10. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect
        personal data. However, no method of transmission or storage is
        completely secure, and we cannot guarantee absolute security. Please keep
        your password confidential.
      </p>

      <h2>11. Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. We will revise the effective
        date above and, for material changes, provide additional notice where
        appropriate.
      </p>

      <h2>12. Contact</h2>
      <p>
        {LEGAL.company} —{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
