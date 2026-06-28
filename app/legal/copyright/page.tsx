import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL, copyrightLine } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Copyright Information — Arcane Animator',
  description: 'Ownership of the Arcane Animator platform, your content, and our marks.',
}

export default function CopyrightPage() {
  return (
    <LegalPage
      title="Copyright Information"
      subtitle="Who owns what across the platform, your content, and our brand."
    >
      <h2>1. Platform copyright</h2>
      <p>
        {copyrightLine()} The {LEGAL.serviceName} website and application,
        including its software, source code, user interface, layout, text,
        graphics, the built-in effects library, animations, sound, and their
        selection and arrangement (collectively, the "Platform Materials"), are
        owned by {LEGAL.company} or its licensors and are protected by United
        States and international copyright, trademark, and other intellectual
        property laws.
      </p>

      <h2>2. Your content</h2>
      <p>
        You retain copyright in the maps, images, and projects you create or
        upload ("Your Content"). Uploading content to the Service does not
        transfer ownership to us; it only grants us the limited license described
        in our <Link href="/legal/terms">Terms of Service</Link> so we can host,
        process, render, and export your work for you.
      </p>
      <p>
        You are responsible for holding the necessary rights to anything you
        upload. Using a third party's map or artwork without permission may
        infringe their copyright.
      </p>

      <h2>3. Exported works</h2>
      <p>
        Maps and videos you export combine Your Content with effects and outputs
        provided by the Service. Your rights to use those exports — including for
        commercial purposes — are set out in the{' '}
        <Link href="/legal/commercial-license">Commercial License Agreement</Link>.
      </p>

      <h2>4. Trademarks</h2>
      <p>
        "{LEGAL.serviceName}", the {LEGAL.serviceName} logo and emblem, and
        related names and marks are trademarks of {LEGAL.company}. You may not use
        them without our prior written permission, except to factually and fairly
        refer to the Service. All other product and company names are the marks
        of their respective owners.
      </p>

      <h2>5. Permitted and prohibited use</h2>
      <ul>
        <li>
          You may use the Service and your exports as permitted by these policies
          and the Commercial License Agreement.
        </li>
        <li>
          You may not copy, modify, distribute, sell, or lease any part of the
          Platform Materials, or reverse engineer or extract our effects library
          or source code, except as permitted by law or with our written consent.
        </li>
      </ul>

      <h2>6. Reporting infringement</h2>
      <p>
        If you believe content on the Service infringes your copyright, please
        follow the process in our{' '}
        <Link href="/legal/dmca">DMCA &amp; Copyright Policy</Link>.
      </p>

      <h2>7. Contact</h2>
      <p>
        Copyright and permissions inquiries:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
