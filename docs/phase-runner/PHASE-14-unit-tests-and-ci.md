# Phase 14 (optional) — Unit tests for the pure server helpers, and CI

## Why

The repository has no tests and no CI. The runner's gate is type-check plus
build, which cannot catch a wrong discount rounding, an open redirect that
slips past `safeRelativeTarget`, an HTML-escaping regression, a broken
unsubscribe token or a mis-signed Bunny embed URL. The pure helpers are
small and deterministic; testing them is cheap and gives every later phase
a real gate. Vercel's build runs `vite build` only, so `svelte-check` and the
tests never run there for human commits — GitHub Actions is the only place
they run on every push.

**This phase explicitly authorises one new devDependency, `vitest`** (entry
rule 3). Nothing else may be added.

Revised 2026-09-06 after phases 5–8 and 13 ran: the helpers they created are
now mandatory test targets, and the environment handling below replaces the
earlier `vi.stubEnv` idea, which cannot work (see Tooling).

## Deliverables

### Tooling

- `npm install --save-dev vitest@^4` (pin the resolved 4.x; do **not** take
  5.x, released 2026-09-03; if the registry is unreachable from the sandbox,
  report `blocked` — do not edit `package-lock.json` by hand).
- `vite.config.ts`: `import { defineConfig } from 'vitest/config'` (the
  `test` key is a type error with `defineConfig` from `'vite'`, and
  `svelte-check` type-checks this file) and add
  `test: { include: ['src/**/*.test.ts'], environment: 'node' }`. Keep the
  `sveltekit()` plugin so `$lib` and `$env/dynamic/*` resolve. No `globals`;
  test files import `describe`, `it`, `expect`, `vi` from `'vitest'`. Do not
  add `resolve.conditions: ['browser']` (that is for component tests).
- `package.json` script: `"test": "vitest run"`.
- **Environment:** under Vitest the SvelteKit plugin materialises
  `$env/dynamic/private` as a frozen object built once from `.env` and the
  shell at config time, so `vi.stubEnv` / `process.env` changes are invisible
  to `newsletter.ts` and `bunny.ts`. A test that needs env values mocks the
  virtual module at the top of the file, before any import of the module
  under test:
  `vi.mock('$env/dynamic/private', () => ({ env: { BETTER_AUTH_SECRET: 'test-secret' } }))`.
  Vitest isolates modules per test file, so different files may mock
  different values. Never mock the module under test itself.

### Tests (`*.test.ts` next to the module under test)

Each test file imports the real module — the only `vi.mock` allowed is of
`$env/dynamic/private` (and `$env/dynamic/public` if a helper reads it).
Never import `$lib/server/auth`, `$lib/server/db`, or
`$lib/server/membership` (it imports the db) from a test. One `it` per case
below; no padding, no placeholders.

