# Phase 12 (optional, design change) — Maintenance mode covers the whole public site

## Why

The admin "maintenance mode" toggle (`site_settings.maintenance_mode`) is read
by exactly one load, `src/routes/+page.server.ts`. With the switch on, the
homepage shows the `Maintenance` component while `/modules`, `/blog`,
`/checkout`, `/contact` and every other page keep working.

Design chosen by this phase (revised 2026-09-06 after review): during
maintenance, active admins see the normal site; everyone else gets the
maintenance page **with HTTP status 503** at `/`, is redirected to `/` from
every other page, and gets 503 for non-GET requests. Payments must still
complete and sign-in must still work.

Why 503 and not a redirect to a 200 page: search engines treat 503 as
"temporarily away, keep the index"; a 303 to a homepage answering 200 with
`noindex` is read as "remove these pages" and de-indexes the site during the
window. The 503 is therefore part of this phase, not out of scope.

Why no cache: on Vercel every function instance has its own module scope, so
a module-level cache is per instance, saves almost nothing at this site's
traffic, and only adds staleness. `site_settings.key` is the primary key; one
indexed read per non-exempt request is acceptable.

## Deliverables

### `src/lib/server/maintenance.ts` (new)

- `export async function isMaintenanceMode(): Promise<boolean>` — one query:
  `site_settings` where `key = 'maintenance_mode'`, returns `value === 'true'`.
  No caching. On a database error `console.error('[maintenance] …', err)` and
  return `false` (fail-open: if the database is down the admin cannot turn the
  flag off either, and a broken site must not lock visitors out on top of
  it). State this in a comment.
- `export const MAINTENANCE_EXEMPT_PREFIXES = ['/admin', '/auth/', '/api/auth/', '/api/stripe/', '/api/health', '/checkout/success']`
  with a one-line comment per entry: admins must reach the panel; sign-in,
  sign-out and OAuth must work so admins can get in; Better Auth lives under
  `/api/auth/`; the Stripe webhook must be accepted; the health check must
  answer; buyers returning from Stripe must be provisioned. `/api/progress`
  and `/api/newsletter` are deliberately **not** exempt — maintenance freezes
  member and visitor writes.
- `export function isMaintenanceExempt(pathname: string): boolean` —
  `startsWith` over the list.

### `src/app.d.ts` and `src/hooks.server.ts`

- Add `maintenanceMode: boolean` to `App.Locals`. Set it to `false` in the
  `building` branch and the `/api/auth/` branch.
- After `event.locals.profile` is assigned and after the `/admin` gate:
  ```ts
  event.locals.maintenanceMode =
  	!isMaintenanceExempt(event.url.pathname) &&
  	!isActiveAdmin(event.locals.profile) &&
  	(await isMaintenanceMode());
  ```
  `isActiveAdmin` from `$lib/server/access` (a suspended admin is not exempt;
  invariant from Phase 10). Then, when `event.locals.maintenanceMode` is true:
  - path `/`: let the request resolve (the homepage load renders the
    maintenance page, see below). If `!event.isDataRequest`, return the
    resolved response re-wrapped as
    `new Response(response.body, { status: 503, headers: response.headers })`
    plus `Retry-After: 300` and `Cache-Control: no-store`, passed through
    `withSecurityHeaders` like every other response. Data requests
    (`__data.json`, `event.isDataRequest === true`) keep their status so
    client-side navigation to `/` still works.
  - any other path: `GET`/`HEAD` → `redirect(303, '/')`; other methods →
    `error(503, 'The site is under maintenance. Please try again shortly.')`.
- Comment stating the invariant. Known and accepted: a `redirect()` /
  `error()` thrown from the hook is turned into a response by SvelteKit
  without passing through `withSecurityHeaders` — the same gap the `/admin`
  gate already has. Do not try to fix it in this phase.

### `src/routes/+page.server.ts`

- Delete the inline `site_settings` query. The load returns
  `{ maintenance: true }` early when `locals.maintenanceMode` is true. Admins
  therefore see the normal homepage during maintenance (the hook never sets
  the flag for them). `+page.svelte` is unchanged; its `noindex` may stay.

### `src/routes/admin/settings/+page.svelte`

- Replace the two sentences that say only the homepage is affected (the
  description under the toggle and the "currently in maintenance mode"
  notice) with copy stating: the whole site except the admin panel, sign-in
  and payment completion shows the maintenance page; admins still see the
  normal site; it takes effect immediately.

Out of scope: a cache, per-path allow-lists in the admin UI, schema changes,
`src/error.html`, fixing the security-header gap for hook-thrown redirects.

## Steps

1. Read `src/hooks.server.ts`, `src/app.d.ts`, `src/routes/+page.server.ts`,
   `src/routes/+layout.svelte` (how `page.data.maintenance` hides the shell),
   `src/lib/server/access.ts`, `src/routes/admin/settings/+page.server.ts` and
   `+page.svelte`, and `find src/routes/api -name '+server.ts'`.
2. Create `src/lib/server/maintenance.ts`; commit `feat(maintenance): site-wide maintenance flag and exempt paths`.
3. `app.d.ts` + hook + homepage + settings copy; commit `feat(maintenance): 503 maintenance page for the whole public site`.
4. `npm run check`, `npm run build`.

## Definition of Done

- [ ] `src/lib/server/maintenance.ts` exports `isMaintenanceMode` (no cache; a DB error is logged and yields `false`), `MAINTENANCE_EXEMPT_PREFIXES` containing exactly the six prefixes above, and `isMaintenanceExempt`.
- [ ] `App.Locals` has `maintenanceMode: boolean`; it is assigned on every code path through the hook.
- [ ] The hook computes the flag after the `/admin` gate, uses `isActiveAdmin` (not `is_admin`), and never queries `site_settings` for exempt paths or active admins (read the code: the `await isMaintenanceMode()` is the last operand of a short-circuiting `&&`).
- [ ] With the flag on, a non-admin page request to `/` receives status 503 with `Retry-After` and `Cache-Control: no-store` and the security headers; a `__data.json` request to `/` keeps its status; any other non-exempt `GET` is redirected to `/`; a non-exempt `POST` gets 503 (read the code).
- [ ] A suspended admin is treated like a visitor (read the code).
- [ ] `grep -rn "maintenance_mode" src` matches only `src/lib/server/maintenance.ts` and `src/routes/admin/settings/+page.server.ts`.
- [ ] The homepage load no longer queries the database for the flag and still returns `{ maintenance: true }` early from `locals.maintenanceMode`.
- [ ] The admin settings page no longer says only the homepage is affected, and says the change is immediate.
- [ ] No new dependencies; no file under `drizzle/` or `supabase/` changed.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
