import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** Pixel size of the emblem mark */
  size?: number
  /** Whether to render the "Arcane Animator" wordmark next to the emblem */
  showWordmark?: boolean
  /** Optional href; when provided the logo is wrapped in a Link */
  href?: string
  /** Stack the wordmark tagline under the name */
  withTagline?: boolean
  className?: string
}

export function Logo({
  size = 32,
  showWordmark = true,
  href,
  withTagline = false,
  className,
}: LogoProps) {
  const content = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <Image
          src="/arcane-animator-emblem.png"
          alt="Arcane Animator emblem"
          width={size}
          height={size}
          className="object-contain drop-shadow-[0_0_8px_rgba(123,77,255,0.35)]"
          priority
        />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-serif font-semibold tracking-[0.12em] text-foreground uppercase text-sm">
            Arcane Animator
          </span>
          {withTagline && (
            <span className="mt-1 text-[10px] tracking-[0.2em] text-primary uppercase">
              Bring Your Maps to Life
            </span>
          )}
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Arcane Animator home">
        {content}
      </Link>
    )
  }

  return content
}
