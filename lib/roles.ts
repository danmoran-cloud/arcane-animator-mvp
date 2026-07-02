// Admin access tiers. Kept in a plain module (not a "use server" file) so the
// non-function exports below are valid to import from both server actions and
// client components.

export type Role = 'user' | 'admin' | 'superadmin'

export const ASSIGNABLE_ROLES: Role[] = ['user', 'admin', 'superadmin']
