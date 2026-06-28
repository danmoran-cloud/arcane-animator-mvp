import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Commercial License Agreement — Arcane Animator',
  description: 'How you may use maps and videos exported from Arcane Animator, including commercially.',
}

export default function CommercialLicensePage() {
  return (
    <LegalPage
      title="Commercial License Agreement"
      subtitle={`The license that governs how you may use animated maps and videos you export from ${LEGAL.serviceName}.`}
    >
      <h2>1. Scope</h2>
      <p>
        This Commercial License Agreement ("License") supplements our{' '}
        <Link href="/legal/terms">Terms of Service</Link> and governs your use of
        the maps, videos, and other files you export from {LEGAL.serviceName}{' '}
        ("Exports"), including the {LEGAL.serviceName} effects and outputs
        incorporated into them ("Licensed Effects"). In case of conflict
        regarding Exports, this License controls.
      </p>

      <h2>2. License grant</h2>
      <p>
        Subject to your compliance with this License and the Terms of Service,
        and your payment of any tokens or fees required for an Export,{' '}
        {LEGAL.company} grants you a worldwide, non-exclusive, perpetual,
        royalty-free license to use, reproduce, display, perform, and distribute
        your Exports, including for <strong>commercial purposes</strong>.
      </p>
      <p>Permitted commercial uses include, for example:</p>
      <ul>
        <li>running paid or monetized tabletop games and streams (e.g. on Twitch, YouTube, or paid one-shots);</li>
        <li>including Exports as animated maps within a commercial product you create (such as a published adventure, module, or VTT package), provided the Exports are not the primary value of the product;</li>
        <li>using Exports in client work, Patreon/membership tiers, and promotional materials.</li>
      </ul>

      <h2>3. Ownership</h2>
      <p>
        You retain ownership of your underlying content (the maps and images you
        uploaded or created). {LEGAL.company} and its licensors retain all
        ownership of the Licensed Effects, the effects library, and the
        Service. This License grants rights to use the Licensed Effects only as
        embodied in your Exports — it does not transfer ownership of the Licensed
        Effects to you.
      </p>

      <h2>4. Restrictions</h2>
      <p>You may not:</p>
      <ul>
        <li>sell, sublicense, or distribute the Licensed Effects, the effects library, or any Export in a way whose primary purpose is to let others obtain the effects themselves (for example, as a stock-asset pack, template library, or competing effects product);</li>
        <li>represent that you created the Licensed Effects, or claim ownership of {LEGAL.serviceName} technology;</li>
        <li>use Exports in unlawful, infringing, defamatory, or hateful materials;</li>
        <li>extract, isolate, or re-package the Licensed Effects from an Export for reuse outside that Export;</li>
        <li>use Exports to train or develop a competing animated-map or generative product without our written permission.</li>
      </ul>

      <h2>5. Third-party and uploaded content</h2>
      <p>
        This License covers only the Licensed Effects and {LEGAL.serviceName}{' '}
        outputs. It does <strong>not</strong> grant you any rights in maps,
        artwork, fonts, or other materials you uploaded or obtained elsewhere.
        You are solely responsible for holding the rights necessary to use any
        such materials, including for commercial purposes.
      </p>

      <h2>6. Attribution</h2>
      <p>
        Attribution is appreciated but not required for permitted commercial use.
        You may credit "Animated with {LEGAL.serviceName}" where practical.
      </p>

      <h2>7. Term and termination</h2>
      <p>
        The license to Exports you created while in compliance is perpetual and
        survives termination of your account, except that we may terminate this
        License with respect to any Export that was created in violation of the
        Terms of Service or that infringes a third party's rights. Sections 3–5,
        8, and 9 survive termination.
      </p>

      <h2>8. Disclaimer and liability</h2>
      <p>
        Exports and Licensed Effects are provided "as is" without warranties of
        any kind. {LEGAL.company}'s liability under this License is subject to the
        disclaimers and the limitation of liability in the{' '}
        <Link href="/legal/terms">Terms of Service</Link>.
      </p>

      <h2>9. Governing law</h2>
      <p>
        This License is governed by the laws of the State of{' '}
        {LEGAL.governingLawState}, consistent with the{' '}
        <Link href="/legal/terms">Terms of Service</Link>.
      </p>

      <h2>10. Contact</h2>
      <p>
        Licensing questions:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
