# Stripe Setup

How payments work in Arcane Animator, and how to configure them for local development and production.

## Model

One-time **token packs** (no subscriptions). Packs are defined in code in [`lib/tokens.ts`](lib/tokens.ts) (`TOKEN_PACKS`) and sold via inline `price_data` — there are **no Products or Prices to create in the Stripe dashboard**. Change prices/amounts by editing that file.

## Payment flow

1. User clicks Buy on [`/pricing`](app/pricing/page.tsx) → `createTokenPurchaseCheckout` ([`app/actions/stripe.ts`](app/actions/stripe.ts)) creates a hosted Stripe Checkout session and returns its `url`.
2. Browser redirects to Stripe's hosted checkout page. On success → `/checkout/success`, on cancel → `/checkout/cancel`.
3. Stripe sends a `checkout.session.completed` event to the webhook at [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts).
4. The **webhook is the single source of truth**: it verifies the signature, then records a `token_purchases` row and credits `profiles.token_balance`. It is **idempotent** on `stripe_checkout_session_id`, so Stripe's retries never double-credit.

The webhook uses a **service-role** Supabase client (`createAdminClient()` in [`lib/supabase/server.ts`](lib/supabase/server.ts)) because it runs with no user session and RLS would otherwise reject its writes.

## Environment variables

All four are required for purchases to complete:

| Variable | Where to get it | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | `sk_test_…` for testing, `sk_live_…` for production |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` (local) **or** the dashboard webhook endpoint (deployed) | `whsec_…` — **differs per environment** (see below) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` secret key | Bypasses RLS — server-only, never expose to the browser |
| `NEXT_PUBLIC_APP_URL` | — | Base URL for success/cancel redirects (e.g. `http://localhost:3000` or your prod URL) |

> The publishable key (`pk_…`) is **not** needed — we use hosted Checkout, so no Stripe code runs in the browser.

Locally these live in `.env.local` (gitignored). In production, set them in the deployment's environment.

## Local development & testing

The Stripe CLI is required to forward live Stripe events to `localhost`.

1. **Install the CLI** (one time): `winget install --id Stripe.StripeCli --exact`
2. **Start the dev server**: `npx next dev` (serves on `http://localhost:3000`)
3. **Forward webhooks** — using `--api-key` avoids the interactive `stripe login`:
   ```
   stripe listen --api-key <STRIPE_SECRET_KEY> --forward-to localhost:3000/api/webhooks/stripe
   ```
   On startup it prints a signing secret (`whsec_…`). Put **that** value in `.env.local` as `STRIPE_WEBHOOK_SECRET` while testing locally (it is different from the dashboard endpoint's secret), then restart the dev server.
4. **Make a test purchase**: log in, go to `/pricing`, buy a pack, pay with test card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
5. **Verify**: the `stripe listen` window shows `checkout.session.completed [200]`, the server logs `Successfully added N tokens`, and the new balance appears on `/account`.

To replay an event without a browser purchase:
`stripe trigger checkout.session.completed` (note: synthetic events lack our `pack_id`/`user_id` metadata, so the handler returns 400 "Missing metadata" — that still confirms signature verification and connectivity are working).

> The editor's token chip reads a separate mock store and will **not** reflect purchases — verify via `/account` or the database, not the editor chip.

## Production setup

1. In the Stripe Dashboard (in **live** mode when going live), create a webhook endpoint:
   - **URL**: `https://<your-domain>/api/webhooks/stripe`
   - **Events**: `checkout.session.completed`
   - Copy the endpoint's signing secret (`whsec_…`).
2. Set all four env vars in the production environment, using the **live** `sk_live_…` key, the **dashboard endpoint's** `whsec_…`, and `NEXT_PUBLIC_APP_URL` = your production URL.
3. Deploy, then run one real-card purchase in live mode to confirm fulfillment end-to-end.

## Database dependencies

The webhook and token features depend on Supabase objects that live in the project **but are not in repo migrations**: tables `profiles` (with `token_balance`), `token_purchases`, `exports`, `coupons`, `coupon_redemptions`, `referrals`; and RPCs `increment_token_balance`, `deduct_tokens_for_export`, `mark_referral_purchased`, `award_referral_reward`. Verify they exist with [`supabase/verify-tokens-schema.sql`](supabase/verify-tokens-schema.sql) before relying on payments in a new environment.

## Admin token management

Admins can adjust any user's balance at `/admin` → **User Token Management** (look up by email, set a new balance). Backed by `findUserByEmail` / `setUserTokenBalance` in [`app/actions/admin.ts`](app/actions/admin.ts), which authorize the caller as admin and then write with the service-role client.

## Troubleshooting

- **"Invalid signature" (400)** — `STRIPE_WEBHOOK_SECRET` doesn't match this environment's endpoint. Locally, use the secret `stripe listen` printed; in prod, use the dashboard endpoint's secret. Restart after changing.
- **"Missing metadata" (400)** on real purchases — the checkout session wasn't created by `createTokenPurchaseCheckout` (only synthetic/`stripe trigger` events should hit this).
- **Card charged, no tokens** — usually `SUPABASE_SERVICE_ROLE_KEY` missing/wrong (webhook throws), or the Supabase schema/RPCs are absent. Check the server logs and run the verify SQL.
- **Tokens credited twice** — should not happen (idempotent on session id); if it does, confirm the unique constraint / lookup on `token_purchases.stripe_checkout_session_id`.
