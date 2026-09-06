# Phase 15 — Review follow-ups: hook responses, error handling, small fixes, formatter

## Why

Collects the small findings the reviewers of phases 5–14 and the 2026-09-06
evaluation left open. None is a security hole; together they close the last
known gaps in the request pipeline and error handling, fix a few user-facing
messages, and add a formatter so style stops being enforced by review only.

**This phase explicitly authorises two new devDependencies, `prettier` and
`prettier-plugin-svelte`** (entry rule 3). Nothing else may be added. It does
not reformat existing files.

## Deliverables

### 1. Every hook response carries the security headers (`src/hooks.server.ts`)

Today the `/admin` gate and the maintenance gate `redirect()` / `error()` out
of `handle`; SvelteKit turns those into responses without passing through
`withSecurityHeaders`, and the 503 for non-GET requests has no `Retry-After`.

- Extract the two gates into a module-private
  `function applyGates(event: RequestEvent): void` that keeps using
  `redirect()` / `error()` exactly as now.
- In `handle`, call it inside `try { … } catch (e)`:
  `isRedirect(e)` → return
  `withSecurityHeaders(new Response(null, { status: e.status, headers: { location: e.location } }), event.url)`;
  `isHttpError(e)` → return
  `withSecurityHeaders(json({ message: e.body.message }, { status: e.status }), event.url)`,
  adding `Retry-After: 300` and `Cache-Control: no-store` when the status is
  503; anything else is rethrown. `isRedirect`, `isHttpError` and `json` come
  from `@sveltejs/kit`.
- Do not wrap the `svelteKitHandler(...)` call: redirects and errors from
  loads and actions are handled inside `resolve`.
- Delete the two "Known gap" comments; replace them with one comment stating
  the invariant: every response leaving the hook passes through
  `withSecurityHeaders`.

### 2. `/checkout/cancel` is maintenance-exempt (`src/lib/server/maintenance.ts`)

Add `'/checkout/cancel'` to `MAINTENANCE_EXEMPT_PREFIXES` with a comment
(Stripe's `cancel_url`; a buyer backing out during maintenance must not land
on the maintenance page). Seven entries.

### 3. Branded fallback error page and `handleError`

- `src/error.html` (new): static, inline CSS only, the site name, the logo at
  `/logo/logo.png`, `%sveltekit.status%` and `%sveltekit.error.message%`, and a
  link to `/`. No scripts, no external assets. SvelteKit uses it when no
  `+error.svelte` can render (root layout failures, some hook errors).
- `src/hooks.server.ts`:
  `export const handleError: HandleServerError = ({ error, event, status, message }) => …`
  — `const errorId = crypto.randomUUID()`;
  `console.error(`[error] ${status} ${event.request.method} ${event.url.pathname} id=${errorId}`, error)`;
  return `{ message: status >= 500 ? 'Something went wrong. Please try again.' : message, errorId }`.
  Never put the raw error in the returned message.
- `src/app.d.ts`: `interface Error { message: string; errorId?: string }`.

### 4. Atomic account creation (`src/lib/server/users.ts`)

