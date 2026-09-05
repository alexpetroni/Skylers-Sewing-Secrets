# Phase 14 (optional) — Unit tests for the pure server helpers, and CI

## Why

The repository has no tests and no CI. The runner's gate is type-check plus
build, which cannot catch a wrong discount rounding, an open redirect that
slips past `safeRelativeTarget`, or an HTML-escaping regression. The pure
helpers are small and deterministic; testing them is cheap and gives every
later phase a real gate.

**This phase explicitly authorises one new devDependency, `vitest`** (entry
rule 3). Nothing else may be added.

## Deliverables

### Tooling

- `npm install --save-dev vitest` (pin whatever version npm resolves; if the
  registry is unreachable from the sandbox, report `blocked` — do not edit
  `package-lock.json` by hand).
- `vite.config.ts`: add a `test` block — `include: ['src/**/*.test.ts']`,
  `environment: 'node'`. Keep the `sveltekit()` plugin so `$lib` and
  `$env/dynamic/*` resolve under Vitest.
- `package.json` script: `"test": "vitest run"`.

### Tests (`*.test.ts` next to the module under test)

Each test file imports the real module — no mocking of the module under test.
Never import `$lib/server/auth` or `$lib/server/db` from a test (they need a
request context / `DATABASE_URL`).

- `src/lib/server/redirects.test.ts` — `safeRelativeTarget`: accepts `/dashboard`, `/modules/a/b?x=1`; falls back for `//evil.com`, `/\evil.com`, `https://evil.com`, `''`, `null`, `undefined`; custom fallback is honoured.
- `src/lib/server/stripe.test.ts` — `calculateDiscount`: 10 % of 14900 → 1490 / 13410; 33 % rounds (`Math.round`); fixed 2000 → 12900; fixed and percentage discounts are capped at the base price (final price never negative); `formatPrice(14900)` → `£149.00`.
- `src/lib/server/email.test.ts` — `escapeHtml` escapes `& < > " '` and leaves other text unchanged; `contactNotificationEmail('<b>x</b>', 'a@b.c', null, '<script>')` contains no raw `<script>` or `<b>`.
- `src/lib/types/bunny.test.ts` — `parseBunnyUrl`: `bunny:123/abc-def` → `{ libraryId: '123', videoId: 'abc-def' }`; `https://…`, `''` and `bunny:/abc` → `null`.
- If the file exists when this phase runs (earlier optional phases): `src/lib/server/access.test.ts` (`isActiveMember`, `isActiveAdmin` truth table), `src/lib/server/validation.test.ts` (`parseIntField` bounds, `isUuid`, `parseDateField`, `PROMO_CODE_PATTERN`), `src/lib/server/newsletter.test.ts` (token is 64 lowercase hex chars, verify round-trips, a changed email fails; set `BETTER_AUTH_SECRET` via `vi.stubEnv` or a dummy `process.env` value for the test), `src/lib/server/bunny.test.ts` (unsigned output equals the legacy string; with a key set, `token` is 64 hex chars and `expires` is an integer). Skip the ones whose module does not exist — say so in the report, do not create placeholder tests.

### CI

- `.github/workflows/ci.yml`: on `push` and `pull_request` for all branches;
  Node 22 with npm cache; `npm ci`, `npm run check`, `npm run build`,
  `npm test`. No secrets needed (the build runs without env vars).

Out of scope: component tests, Playwright, coverage thresholds, testing
anything that talks to the database or Better Auth.

## Steps

1. Read `vite.config.ts`, `package.json`, and each module listed above.
2. Install and configure Vitest; commit `chore(test): add vitest`.
3. Write the tests, one commit per module (`test(redirects): …`, `test(stripe): …`, …); run `npx vitest run` after each.
4. CI workflow; commit `ci: check, build and test on every push`.
5. `npm run check`, `npm run build`, `npm test` — all green.

## Definition of Done

- [ ] `git diff <phase base> -- package.json` adds exactly one devDependency (`vitest`) and one script (`test`); `package-lock.json` was written by npm.
- [ ] `npx vitest run` exits 0 with at least 20 passing tests and 0 skipped; `grep -rn "\.skip\|\.only\|xit(" src --include=*.test.ts` returns nothing.
- [ ] Each test file imports the real module under test (no `vi.mock` of `$lib/server/redirects`, `$lib/server/stripe`, `$lib/server/email`, `$lib/types`).
- [ ] The four mandatory test files exist and cover the listed cases (read them); optional ones exist only where the module exists.
- [ ] `.github/workflows/ci.yml` runs `npm ci`, `npm run check`, `npm run build`, `npm test` on Node 22.
- [ ] `npm run check` reports 0 errors and no new warnings (test files included); `npm run build` succeeds.

After this phase the runner's gate should become
`npm run check && npm run build && npm test` (edit `GATE_CMD` in
`.phase-runner/runner.env` by hand — the builder cannot).