- `src/lib/server/redirects.test.ts` — `safeRelativeTarget`: accepts `/dashboard` and `/modules/a/b?x=1`; falls back (`/dashboard`) for `//evil.com`, `'/\\evil.com'` (note the doubled backslash — the TS literal `'/\evil.com'` is just `/evil.com` and is correctly accepted), `https://evil.com`, `''`, `null`, `undefined`; a custom fallback is honoured.
- `src/lib/server/stripe.test.ts` — `calculateDiscount` only: `(14900, 'percentage', 10)` → `{ discount: 1490, finalPrice: 13410 }`; `(14900, 'percentage', 33)` → `4917` / `9983`; `(101, 'percentage', 50)` → discount `51` (rounding); `(14900, 'fixed', 2000)` → `12900`; `(14900, 'fixed', 20000)` → `14900` / `0` and `(14900, 'percentage', 150)` → `14900` / `0` (capped at the base price). Do not test negative inputs (the helper has no lower bound; the admin action rejects them). Do not test `formatPrice` — the server copy has no importer.
- `src/lib/server/email.test.ts` — `escapeHtml` escapes `& < > " '` and leaves other text unchanged; `contactNotificationEmail('<b>x</b>', 'a@b.c', null, '<script>')` — its **`.html`** contains no raw `<script>` or `<b>` (the `.subject` and `.text` are intentionally unescaped; do not assert on the whole object).
- `src/lib/types/bunny.test.ts` — `parseBunnyUrl`: `bunny:123/abc-def` → `{ libraryId: '123', videoId: 'abc-def' }`; `https://x`, `''` and `bunny:/abc` → `null`.
- `src/lib/server/access.test.ts` — `isActiveMember` and `isActiveAdmin` full truth table over `{ is_member, is_admin, is_suspended }` plus `null`/`undefined`; `requireActiveMember` throws a redirect (`status` 303, `location` starting `/auth/sign-in?redirectTo=`) for `null`, a redirect to `/checkout?redirectTo=…` for a non-member, an error with `status` 403 for a suspended member, and returns for an active member.
- `src/lib/server/newsletter.test.ts` (mock `BETTER_AUTH_SECRET: 'test-secret'`) — `unsubscribeToken` returns 64 lowercase hex characters, is deterministic, and is case-insensitive in the email; `verifyUnsubscribeToken` round-trips and fails for a changed email or a changed token; `unsubscribeUrl` contains `encodeURIComponent(email)` and the token. `src/lib/server/newsletter.nosecret.test.ts` (mock `env: {}`) — `unsubscribeToken` rejects.
- `src/lib/server/bunny.test.ts` (mock `env: {}`) — `getBunnyEmbedUrl('bunny:123/abc')` equals `https://iframe.mediadelivery.net/embed/123/abc?autoplay=false&preload=true`; unparsable input → `null`. `src/lib/server/bunny.signed.test.ts` (mock `BUNNY_EMBED_TOKEN_KEY: 'k'`, `vi.useFakeTimers()` + `vi.setSystemTime`, `ttlSeconds = 60`) — `expires` equals the fixed time in seconds + 60; `token` equals `createHash('sha256').update('k' + 'abc' + expires).digest('hex')` from `node:crypto` and is 64 lowercase hex characters. Read `src/lib/server/bunny.ts` first and match its exact formula and parameter order.
- `src/lib/server/validation.test.ts` — Phase 13 runs before this phase, so the module is expected to exist; if it does not, say so in the report and skip this file. `parseIntField` (empty optional → fallback, empty required → error, `'12abc'` → error, below min / above max → error, in range → value); `isUuid` (one valid, `abc`, `''`); `parseDateField` (empty → `null`, `not a date` → error, `2026-12-31` → ends with `T23:59:59.999Z`); `PROMO_CODE_PATTERN` (`SAVE10` ok, `hi there` rejected); `isBunnyVideoRef`; `isHttpsUrl` (`https://a.b` ok, `http://a.b` and `javascript:alert(1)` rejected).

### CI

- `.github/workflows/ci.yml`: `on: push: branches: ['**']` and `pull_request`;
  `permissions: { contents: read }`;
  `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`;
  `actions/checkout@v4`; `actions/setup-node@v4` with `node-version: 22` and
  `cache: npm`; then `npm ci`, `npm run check`, `npm run build`, `npm test`.
  No secrets needed (the build runs without env vars; verified 2026-09-06).

Out of scope: component tests, Playwright, coverage thresholds, testing
anything that talks to the database or Better Auth, lint/format tooling.

## Steps

1. Read `vite.config.ts`, `package.json`, `.svelte-kit/tsconfig.json` (test files are type-checked), and each module listed above.
2. Install and configure Vitest; commit `chore(test): add vitest`.
3. Write the tests, one commit per module (`test(redirects): …`, `test(stripe): …`, …); run `npx vitest run` after each. If the `$env/dynamic/private` mock does not take effect, say exactly what happened in the report rather than weakening the tests.
4. CI workflow; commit `ci: check, build and test on every push`.
5. `npm run check`, `npm run build`, `npm test` — all green.

## Definition of Done

- [ ] `git diff <phase base> -- package.json` adds exactly one devDependency (`vitest`, 4.x) and one script (`test`); `package-lock.json` was written by npm.
- [ ] `vite.config.ts` imports `defineConfig` from `vitest/config`, keeps `sveltekit()`, and has the `test` block above.
- [ ] `npx vitest run` exits 0 with 0 skipped; `grep -rn "\.skip\|\.only\|xit(\|todo(" src --include=*.test.ts` returns nothing.
- [ ] `grep -rn "vi.mock(" src --include=*.test.ts` matches only `$env/dynamic/private` (or `$env/dynamic/public`); no test imports `$lib/server/db`, `$lib/server/auth` or `$lib/server/membership`.
- [ ] Every case listed above has an `it` (read the files); `formatPrice` and negative discounts are not tested.
- [ ] `.github/workflows/ci.yml` runs `npm ci`, `npm run check`, `npm run build`, `npm test` on Node 22 with the permissions and concurrency blocks.
- [ ] `npm run check` reports 0 errors and no new warnings (test files included); `npm run build` succeeds.

After this phase the runner's gate should become
`npm run check && npm run build && npm test` (edit `GATE_CMD` in
`.phase-runner/runner.env` by hand — the builder cannot).
