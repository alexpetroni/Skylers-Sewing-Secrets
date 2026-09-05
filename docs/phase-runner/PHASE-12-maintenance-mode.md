# Phase 12 (optional, design change) — Maintenance mode covers the whole public site

## Why

The admin "maintenance mode" toggle (`site_settings.maintenance_mode`) is read
by exactly one load, `src/routes/+page.server.ts`. With the switch on, the
homepage shows the `Maintenance` component while `/modules`, `/blog`,
`/checkout`, `/contact` and every other page keep working. That is not what an
admin flipping the switch expects.

Design chosen by this phase: during maintenance, signed-in admins see the
normal site; everyone else is sent to `/` (which already renders the
maintenance page) for page requests and gets 503 for other methods. Payments
must still complete.

## Deliverables

### `src/lib/server/maintenance.ts` (new)

- `export async function isMaintenanceMode(): Promise<boolean>` — reads
  `site_settings` where `key = 'maintenance_mode'` and returns `value === 'true'`.
  Cache the answer in a module-level variable for 30 seconds (`{ value, checkedAt }`)
  so the hook does not add a query to every request; on a database error
  `console.error('[maintenance] …')` and return the last cached value, or `false`.
- `export const MAINTENANCE_EXEMPT_PREFIXES = ['/admin', '/auth/', '/api/', '/checkout/success']` with a comment on why each is exempt (admins must reach the panel, sign-in must work so admins can get in, Better Auth and the Stripe webhook live under `/api/`, buyers returning from Stripe must be provisioned).

### `src/hooks.server.ts`

- After `event.locals.profile` is assigned and after the `/admin` gate: when
  the path is not `/`, does not start with any exempt prefix, the profile is
  not an admin, and `await isMaintenanceMode()` is true:
  `GET`/`HEAD` → `redirect(303, '/')`; any other method → `error(503, 'The site is under maintenance. Please try again shortly.')`.
- Comment stating the invariant and the 30-second propagation delay.

### `src/routes/+page.server.ts`

- Replace the inline `site_settings` query with `isMaintenanceMode()`. The
  rest of the homepage load is unchanged.

### `src/routes/admin/settings/+page.svelte`

- One sentence under the toggle: "Changes reach visitors within 30 seconds."

Out of scope: a 503 status on the maintenance page itself (it is the homepage
with `noindex`), per-path allow-lists in the admin UI, schema changes.

## Steps

1. Read `src/hooks.server.ts`, `src/routes/+page.server.ts`, `src/routes/+layout.svelte` (how `page.data.maintenance` hides the shell), `src/routes/admin/settings/+page.server.ts`.
2. Create `src/lib/server/maintenance.ts`; commit `feat(maintenance): cached site-wide maintenance flag`.
3. Hook + homepage + settings copy; commit `feat(maintenance): redirect the public site to the maintenance page`.
4. `npm run check`, `npm run build`.

## Definition of Done

- [ ] `src/lib/server/maintenance.ts` exports `isMaintenanceMode` (30-second in-memory cache, DB errors never throw out of it) and `MAINTENANCE_EXEMPT_PREFIXES` containing exactly the four prefixes above.
- [ ] `src/hooks.server.ts` applies the redirect/503 rule after the `/admin` gate, skips `/` and every exempt prefix, and skips admins (read the code).
- [ ] `grep -rn "maintenance_mode" src` matches only `src/lib/server/maintenance.ts` and `src/routes/admin/settings/+page.server.ts`.
- [ ] The homepage load calls `isMaintenanceMode()` and still returns `{ maintenance: true }` early when it is on.
- [ ] The admin settings page mentions the 30-second delay.
- [ ] No new dependencies; no file under `drizzle/` or `supabase/` changed.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
