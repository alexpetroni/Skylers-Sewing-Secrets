# Phase 5 (optional, design change) — Create the account at checkout time; drop the password cookie

## Why

For signed-out buyers the checkout action stores `{ fullName, email, password }`
**in plaintext** in the `pending_signup` cookie (httpOnly, 30 minutes), and
after payment the success page and the webhook race to create the account,
with the success page calling `setUserPassword` on whichever account owns the
paid email. Creating the account before redirecting to Stripe removes the
cookie, the race, the random-password path and the `setUserPassword` window.

Trade-off accepted by this phase: an abandoned checkout leaves a signed-in,
non-member account. The checkout page already handles signed-in non-members.

## Deliverables

### `src/routes/checkout/+page.server.ts` (action `checkout`)

- After validation and the duplicate-email check for a signed-out buyer:
  1. `createCredentialUser({ email, password, fullName })` from `$lib/server/users`.
  2. `getAuth().api.signInEmail({ body: { email, password }, headers: request.headers })` so the session cookie is set before the Stripe redirect.
  3. If either step throws, `console.error` and `return fail(500, { fullName, email, error: 'Could not create your account. Please try again.' })`. If the failure is a duplicate email (user row already exists), return the existing "already registered, please sign in" error instead.
- Stripe metadata: `user_id` is the new user's id; `pending_signup` and `full_name` are no longer sent. `customer_email` is the buyer's email as before.
- Remove the `pending_signup` cookie write.

### `src/routes/checkout/success/+page.server.ts`

- Remove all cookie handling, `setUserPassword`, `createCredentialUser` and `trySignIn`.
- Signed-in: `ensureProfile`, then — if Phase 9 has run — the ownership check (`metadata.user_id` against `locals.user.id`, else paid email against the user's email) followed by `recordPaidCheckout` from `$lib/server/membership`; keep both exactly as Phase 9 left them. If Phase 9 has not run, `recordMembership` as today.
- Signed-out (cookie-less browser, expired session): resolve the user by `metadata.user_id`, else by the paid email via `findUserIdByEmail`; if found, `recordMembership` and return `needsSignIn: true` with the email; if not found, return `needsSignIn: true` without creating anything (the webhook is the creator of last resort).
- `src/routes/checkout/success/+page.svelte`: the `needsSignIn` copy must no longer promise a password-reset email; say "sign in with the password you chose at checkout" and keep the sign-in and forgot-password links.

### `src/routes/api/stripe/webhook/+server.ts`

- Keep the `metadata.user_id` path and the find-by-email fallback.
- Keep account creation **only** as the last resort when neither resolves (a session created before this deploy, or a lost account); it still uses a random password and sends the set-password email. Remove the `pending_signup` metadata check — creation is driven by "no user found", not by a flag.

### `src/lib/server/users.ts`

- Delete `setUserPassword` if nothing imports it any more.

Out of scope: Google sign-up at checkout (`OAuthButtons` already handles it), email verification.

## Steps

1. Read the four files, `src/lib/server/auth.ts`, and `src/routes/checkout/+page.svelte` (the form must not need changes: it already posts `fullName`, `email`, `password`).
2. Checkout action first, then success page, then webhook, then users.ts; one commit each.
3. `npm run check`, `npm run build`.

## Definition of Done

- [ ] `grep -rn "pending_signup" src` returns nothing.
- [ ] The checkout action creates the user and calls `signInEmail` before `stripe.checkout.sessions.create`, and passes the new id as `metadata.user_id`.
- [ ] A duplicate email at creation time returns the "already registered" error, not a 500.
- [ ] The success load has no `cookies.get`, no `setUserPassword`, no `createCredentialUser`, no `signInEmail` call; a signed-out visitor gets `needsSignIn: true` and no account is created there.
- [ ] If `src/lib/server/membership.ts` exists, the signed-in branch still performs the ownership check before `recordPaidCheckout` (Phase 9 invariant preserved).
- [ ] The success page copy for `needsSignIn` no longer mentions a password-reset email.
- [ ] The webhook creates a user only when neither `metadata.user_id` nor the paid email resolves to an existing user, and still sends the set-password email in that case.
- [ ] `setUserPassword` is removed from `src/lib/server/users.ts` if unused (grep shows no importer).
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
