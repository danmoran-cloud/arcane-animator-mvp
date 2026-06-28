import type { Metadata, Viewport } from 'next'
import { Cinzel, Manrope, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsentProvider } from '@/components/cookie-consent'
import './globals.css'

const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: '--font-cinzel',
  display: 'swap',
})

const manrope = Manrope({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Arcane Animator - Bring Your Maps to Life',
  description: 'The ultimate animated map creator for Game Masters and worldbuilders. Upload static maps and add magical visual effects, then export for any VTT.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0E0E12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${manrope.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <CookieConsentProvider>
          {children}
          <Toaster />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
