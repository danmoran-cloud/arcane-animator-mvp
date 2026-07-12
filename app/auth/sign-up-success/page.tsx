import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Sparkles, Wand2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { SIGNUP_BONUS_TOKENS } from '@/lib/tokens'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo size={48} showWordmark={false} href="/" />
          </div>
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif tracking-wide">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent you a confirmation link to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to complete your registration and start creating animated battle maps.
          </p>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span><strong>{SIGNUP_BONUS_TOKENS} free exports</strong> are waiting in your account</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/">
              <Wand2 className="w-4 h-4 mr-2" />
              Start Creating
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
