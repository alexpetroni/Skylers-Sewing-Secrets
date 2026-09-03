# Phase 6 (optional) — Newsletter unsubscribe link and route

## Why

`newsletter_subscribers` has `is_active` and `unsubscribed_at`, but nothing
ever writes them and the welcome email carries no unsubscribe link.

## Deliverables

### `src/lib/server/newsletter.ts` (new)

- `unsubscribeToken(email: string): Promise<string>` — HMAC-SHA256 of the lower-cased email keyed with `BETTER_AUTH_SECRET` (WebCrypto `crypto.subtle`), hex-encoded. Throws if the secret is unset.
- `unsubscribeUrl(email: string): Promise<string>` — `${PUBLIC_SITE_URL || 'https://skylersewingsecrets.com'}/newsletter/unsubscribe?email=<encoded>&token=<token>`.
- `verifyUnsubscribeToken(email, token): Promise<boolean>` — constant-time comparison of equal-length strings.

### `src/routes/newsletter/unsubscribe/+page.server.ts` and `+page.svelte` (new)

- `load`: requires `email` and `token` query params; invalid or missing token → `error(400, 'This unsubscribe link is invalid.')`; valid → returns `{ email }` so the page can show a confirm button (no state change on GET).
- Action `default`: re-verify `email` + `token` from the form; set `is_active: false, unsubscribed_at: now` where `email` matches; return `{ success: true }`. No error if the address is not subscribed (idempotent).
- Page: confirmation form and a success state, using the existing `Alert` and button classes; `noindex` meta.

### Email

- `newsletterWelcomeEmail` takes `unsubscribeUrl: string` and renders a footer link in both HTML and text bodies. `src/routes/api/newsletter/+server.ts` builds the URL and passes it.

Out of scope: unsubscribe links in transactional emails (welcome/purchase/reset are not marketing).

## Definition of Done

- [ ] `src/lib/server/newsletter.ts` exists with the three functions; the token is an HMAC-SHA256 hex digest keyed by `BETTER_AUTH_SECRET` over the lower-cased email.
- [ ] `GET /newsletter/unsubscribe` never mutates the database; the POST action does, only after verifying the token.
- [ ] The welcome email HTML and text both contain the unsubscribe URL.
- [ ] The action is idempotent for unknown or already-inactive addresses.
- [ ] No new dependencies (`git diff package.json` empty).
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
