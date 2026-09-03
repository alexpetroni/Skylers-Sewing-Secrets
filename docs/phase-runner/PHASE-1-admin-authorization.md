# Phase 1 — Admin authorization that covers form actions

## Why

`src/routes/admin/+layout.server.ts` redirects non-admins, but SvelteKit runs
form actions **before** layout loads. None of the 14 admin `+page.server.ts`
files re-check `is_admin`, so today any visitor can POST to
`/admin/users?/toggleSuspend`, `/admin/pricing?/updatePrice`,
`/admin/lessons/<id>?/delete` and so on, and the action executes. Separately,
a session whose user has no `profiles` row is special-cased in several loads
instead of being repaired once.

## Deliverables

1. A request-level admin gate in `src/hooks.server.ts` that runs for every
   request whose path is exactly `/admin` or starts with `/admin/`, after the
   session and profile have been loaded and before `resolve`:
   - signed out: `GET`/`HEAD` → `redirect(303, '/auth/sign-in?redirectTo=<encoded pathname>')`; any other method → `error(401, 'Unauthorized')`.
   - signed in but `!locals.profile?.is_admin`: `GET`/`HEAD` → `redirect(303, '/')`; any other method → `error(403, 'Forbidden')`.
   - Use `redirect` and `error` from `@sveltejs/kit` (they throw and SvelteKit handles them in hooks). Do not hand-build `Response` objects.
   - Leave `src/routes/admin/+layout.server.ts` in place as a second layer.
2. Profile self-heal in the same hook: when `getSession` returns a user but
   the `profiles` select returns no row, call `ensureProfile` from
   `$lib/server/users` with the user's id, email and name, then re-select.
   Wrap it in try/catch; on failure `console.error('[hooks] …')` and continue
   with `profile = null`. Do not change the early return for `/api/auth/*`.
3. A comment above the gate stating the invariant ("SvelteKit runs form
   actions before layout loads, so the layout guard alone does not protect
   POSTs").

Out of scope: adding checks inside individual admin actions (the gate makes
them redundant), any change under `src/routes/admin/**`.

## Steps

1. Read `src/hooks.server.ts`, `src/lib/server/users.ts`, `src/routes/admin/+layout.server.ts`.
2. Implement the self-heal, then the gate, in `src/hooks.server.ts` only.
3. Run `npm run check` and `npm run build`.
4. Commit: `fix(auth): gate every /admin request in hooks and self-heal missing profiles`.

## Definition of Done

- [ ] `src/hooks.server.ts` contains a gate matching `event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')` placed after `event.locals.profile` is assigned and before the final `svelteKitHandler`/`resolve` call.
- [ ] Signed-out `GET`/`HEAD` under `/admin` → 303 to `/auth/sign-in?redirectTo=` + `encodeURIComponent(pathname)`; signed-out non-read methods → `error(401, …)`.
- [ ] Signed-in non-admin `GET`/`HEAD` under `/admin` → 303 to `/`; non-read methods → `error(403, …)`.
- [ ] Only `redirect`/`error` from `@sveltejs/kit` are used for those outcomes (grep shows no `new Response(` in `src/hooks.server.ts`).
- [ ] When the profile select is empty for a signed-in user, `ensureProfile({ userId, email, fullName })` is called and the profile re-selected; the call is inside try/catch with `console.error` on failure.
- [ ] The `/api/auth/` early return still skips `getSession` and the profile query.
- [ ] `src/routes/admin/+layout.server.ts` is unchanged (`git diff --stat` for the phase does not list it).
- [ ] No file under `src/routes/admin/` is modified in this phase.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
