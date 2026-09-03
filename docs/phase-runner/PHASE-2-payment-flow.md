# Phase 2 — Payment flow: grant only what was paid for, never revoke by accident

## Why

Three defects in the Stripe path:

1. The webhook sets `is_admin: customerEmail === env.ADMIN_EMAIL` on every
   successful checkout. Any existing admin who buys the course loses the
   flag, and the comparison is case-sensitive.
2. The webhook handles `checkout.session.completed` without checking
   `payment_status`, and both the webhook and the success page overwrite
   `member_since` on every event.
3. The success page takes the buyer's email from the `pending_signup` cookie
   and only falls back to the Stripe session when the cookie is missing, so a
   cookie written by a different checkout attempt is applied to this payment's
   account. When the cookie has expired and the success page creates the user
   itself, it uses a random password and sends no set-password email, while
   the page copy tells the user to check their inbox.

## Deliverables

### `src/routes/api/stripe/webhook/+server.ts`

- At the top of `handleCheckoutComplete`, return early (with a `[webhook]` log line) when `session.payment_status !== 'paid'`.
- Replace the `is_admin` line: only when `env.ADMIN_EMAIL` is set **and** `customerEmail?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()`, set `is_admin: true`. Never set `is_admin: false` here. Add a comment stating why.
- `member_since` becomes `sql\`coalesce(${profiles.member_since}, now())\`` so it is set once. Type the update object as `PgUpdateSetSource<typeof profiles>` (import type from `drizzle-orm/pg-core`).

### `src/routes/checkout/success/+page.server.ts`

- Compute `paidEmail` from `stripeSession.customer_details?.email || stripeSession.customer_email`. It is the email used for lookup and creation, always.
- The `pending_signup` cookie contributes `password` and `fullName` **only** when `parsed.email` is a string and `parsed.email.trim().toLowerCase() === paidEmail.toLowerCase()`; otherwise log with `console.error` and ignore it. Validate `parsed.password` / `parsed.fullName` are strings before use. Delete the cookie in every case, as today.
- When the success page creates the user (the `createCredentialUser` call succeeds) and no cookie password was available, call `getAuth().api.requestPasswordReset({ body: { email, redirectTo: '/auth/reset-password' } })` in its own try/catch (log, don't fail the page). Do not send it when the user was created with the cookie password, and do not send it when the user already existed (the webhook sends it in that case).
- `member_since` uses the same `coalesce` expression and `PgUpdateSetSource` typing in `recordMembership`.
- Keep the existing `needsSignIn` return shape; `src/routes/checkout/success/+page.svelte` must not need changes.

### `src/routes/checkout/+page.server.ts` (action `checkout`)

- Read `fullName` trimmed and `email` trimmed + lower-cased once at the top of the action; use those values for validation, the duplicate check, the cookie, Stripe `customer_email` and `metadata.full_name`.
- Reject `fullName.length > 100` with the existing errors shape.

Out of scope: redesigning the pending-signup mechanism (a later, optional phase), anything in `src/lib/server/users.ts`.

## Steps

1. Read the three files above end to end plus `src/lib/server/users.ts` and `src/lib/server/auth.ts`.
2. Implement the webhook changes; commit `fix(webhook): only grant membership when paid, never revoke admin, set member_since once`.
3. Implement the success page changes; commit `fix(checkout): trust the paid session email and send set-password link when needed`.
4. Implement the checkout action normalisation; commit `fix(checkout): normalise name and email once`.
5. `npm run check` and `npm run build` after each commit.

## Definition of Done

- [ ] `handleCheckoutComplete` returns before any DB write when `session.payment_status !== 'paid'`.
- [ ] `grep -n "is_admin" src/routes/api/stripe/webhook/+server.ts` shows `is_admin` assigned only inside a conditional that compares lower-cased emails and guards on `env.ADMIN_EMAIL` being set; no `is_admin: false` and no unconditional `is_admin:` assignment.
- [ ] In both the webhook and `recordMembership`, `member_since` is `sql\`coalesce(${profiles.member_since}, now())\`` and the update object is typed `PgUpdateSetSource<typeof profiles>`.
- [ ] In the success load, the email used for lookup/creation comes from the Stripe session (`customer_details.email` / `customer_email`), never from the cookie.
- [ ] Cookie `password`/`fullName` are used only when the cookie email equals the paid email case-insensitively; a mismatch is logged with `console.error` and ignored; the cookie is deleted either way.
- [ ] `requestPasswordReset` is called from the success load exactly in the branch where `createCredentialUser` succeeded without a cookie password, wrapped in try/catch.
- [ ] Checkout action: `fullName` is trimmed and `email` is trimmed and lower-cased once; a name over 100 characters returns `fail(400, { fullName, email, errors })`; `metadata.full_name` uses the trimmed value.
- [ ] `src/routes/checkout/success/+page.svelte` and `src/lib/server/users.ts` are unchanged.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
