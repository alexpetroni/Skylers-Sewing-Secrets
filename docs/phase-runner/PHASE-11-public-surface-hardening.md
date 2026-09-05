# Phase 11 — Shrink the public surface

## Why

Four independent exposures, none of them requiring a schema change:

1. `emailAndPassword.enabled` also enables `POST /api/auth/sign-up/email`, so
   anyone can create accounts (and `profiles` rows) without going through
   checkout. The app never uses that endpoint: credential users are created by
   `createCredentialUser` (direct inserts), Google sign-up goes through the
   social provider.
2. `src/routes/+layout.server.ts` serialises `locals.session` into every
   page's data — including the raw session `token`, `ipAddress` and
   `userAgent`. No client code reads `data.session`.
3. `GET /api/stripe/webhook` tells any visitor which secrets are configured.
4. Responses carry no security headers (`X-Content-Type-Options`,
   `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS), and
   `POST /api/progress` writes whatever `lessonId`/`position`/`completed` it
   receives straight into the upsert, turning malformed input into 500s.

## Deliverables

### `src/lib/server/auth.ts`

- `emailAndPassword.disableSignUp: true`, with a comment: accounts are created
  by checkout, the Stripe webhook and Google sign-in; the public sign-up
  endpoint is not part of the product. Sign-in, `requestPasswordReset`,
  `resetPassword` and `signInEmail` are unaffected.

### `src/routes/+layout.server.ts` and `src/app.d.ts`

- The root layout returns `{ user: locals.user, profile: locals.profile }` only.
- Remove `session` from `App.PageData`. `App.Locals.session` stays.

### `src/routes/api/stripe/webhook/+server.ts`

- Delete the `GET` handler and its comment. `/api/health` remains the liveness check.

### `src/hooks.server.ts` — response headers

- A small `withSecurityHeaders(response: Response): Response` in the same file
  that sets, when absent:
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  and `Strict-Transport-Security: max-age=31536000; includeSubDomains` only when
  `event.url.protocol === 'https:'`.
- Both `svelteKitHandler(...)` returns (the `/api/auth/` early return and the
  final one) pass through it. The `building` branch is untouched.
- Do **not** add a Content-Security-Policy in this phase (it needs allow-lists
  for fonts, the Bunny iframe and the CDN that cannot be verified without a
  browser) and do not restrict `autoplay`, `fullscreen` or
  `picture-in-picture` in `Permissions-Policy` — the lesson player's iframe
  requests them.

### `src/routes/api/progress/+server.ts` (`POST`)

- Validate the JSON body before touching the database:
  `lessonId` must match `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`;
  `completed`, when present, must be a boolean; `position`, when present, must
  be an integer between 0 and 86400. Anything else → `json({ error: 'Invalid request' }, { status: 400 })`.
- Confirm the lesson exists and is published (`select id from lessons where id = … and is_published`); otherwise 404 `{ error: 'Lesson not found' }`.
- The upsert itself is unchanged.

Out of scope: rate limiting (needs shared storage), CSP, changing what
`locals.user` contains, Phase 10's suspension checks in this endpoint (if
Phase 10 already ran, keep its checks in place).

## Steps

1. Read the five files and `grep -rn "data.session\|page.data.session" src` to confirm nothing reads the session client-side.
2. Auth option; commit `fix(auth): disable the public email sign-up endpoint`.
3. Layout data + `app.d.ts`; commit `fix(auth): stop serialising the session object into page data`.
4. Webhook GET removal; commit `fix(webhook): remove the public env-presence endpoint`.
5. Security headers; commit `feat(security): baseline response headers`.
6. Progress validation; commit `fix(progress): validate the request body and the lesson`.
7. `npm run check`, `npm run build` after each commit.

## Definition of Done

- [ ] `grep -n "disableSignUp: true" src/lib/server/auth.ts` matches inside the `emailAndPassword` block.
- [ ] `grep -n "session" src/routes/+layout.server.ts` returns nothing; `App.PageData` in `src/app.d.ts` has no `session` member; `App.Locals.session` is still declared.
- [ ] `grep -n "export const GET" src/routes/api/stripe/webhook/+server.ts` returns nothing; the `POST` handler is byte-for-byte unchanged apart from removed imports that only the GET used.
- [ ] `src/hooks.server.ts` defines `withSecurityHeaders` setting exactly the five headers above (HSTS conditional on https) and both `svelteKitHandler` results pass through it; `grep -n "Content-Security-Policy" src/hooks.server.ts` returns nothing.
- [ ] `POST /api/progress` rejects a non-UUID `lessonId`, a non-boolean `completed` and a non-integer or out-of-range `position` with 400 before any database call, and returns 404 for an unknown or unpublished lesson (read the handler; the validation precedes the `insert`).
- [ ] No new dependencies (`git diff package.json` empty); no file under `drizzle/` or `supabase/` changed.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
