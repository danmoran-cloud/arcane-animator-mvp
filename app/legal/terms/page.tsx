import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Terms of Service — Arcane Animator',
  description: 'The terms that govern your use of Arcane Animator.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle={`These terms form a binding agreement between you and ${LEGAL.company} ("${LEGAL.serviceName}", "we", "us", or "our").`}
    >
      <h2>1. Acceptance of these Terms</h2>
      <p>
        These Terms of Service ("Terms") govern your access to and use of the{' '}
        {LEGAL.serviceName} website, application, and related services
        (collectively, the "Service"). By creating an account, accessing, or
        using the Service, you agree to be bound by these Terms and by our{' '}
        <Link href="/legal/privacy">Privacy Policy</Link> and{' '}
        <Link href="/legal/cookies">Cookie Policy</Link>, which are incorporated
        by reference. If you do not agree, do not use the Service.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age of digital consent
        in your jurisdiction) to use the Service, and at least 18 years old to
        make purchases. If you use the Service on behalf of an organization, you
        represent that you are authorized to bind that organization to these
        Terms.
      </p>

      <h2>3. Accounts and security</h2>
      <ul>
        <li>
          You are responsible for the accuracy of your account information and
          for maintaining the confidentiality of your credentials.
        </li>
        <li>
          You are responsible for all activity that occurs under your account.
          Notify us promptly at{' '}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> of
          any unauthorized use.
        </li>
        <li>
          We may suspend or terminate accounts that violate these Terms or that
          create risk or legal exposure for us or other users.
        </li>
      </ul>

      <h2>4. The Service</h2>
      <p>
        {LEGAL.serviceName} lets you upload static map images, add animated
        visual effects, save projects, and export animated videos for use in
        virtual tabletop ("VTT") software and other tabletop role-playing
        contexts. We may add, change, or remove features at any time.
      </p>

      <h2>5. Tokens, payments, and refunds</h2>
      <ul>
        <li>
          Certain exports consume "tokens." Tokens may be granted for free
          (including periodic free exports) or purchased in packs. Pricing and
          token costs are shown on the <Link href="/pricing">pricing page</Link>{' '}
          and may change prospectively.
        </li>
        <li>
          Payments are processed by our third-party payment processor (Stripe).
          We do not store full payment card details. Your purchase is also
          subject to the processor's terms.
        </li>
        <li>
          Tokens have no cash value, are non-transferable, and except where
          required by law are non-refundable once consumed. Tokens do not
          expire unless stated otherwise at the time of purchase.
        </li>
        <li>
          If you believe you were charged in error, contact{' '}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </li>
      </ul>

      <h2>6. Your content</h2>
      <p>
        "Your Content" means the maps, images, project files, and other
        materials you upload or create using the Service. You retain all
        ownership rights in Your Content. You grant us a limited, worldwide,
        non-exclusive, royalty-free license to host, store, process, reproduce,
        and display Your Content solely to operate, secure, and improve the
        Service and to provide it back to you (for example, to render and export
        your projects).
      </p>
      <p>
        You represent and warrant that you own or have all necessary rights to
        Your Content and that it does not infringe any third party's
        intellectual property, privacy, or other rights. You are solely
        responsible for ensuring you have the rights to any map or image you
        upload.
      </p>

      <h2>7. Exports and licensing of effects</h2>
      <p>
        Subject to your compliance with these Terms and payment of any
        applicable tokens, we grant you a license to use the animated effects
        and outputs we provide as incorporated into your exported maps. The
        scope of permitted use — including commercial use — is described in the{' '}
        <Link href="/legal/commercial-license">Commercial License Agreement</Link>.
      </p>

      <h2>8. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>upload or create content that is unlawful, infringing, defamatory, or that you lack the rights to use;</li>
        <li>upload content that is hateful, harassing, or sexually exploitative of minors;</li>
        <li>reverse engineer, scrape, or attempt to extract source code or assets except as permitted by law;</li>
        <li>interfere with, overload, or disrupt the Service or its infrastructure;</li>
        <li>circumvent token metering, usage limits, access controls, or security features;</li>
        <li>resell or commercially exploit the Service itself (as opposed to your exported maps) without our written permission.</li>
      </ul>

      <h2>9. Intellectual property</h2>
      <p>
        The Service, including its software, design, effects library, branding,
        and the "{LEGAL.serviceName}" name and logo, is owned by {LEGAL.company}{' '}
        and protected by intellectual property laws. Except for the rights
        expressly granted to you, we reserve all rights. See our{' '}
        <Link href="/legal/copyright">Copyright Information</Link> for details.
      </p>

      <h2>10. Third-party services</h2>
      <p>
        The Service integrates third-party providers (for example, Supabase for
        authentication and data storage, Stripe for payments, Vercel for hosting
        and analytics, and Discord for community). Your use of those features may
        be subject to the third parties' own terms and privacy practices.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We
        may suspend or terminate your access if you breach these Terms, or to
        comply with law or protect the Service or its users. Upon termination,
        the licenses you granted us will continue only as needed for backups,
        legal compliance, and the operation of features that depend on retained
        data, and provisions that by their nature should survive (including
        Sections 6, 9, 12–15) will survive.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE,
        AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
        UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT YOUR CONTENT WILL NOT BE
        LOST. YOU ARE RESPONSIBLE FOR MAINTAINING YOUR OWN BACKUPS OF IMPORTANT
        WORK.
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, {LEGAL.company.toUpperCase()}{' '}
        AND ITS OWNERS, MEMBERS, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR
        ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THE
        SERVICE. OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL
        NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US IN THE 12 MONTHS
        BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) US $100.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {LEGAL.company} from any claims,
        damages, liabilities, and expenses (including reasonable attorneys' fees)
        arising from Your Content, your use of the Service, or your violation of
        these Terms or applicable law.
      </p>

      <h2>15. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the State of{' '}
        {LEGAL.governingLawState}, without regard to its conflict-of-laws rules.
        You agree that the state and federal courts located in{' '}
        {LEGAL.governingLawState} have exclusive jurisdiction over any dispute
        that is not subject to arbitration or small-claims resolution, and you
        consent to venue there.
      </p>

      <h2>16. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes,
        we will update the effective date above and, where appropriate, provide
        additional notice. Your continued use of the Service after changes take
        effect constitutes acceptance of the revised Terms.
      </p>

      <h2>17. Contact</h2>
      <p>
        {LEGAL.company} —{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
