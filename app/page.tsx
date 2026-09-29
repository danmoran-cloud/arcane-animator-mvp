import { ArcaneEditor } from '@/components/editor'
import { MobileNotice } from '@/components/mobile-notice'
import { LoginSplash } from '@/components/login-splash'

export default function Page() {
  return (
    <>
      <ArcaneEditor />
      <MobileNotice />
      <LoginSplash />
    </>
  )
}
