# Stripe Setup

How payments work in Arcane Animator, and how to configure them for local development and production.

## Model

Three ways to pay, all defined in [`lib/tokens.ts`](lib/tokens.ts):

- **One-time export packs** (`TOKEN_PACKS`, `unlimited` false) — Adventurer (10/$2.99) and Hero (20/$4.99). Sold via inline `price_data`, so there are **no Products/Prices to create in the dashboard** for these. Pricing is **flat: 1 export = 1 token**, any resolution/duration/frame rate.
- **Lifetime unlimited packs** (`TOKEN_PACKS`, `unlimited` true) — Founder's Tier ($69, limited-time via `availableUntil`) and Noble's Pack ($99). Also inline `price_data` (no dashboard Price). Fulfillment sets `profiles.lifetime_unlimited = true` instead of crediting a balance; a duplicate purchase is blocked once the user is already unlimited.
- **Unlimited-exports subscription** (`SUBSCRIPTION`, $9.99/mo) — a recurring Stripe **Price you must create in the dashboard**, referenced by env var `STRIPE_SUBSCRIPTION_PRICE_ID`.

Unlimited access is granted when `lifetime_unlimited` is true **or** `subscription_status` is `active`/`trialing` (see [`lib/subscription.ts`](lib/subscription.ts) → `hasUnlimitedAccess`).

## Payment flow

1. User clicks Buy on [`/pricing`](app/pricing/page.tsx) → `createTokenPurchaseCheckout` ([`app/actions/stripe.ts`](app/actions/stripe.ts)) creates a hosted Stripe Checkout session and returns its `url`.
2. Browser redirects to Stripe's hosted checkout page. On success → `/checkout/success`, on cancel → `/checkout/cancel`.
3. Stripe sends a `checkout.session.completed` event to the webhook at [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts).
4. The **webhook is the single source of truth**: it verifies the signature, then records a `token_purchases` row and credits `profiles.token_balance`. It is **idempotent** on `stripe_checkout_session_id`, so Stripe's retries never double-credit.

### Subscription flow

1. User clicks Subscribe on `/pricing` → `createSubscriptionCheckout` creates (or reuses) a Stripe **Customer**, stores its id on the profile, and opens a `mode: 'subscription'` Checkout for `STRIPE_SUBSCRIPTION_PRICE_ID`. The user id is stamped on `subscription_data.metadata` so recurring events can resolve the account.
2. On subscribe/renew/change/cancel, Stripe sends `customer.subscription.created|updated|deleted`. The webhook writes `subscription_status`, `stripe_subscription_id`, `stripe_customer_id`, and `subscription_current_period_end` back to the profile. Access flips on/off purely from `subscription_status`.
3. Users manage or cancel via the Stripe **billing portal** — `createBillingPortalSession` (the "Manage Subscription" button on `/account`).

The webhook uses a **service-role** Supabase client (`createAdminClient()` in [`lib/supabase/server.ts`](lib/supabase/server.ts)) because it runs with no user session and RLS would otherwise reject its writes.

## Environment variables

The first four are required for purchases; `STRIPE_SUBSCRIPTION_PRICE_ID` is additionally required for the subscription:

| Variable | Where to get it | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | `sk_test_…` for testing, `sk_live_…` for production |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` (local) **or** the dashboard webhook endpoint (deployed) | `whsec_…` — **differs per environment** (see below) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` secret key | Bypasses RLS — server-only, never expose to the browser |
| `NEXT_PUBLIC_APP_URL` | — | Base URL for success/cancel redirects (e.g. `http://localhost:3000` or your prod URL) |
| `STRIPE_SUBSCRIPTION_PRICE_ID` | Stripe Dashboard → Product catalog → your $9.99/mo recurring Price | `price_…` — **account-specific** (recreate per Stripe account/mode) |

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

