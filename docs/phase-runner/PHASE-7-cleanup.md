# Phase 7 (optional) — Small cleanups from the review

## Deliverables

1. **Unused dependency.** `resend` is listed in `package.json` but
   `src/lib/server/email.ts` uses `fetch` against the Resend REST API. Remove
   it with `npm uninstall resend` so `package-lock.json` stays consistent.
   If npm cannot resolve the registry from the sandbox, report `blocked`
   rather than editing the lockfile by hand.
2. **Test-user seeder.** `seed/create-user.ts` hard-codes
   `test@test.com` / `test123` and grants membership. Make it read
   `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` from the environment, exit with
   a clear message when either is missing, and refuse passwords shorter than
   8 characters. Keep the rest of its behaviour.
3. **Doc drift.** `CLAUDE.md` says the app is deployed with
   `@sveltejs/adapter-node`; `svelte.config.js` uses `@sveltejs/adapter-vercel`.
   Fix the one line in `CLAUDE.md`.
4. **Redundant manual cascades.** `src/routes/admin/lessons/[id]/+page.server.ts`
   (`delete`) and `src/routes/admin/modules/[id]/+page.server.ts` (`delete`)
   delete child rows by hand before the parent; the schema declares
   `onDelete: 'cascade'` for those foreign keys. Leave this as is — it is
   harmless — unless a reviewer finding asks for it. (Listed so the reviewer
   does not flag it as missed work.)

## Definition of Done

- [ ] `grep -n '"resend"' package.json package-lock.json` returns nothing, or the phase reports blocked with the npm error.
- [ ] `seed/create-user.ts` contains no literal password and no literal test email; it reads both from `process.env` and exits non-zero with a message when they are missing.
- [ ] `CLAUDE.md` names `@sveltejs/adapter-vercel` as the deployment adapter.
- [ ] No other files changed.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
