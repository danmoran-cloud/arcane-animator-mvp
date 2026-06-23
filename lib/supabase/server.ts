import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Service-role client for trusted server-to-server contexts (e.g. the Stripe
 * webhook) that run with no authenticated user. The service-role key bypasses
 * Row-Level Security, so this MUST only be used in code paths that have already
 * verified their own authenticity (the webhook verifies Stripe's signature).
 * Never import this into anything reachable from the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      // No user session in this context; provide inert cookie handlers.
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    },
  )
}

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