> To test the subscription locally, also forward the subscription events (they're included by default with `stripe listen`). After `stripe trigger customer.subscription.created`, or a real test subscribe, `/account` shows the active plan and the editor chip shows **Unlimited**.

## Production setup

1. In the Stripe Dashboard (in **live** mode when going live), create the recurring **Price** for the $9.99/mo subscription (Product catalog → add product → recurring, monthly, $9.99). Copy its `price_…` id into `STRIPE_SUBSCRIPTION_PRICE_ID`.
2. Create a webhook endpoint:
   - **URL**: `https://<your-domain>/api/webhooks/stripe`
   - **Events**: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the endpoint's signing secret (`whsec_…`).
3. Enable the **billing portal** once per account: Stripe Dashboard → Settings → Billing → Customer portal → activate (allow cancellation and payment-method updates).
4. Set all env vars in the production environment, using the **live** `sk_live_…` key, the **dashboard endpoint's** `whsec_…`, the live `price_…`, and `NEXT_PUBLIC_APP_URL` = your production URL.
5. Run [`supabase/add-subscription-columns.sql`](supabase/add-subscription-columns.sql) against the database (once per environment).
6. Deploy, then run one real-card purchase **and** one subscription in live mode to confirm both flows end-to-end.

## Rotating keys / switching Stripe accounts

The Stripe **account** is encoded in the keys (the account id appears as the `…<id>…` segment of every `sk_`/`pk_`/`whsec_`). When you swap to a different account (or rotate keys within one), every account-specific value must be replaced **in lockstep across both local and production** — a key from one account and a webhook secret from another will fail signature verification.

What is and isn't account-specific:

- **Account-specific (must update):** `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` — the local `stripe listen` secret **and** the production dashboard-endpoint secret are *both* tied to the account and are different from each other.
- **Not account-specific (no change):** token packs (inline `price_data`, no Price/Product IDs), `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, and the unused publishable key.

Steps:

1. **Local** — in `.env.local`, set `STRIPE_SECRET_KEY` to the new `sk_test_…`. Get the new local signing secret (no need to start the full listener):
   ```
   stripe listen --api-key <NEW_STRIPE_SECRET_KEY> --print-secret
   ```
   Put that `whsec_…` in `STRIPE_WEBHOOK_SECRET`, then restart `next dev`. Confirm with `stripe trigger checkout.session.completed --api-key <NEW_STRIPE_SECRET_KEY>` (expect the `checkout.session.completed` event to reach 400 "Missing metadata" while all other events return 200 — that proves the signature verifies).
2. **Production** — in the deployment's environment, set `STRIPE_SECRET_KEY` to the new key. Then in the **new account's** Stripe Dashboard create a fresh webhook endpoint (`https://<your-domain>/api/webhooks/stripe`, event `checkout.session.completed`) and copy *its* signing secret into the production `STRIPE_WEBHOOK_SECRET`. The old account's endpoint/secret are now dead — delete or ignore them.

> The CLI may be logged into a different account than your new keys. Always pass `--api-key <NEW_STRIPE_SECRET_KEY>` to `stripe listen`/`stripe trigger` so the local secret and forwarded events come from the right account, regardless of `stripe login` state.

## Database dependencies

The webhook and token features depend on Supabase objects that live in the project **but are not in repo migrations**: tables `profiles` (with `token_balance`), `token_purchases`, `exports`, `coupons`, `coupon_redemptions`, `referrals`; and RPCs `increment_token_balance`, `deduct_tokens_for_export`, `mark_referral_purchased`, `award_referral_reward`. Verify they exist with [`supabase/verify-tokens-schema.sql`](supabase/verify-tokens-schema.sql) before relying on payments in a new environment.

Unlimited access adds six `profiles` columns (`stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_current_period_end`, `lifetime_unlimited`, `is_founder`). Apply them with [`supabase/add-subscription-columns.sql`](supabase/add-subscription-columns.sql) — **the app's export authorization reads `subscription_status` and `lifetime_unlimited`, so they must exist or exports break.**

## Admin token management

Admins can adjust any user's balance at `/admin` → **User Token Management** (look up by email, set a new balance). Backed by `findUserByEmail` / `setUserTokenBalance` in [`app/actions/admin.ts`](app/actions/admin.ts), which authorize the caller as admin and then write with the service-role client.

## Troubleshooting

- **"Invalid signature" (400)** — `STRIPE_WEBHOOK_SECRET` doesn't match this environment's endpoint. Locally, use the secret `stripe listen` printed; in prod, use the dashboard endpoint's secret. Restart after changing.
- **"Missing metadata" (400)** on real purchases — the checkout session wasn't created by `createTokenPurchaseCheckout` (only synthetic/`stripe trigger` events should hit this).
- **Card charged, no tokens** — usually `SUPABASE_SERVICE_ROLE_KEY` missing/wrong (webhook throws), or the Supabase schema/RPCs are absent. Check the server logs and run the verify SQL.
- **Tokens credited twice** — should not happen (idempotent on session id); if it does, confirm the unique constraint / lookup on `token_purchases.stripe_checkout_session_id`.