The Neon HTTP driver has no `db.transaction` (it throws "No transactions
support in neon-http driver"; see `node_modules/drizzle-orm/neon-http/session.js`),
but `db.batch([...])` sends the statements in one Neon transaction. Rewrite
`createCredentialUser` to
`await db.batch([<insert users>, <insert accounts>, <insert profiles … onConflictDoNothing()>])`
with the same `profiles` values `ensureProfile` inserts (read it). A failure
then leaves no orphan `users` row. Keep the exported signature and return
value; `ensureProfile` stays for its other callers.

### 5. Honest message when sign-in fails after account creation (`src/routes/checkout/+page.server.ts`)

When `createCredentialUser` succeeded but `signInEmail` throws, return
`fail(500, { fullName, email, error: 'Your account was created but we could not sign you in. Please sign in with the password you chose and return to checkout.' })`.
Keep the `console.error`.

### 6. Newsletter: sign the unsubscribe link before saving (`src/routes/api/newsletter/+server.ts`)

Compute `const unsubscribe = await unsubscribeUrl(email)` before the insert,
so a signing failure (missing `BETTER_AUTH_SECRET`) cannot report a 500 for a
subscription that was saved. Pass it to `newsletterWelcomeEmail`.

### 7. No email addresses in `[success]` logs (`src/routes/checkout/success/+page.server.ts`)

The "Processing payment session" log prints the customer email and the full
metadata, and the `needsSignIn` log prints the paid email. Log ids and
statuses only: session id, `payment_status`, `metadata.user_id`, resolved
user id. Keep the `[success]` prefix style. No other log line changes.

### 8. Suspended admins are not routed to the admin panel (`src/routes/auth/redirect/+server.ts`, `src/routes/auth/sign-in/+page.server.ts`)

Replace the raw `is_admin` routing checks with `isActiveAdmin` from
`$lib/server/access`. In the sign-in action, which queries `profiles` right
after signing in, select the full profile row (or at least `is_admin` and
`is_suspended`) and decide with `isActiveAdmin`. Everything else about
sign-in is unchanged.

### 9. Seeder (`seed/create-user.ts`)

Replace the line that prints the password with
`console.log('  Password: (from SEED_USER_PASSWORD)')`.

### 10. Formatter config and Node version hint

- `npm install --save-dev prettier prettier-plugin-svelte` (if the registry
  is unreachable, report `blocked` for this item only; never edit
  `package-lock.json` by hand).
- `.prettierrc`:
  `{ "useTabs": true, "singleQuote": true, "trailingComma": "none", "printWidth": 100, "plugins": ["prettier-plugin-svelte"], "overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }] }`
  — this matches the existing style (tabs, single quotes).
- `.prettierignore`: `.svelte-kit`, `build`, `.vercel`, `node_modules`,
  `package-lock.json`, `drizzle`, `supabase`, `static`, `tailwind`, `.phase-runner`.
- `package.json` scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.
- Run `npx prettier --check .` once and state the number of files it would
  change in your report. **Do not reformat any existing file and do not add
  `format:check` to CI or the gate** — the repo-wide formatting pass is a
  separate decision.
- `.nvmrc` containing `22` (matches the Vercel runtime in `svelte.config.js`).

Out of scope: ESLint, reformatting, the newsletter signup form or removing
`/api/newsletter`, anything under `drizzle/` or `supabase/`, new tests
(nothing here is a pure helper that Phase 14's rules allow a test to import).

## Steps

1. Read `src/hooks.server.ts`, `src/lib/server/maintenance.ts`,
   `src/lib/server/users.ts` (`createCredentialUser`, `ensureProfile`),
   `src/lib/server/db/index.ts`, the checkout, success, newsletter and auth
   files named above, `src/app.d.ts`, `seed/create-user.ts`, and
   `node_modules/drizzle-orm/neon-http/session.js` (confirm `batch` exists
   and `transaction` throws).
2. One commit per numbered item, in order. Suggested messages:
   `fix(hooks): every hook response carries the security headers`,
   `fix(maintenance): exempt the checkout cancel page`,
   `feat(errors): branded fallback page and handleError`,
   `fix(users): create credential users atomically with db.batch`,
   `fix(checkout): honest message when sign-in fails after account creation`,
   `fix(newsletter): sign the unsubscribe link before saving the subscriber`,
   `fix(success): no email addresses in logs`,
   `fix(auth): suspended admins are not routed to the admin panel`,
   `chore(seed): do not print the password`,
   `chore: prettier config and scripts, .nvmrc`.
3. `npm run check`, `npm run build`, `npm test` after each commit.

## Definition of Done

- [ ] In `src/hooks.server.ts` no thrown `redirect()` / `error()` can escape `handle`: `applyGates` runs inside a `try` whose `catch` handles `isRedirect` and `isHttpError` and rethrows the rest; both branches return through `withSecurityHeaders`; a 503 built there carries `Retry-After` and `Cache-Control: no-store` (read the code).
- [ ] `MAINTENANCE_EXEMPT_PREFIXES` has exactly seven entries including `/checkout/cancel`.
- [ ] `src/error.html` exists, contains `%sveltekit.status%`, and references no `<script>` and no external URL.
- [ ] `handleError` is exported from `src/hooks.server.ts`, logs status, method, path and an id, and never returns the raw error message for status ≥ 500; `App.Error` declares `errorId`.
- [ ] `createCredentialUser` performs its three inserts in one `db.batch([...])` call; `grep -rn "db.transaction" src` returns nothing.
- [ ] The checkout action's sign-in failure message says the account was created.
- [ ] In the newsletter endpoint `unsubscribeUrl(` appears before `.insert(newsletter_subscribers)` in file order and the insert is no longer inside the same failure path as the signing.
- [ ] No `[success]` log statement prints an email address or the full metadata object (reviewer reads the file).
- [ ] Neither `src/routes/auth/redirect/+server.ts` nor `src/routes/auth/sign-in/+page.server.ts` makes a routing decision on raw `is_admin`; both import `isActiveAdmin`.
- [ ] `grep -n 'Password: \${' seed/create-user.ts` returns nothing.
- [ ] `git diff <phase base> -- package.json` adds exactly two devDependencies (`prettier`, `prettier-plugin-svelte`) and two scripts (`format`, `format:check`); `package-lock.json` was written by npm; `.prettierrc`, `.prettierignore` and `.nvmrc` exist; no other file was reformatted (every other diff is limited to the items above).
- [ ] `format:check` is not referenced in `.github/workflows/ci.yml`.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds; `npm test` passes.
