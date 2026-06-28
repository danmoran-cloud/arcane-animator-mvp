import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Creator Asset License & Marketplace Agreement — Arcane Animator',
  description: 'Future terms for creators who contribute or sell assets through an Arcane Animator marketplace.',
}

export default function CreatorMarketplacePage() {
  return (
    <LegalPage
      title="Creator Asset License & Marketplace Agreement"
      subtitle={`Terms for creators who may contribute, license, or sell assets through a future ${LEGAL.serviceName} marketplace.`}
      notice={
        <p>
          <strong>Not yet in effect.</strong> {LEGAL.serviceName} does not
          currently operate a marketplace, and no asset submission or sale
          features are available. This document is published in advance for
          transparency and will take effect only if and when a marketplace
          launches. Until then, it creates no obligations. Your current use of
          the Service is governed by the{' '}
          <Link href="/legal/terms">Terms of Service</Link> and{' '}
          <Link href="/legal/commercial-license">Commercial License Agreement</Link>.
        </p>
      }
    >
      <h2>1. Purpose</h2>
      <p>
        This Creator Asset License &amp; Marketplace Agreement ("Creator
        Agreement") will govern the relationship between {LEGAL.company} and
        users ("Creators") who, if and when a marketplace is offered, submit,
        list, license, or sell maps, effects, packs, or other digital assets
        ("Creator Assets") to or through {LEGAL.serviceName} (the
        "Marketplace").
      </p>

      <h2>2. Effectiveness</h2>
      <p>
        This Creator Agreement is <strong>not currently in force</strong>. It
        becomes binding on a Creator only when (a) the Marketplace is made
        available and (b) the Creator affirmatively accepts these terms (for
        example, during an onboarding flow). We may revise this document before
        it takes effect.
      </p>

      <h2>3. Creator eligibility and accounts</h2>
      <ul>
        <li>Creators must have an account in good standing and be at least 18 years old (or the age of majority in their jurisdiction).</li>
        <li>Creators may be required to complete identity and tax verification and to provide payout details through our payment provider.</li>
      </ul>

      <h2>4. Ownership and the Creator license</h2>
      <p>
        Creators will retain ownership of their Creator Assets. By listing a
        Creator Asset, the Creator will grant {LEGAL.company} a non-exclusive,
        worldwide license to host, display, market, demonstrate, and distribute
        the Creator Asset through the Marketplace, and to grant end users a
        license to use it. The Creator will also grant end users a license to use
        purchased Creator Assets on terms consistent with our{' '}
        <Link href="/legal/commercial-license">Commercial License Agreement</Link>.
      </p>

      <h2>5. Creator representations</h2>
      <p>Each Creator will represent and warrant that:</p>
      <ul>
        <li>they own or have all rights necessary to license each Creator Asset;</li>
        <li>the Creator Assets do not infringe any third party's intellectual property, privacy, or other rights;</li>
        <li>the Creator Assets are not unlawful, harmful, or otherwise prohibited by our policies.</li>
      </ul>

      <h2>6. Revenue share and payouts</h2>
      <p>
        If sales are offered, the revenue-share percentage, fees, payment
        thresholds, and payout schedule will be disclosed in the Marketplace at
        the time the feature launches. Taxes, chargebacks, and refunds will be
        handled as described in those published terms.
      </p>

      <h2>7. Content standards and removal</h2>
      <p>
        We may review, reject, or remove Creator Assets that violate our policies
        or applicable law, and we will respond to copyright complaints under our{' '}
        <Link href="/legal/dmca">DMCA &amp; Copyright Policy</Link>.
      </p>

      <h2>8. Indemnification and liability</h2>
      <p>
        Creators will indemnify {LEGAL.company} against claims arising from their
        Creator Assets or their breach of this Creator Agreement. Liability will
        be subject to the limitations in the{' '}
        <Link href="/legal/terms">Terms of Service</Link>.
      </p>

      <h2>9. Term and changes</h2>
      <p>
        Once effective, this Creator Agreement will continue until terminated by
        either party as described in the Marketplace terms. We may update this
        document; the effective date will be revised and Creators notified where
        appropriate.
      </p>

      <h2>10. Governing law</h2>
      <p>
        This Creator Agreement will be governed by the laws of the State of{' '}
        {LEGAL.governingLawState}, consistent with the{' '}
        <Link href="/legal/terms">Terms of Service</Link>.
      </p>

      <h2>11. Contact</h2>
      <p>
        Creator and marketplace inquiries:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
