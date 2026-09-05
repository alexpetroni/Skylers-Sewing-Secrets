# Phase 9 — A payment grants membership only to the account that made it

## Why

`src/routes/checkout/success/+page.server.ts` retrieves whatever Stripe
session id is in the URL and, when a user is signed in, calls
`recordMembership(locals.user.id, …)` without checking that the session
belongs to that user. Any signed-in account that visits
`/checkout/success?session_id=<a paid session>` becomes a member: one
payment, unlimited memberships (the buyer shares the URL, or signs in as a
second account and reloads it). The `payments` insert is idempotent on
`stripe_checkout_session_id`, but the `profiles` update runs first and
regardless of whether the payment row was inserted, so idempotency protects
the payment record and not the membership grant.

Two smaller gaps in the same flow: the success page and the webhook carry
two diverging copies of the record-payment-then-grant logic, and the
`checkout` action lets an existing member start a second Stripe Checkout
(the load redirects members away, the action does not).

## Deliverables

### `src/lib/server/membership.ts` (new)

One exported function that both the success page and the webhook call:

```ts
export async function recordPaidCheckout(options: {
	userId: string;
	session: Stripe.Checkout.Session;
	promoCodeId: string | null;
	grantAdmin?: boolean;   // webhook only: ADMIN_EMAIL matched the paid email
	log: string;            // '[success]' or '[webhook]' — keep the existing log prefixes
}): Promise<{ granted: boolean; firstRecording: boolean }>
```

Order of operations, and the invariant each step protects (state it in a
comment above the function):

1. Insert the `payments` row (`status: 'succeeded'`, amount, currency,
   promo_code_id, discount_amount, payment intent id as today) with
   `.onConflictDoNothing().returning({ id, user_id })`. An empty result means
   the session was already recorded. **Let insert errors propagate** — the
   webhook relies on that to return 500 so Stripe retries.
2. If nothing was inserted, select the existing row's `user_id` by
   `stripe_checkout_session_id`. If it is not `options.userId`,
   `console.error` with both ids and return `{ granted: false, firstRecording: false }`
   **without touching `profiles`**. A paid session belongs to exactly one account.
3. Update `profiles` for `userId`: `is_member: true`,
   `member_since: coalesce(member_since, now())`, `stripe_customer_id` when
   `session.customer` is a string, `is_admin: true` only when `grantAdmin`.
   Type the set object as `PgUpdateSetSource<typeof profiles>`.
4. When `firstRecording` and `promoCodeId`, run
   `SELECT increment_promo_code_usage(<id>::uuid)` inside try/catch (log, do not throw).
5. Return `{ granted: true, firstRecording }`.

### `src/routes/checkout/success/+page.server.ts`

- Signed-in branch: before recording anything, check ownership.
  `owns = metadata.user_id ? metadata.user_id === locals.user.id : paidEmail?.toLowerCase() === locals.user.email.toLowerCase()`.
  When `owns` is false: `console.error('[success] checkout session belongs to a different account', { sessionId, userId: locals.user.id })`
  and `error(403, 'This payment was made with a different email address. Sign in with that account to access it.')`.
  This check must come **before** `recordPaidCheckout` — if the page inserted
  the payment row under the wrong user first, the webhook would later find a
  foreign owner and the real buyer would get nothing.
- Replace the local `recordMembership` with `recordPaidCheckout` (wrapped in
  try/catch that logs with `[success]` — the page must still render on a DB
  error). Delete the local function.
- Everything else (cookie handling, user creation, sign-in) stays exactly as
  it is; Phase 5, if it runs later, rewrites that part.

### `src/routes/api/stripe/webhook/+server.ts`

- Replace the inline profile update + payment insert + promo increment with
  `recordPaidCheckout({ …, grantAdmin: <the existing ADMIN_EMAIL comparison>, log: '[webhook]' })`.
- Send the welcome and confirmation emails only when `granted && firstRecording`.
  When `granted` is false, log and return (no emails).
- The admin-grant rule is unchanged: only grant, never revoke, only for `ADMIN_EMAIL`.

### `src/routes/checkout/+page.server.ts` (action `checkout`)

- First statement: if `locals.profile?.is_member`,
  `redirect(303, locals.profile.is_admin ? '/admin' : '/dashboard')` — the
  same rule the load applies. Nothing else in the action changes.

Out of scope: the `pending_signup` cookie (Phase 5), promo validity
predicates (Phase 13), schema changes.

## Steps

1. Read the three route files, `src/lib/server/db/schema.ts` (`payments`, `profiles`), and `docs/phase-runner/PHASE-2-payment-flow.md` for the invariants Phase 2 already established (paid-only, never revoke admin, member_since once).
2. Create `src/lib/server/membership.ts`; commit `feat(payments): shared recordPaidCheckout with ownership check`.
3. Success page: ownership check, then switch to the helper; commit `fix(checkout): success page grants membership only to the paying account`.
4. Webhook: switch to the helper; commit `refactor(webhook): use recordPaidCheckout`.
5. Checkout action member guard; commit `fix(checkout): members cannot start a second checkout`.
6. `npm run check`, `npm run build` after each commit.

## Definition of Done

- [ ] `src/lib/server/membership.ts` exists and exports `recordPaidCheckout`; reading it top to bottom, the `payments` insert precedes the `profiles` update, and the conflict path selects the existing row's `user_id` and returns `{ granted: false }` before any `profiles` write when it differs.
- [ ] `grep -rn "increment_promo_code_usage" src` matches only `src/lib/server/membership.ts`, and the call is guarded by `firstRecording`.
- [ ] `grep -rn "recordMembership" src` returns nothing; `grep -rn "recordPaidCheckout" src` matches the helper, the success page and the webhook.
- [ ] In the success page's signed-in branch, the ownership comparison (`metadata.user_id` against `locals.user.id`, else paid email against `locals.user.email`, case-insensitive) appears before the `recordPaidCheckout` call, and the mismatch path calls `error(403, …)`.
- [ ] The success page still handles the signed-out flow (cookie, `createCredentialUser`, `trySignIn`) exactly as before this phase (`git diff` for the phase shows no change to those blocks other than the `recordMembership` → `recordPaidCheckout` swap).
- [ ] In the webhook, the payment insert error still propagates to the `POST` handler's catch (500 response) — no new try/catch swallows it — and the two `sendEmail` calls are reachable only when `granted && firstRecording`.
- [ ] The webhook's `is_admin` grant still happens only when `env.ADMIN_EMAIL` matches the paid email case-insensitively, and nothing in the phase can set `is_admin` to `false`.
- [ ] The `checkout` action's first statement redirects members (`is_member`) with 303 to `/admin` or `/dashboard`.
- [ ] No file under `drizzle/` or `supabase/` changed; `package.json` unchanged.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
