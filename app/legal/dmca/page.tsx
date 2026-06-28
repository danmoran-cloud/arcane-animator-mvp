import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'DMCA & Copyright Policy — Arcane Animator',
  description: 'How to report copyright infringement on Arcane Animator and our takedown process.',
}

export default function DmcaPage() {
  return (
    <LegalPage
      title="DMCA & Copyright Policy"
      subtitle="How to report infringement and how we respond under the Digital Millennium Copyright Act."
    >
      <h2>1. Our policy</h2>
      <p>
        {LEGAL.company} respects the intellectual property rights of others and
        expects users of {LEGAL.serviceName} to do the same. We respond to
        notices of alleged copyright infringement that comply with the Digital
        Millennium Copyright Act ("DMCA"), 17 U.S.C. § 512, and we may remove or
        disable access to allegedly infringing content and terminate repeat
        infringers.
      </p>

      <h2>2. Designated agent</h2>
      <p>
        Send copyright notices to our designated agent:
      </p>
      <ul>
        <li><strong>Copyright Agent</strong>, {LEGAL.company}</li>
        <li>Email: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a></li>
      </ul>

      <h2>3. Filing a takedown notice</h2>
      <p>
        To be effective, your notice must be in writing and include
        substantially the following (per 17 U.S.C. § 512(c)(3)):
      </p>
      <ol>
        <li>your physical or electronic signature;</li>
        <li>identification of the copyrighted work you claim has been infringed;</li>
        <li>identification of the material that is claimed to be infringing and information reasonably sufficient to let us locate it (such as a URL or project reference);</li>
        <li>your contact information (name, address, telephone, and email);</li>
        <li>a statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law;</li>
        <li>a statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the owner's behalf.</li>
      </ol>
      <p>
        Please note that under Section 512(f) you may be liable for damages,
        including costs and attorneys' fees, if you knowingly materially
        misrepresent that material is infringing.
      </p>

      <h2>4. Our response</h2>
      <p>
        Upon receiving a valid notice, we will remove or disable access to the
        identified material and make a reasonable effort to notify the user who
        posted it. We may also remove material we believe in good faith to be
        infringing.
      </p>

      <h2>5. Counter-notice</h2>
      <p>
        If you believe your content was removed in error or misidentification,
        you may submit a counter-notice to{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>{' '}
        containing:
      </p>
      <ol>
        <li>your physical or electronic signature;</li>
        <li>identification of the material that was removed and the location where it appeared before removal;</li>
        <li>a statement, under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification;</li>
        <li>your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal district court for your address (or, if outside the U.S., the district where we may be found), and that you will accept service of process from the party who filed the original notice.</li>
      </ol>
      <p>
        If we receive a valid counter-notice, we may restore the material in
        10–14 business days unless the original complainant notifies us that they
        have filed a court action seeking to restrain the allegedly infringing
        activity.
      </p>

      <h2>6. Repeat infringers</h2>
      <p>
        We will, in appropriate circumstances, suspend or terminate the accounts
        of users who are determined to be repeat infringers.
      </p>

      <h2>7. Contact</h2>
      <p>
        Designated Copyright Agent, {LEGAL.company} —{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
