# Phase 10 — Suspension means suspended everywhere

## Why

`profiles.is_suspended` is enforced in exactly two places (the lesson page and
`POST /api/progress`). Everywhere else a suspended account is a normal
account: `/leave-review`'s load, `GET /api/progress` and the progress overlays
on `/modules` ignore the flag, and the `/admin` gate in `src/hooks.server.ts`
checks `is_admin` only, so a suspended admin keeps full admin access. On the
admin side, `toggleSuspend` can suspend any profile including another admin or
the acting admin themselves, never writes `suspended_at` / `suspended_reason`,
and leaves the target's sessions alive.

The intended experience, already half-built: a suspended member can still
open the dashboard and profile (the dashboard shows a "suspended" banner) but
cannot watch lessons, record progress or leave reviews.

## Deliverables

### `src/lib/server/access.ts` (new)

- `export const SUSPENDED_MESSAGE = 'Your account has been suspended. Please contact us if you think this is a mistake.'` (the text the lesson page uses today).
- `export function isActiveMember(profile: User | null | undefined): boolean` → `!!profile?.is_member && !profile.is_suspended`.
- `export function isActiveAdmin(profile: User | null | undefined): boolean` → `!!profile?.is_admin && !profile.is_suspended`.
- `export function requireActiveMember(profile: User | null | undefined, redirectTo: string): asserts profile is User` — no profile → `redirect(303, '/auth/sign-in?redirectTo=' + encodeURIComponent(redirectTo))`; not a member → `redirect(303, '/checkout?redirectTo=' + encodeURIComponent(redirectTo))`; suspended → `error(403, SUSPENDED_MESSAGE)`.
  `User` is the type in `src/lib/types`.

### Gates that must use the helpers

- `src/hooks.server.ts`: the `/admin` gate uses `isActiveAdmin(event.locals.profile)` in place of `event.locals.profile?.is_admin`; extend the invariant comment with "a suspended admin is not an admin".
- `src/routes/leave-review/+page.server.ts`: the load calls `requireActiveMember(profile, '/leave-review')`; the `submit` action keeps its `fail(403, …)` returns (actions return, they do not redirect) but decides with `isActiveMember` and uses `SUSPENDED_MESSAGE` for the suspended case.
- `src/routes/modules/[moduleSlug]/[lessonSlug]/+page.server.ts`: replace the local `isActiveMember` expression and the literal message with the helpers. Free previews stay open to everyone, suspended included.
- `src/routes/modules/+page.server.ts` and `src/routes/modules/[moduleSlug]/+page.server.ts`: load progress only when `isActiveMember(profile)`.
- `src/routes/api/progress/+server.ts`: `GET` gets the same three checks `POST` has (401 no profile, 403 not member, 403 suspended); both handlers use `isActiveMember` for the member+suspended decision and keep their JSON responses.
- `src/routes/dashboard/+page.server.ts` is **not** changed: suspended members keep the dashboard, whose banner tells them why lessons are closed.

### `src/routes/admin/users/+page.server.ts` (action `toggleSuspend`)

- Select the target's `is_admin` first. If the target is an admin (this covers self-suspension, since the caller is an admin), `return fail(400, { error: 'Admin accounts cannot be suspended' })`.
- On suspend: set `is_suspended: true`, `suspended_at: new Date().toISOString()`, `suspended_reason` from an optional `reason` form field (trimmed, max 500 characters, else `null`); then delete the target's rows from the Better Auth `sessions` table (`db.delete(sessions).where(eq(sessions.userId, userId))`) so they are signed out on their next request.
- On unsuspend: `is_suspended: false`, `suspended_at: null`, `suspended_reason: null`.
- `src/routes/admin/users/+page.svelte`: the suspend/unsuspend control must not be offered for rows where `is_admin` is true. Do not add a reason input unless it is a one-line addition to the existing modal form.

Out of scope: blocking sign-in for suspended users (they sign in and see the dashboard banner / 403 message, which keeps the contact path open), email notifications, schema changes (`suspended_at` and `suspended_reason` already exist).

## Steps

1. Read every file named above plus `src/lib/types/index.ts` (`User`), `src/lib/server/db/schema.ts` (`sessions`, `profiles`) and `src/routes/dashboard/+page.svelte` (the existing banner).
2. Create `src/lib/server/access.ts`; commit `feat(access): shared member/admin predicates and suspension message`.
3. Hooks + member loads + progress API; commit `fix(access): enforce is_suspended in every member and admin gate`.
4. Admin `toggleSuspend` and the users page control; commit `fix(admin): suspension refuses admins, records timestamp and reason, revokes sessions`.
5. `npm run check`, `npm run build` after each commit.

## Definition of Done

- [ ] `src/lib/server/access.ts` exports `SUSPENDED_MESSAGE`, `isActiveMember`, `isActiveAdmin`, `requireActiveMember` with the semantics above.
- [ ] `src/hooks.server.ts` decides admin access with `isActiveAdmin(...)`; `grep -n "profile?.is_admin" src/hooks.server.ts` returns nothing.
- [ ] `grep -rln "is_suspended" src/routes --include=+page.server.ts --include=+server.ts` lists only `src/routes/admin/users/+page.server.ts` — every other server file reads the flag through the helpers. (`.svelte` files may still display the flag.)
- [ ] `/leave-review` load and the lesson page throw `error(403, SUSPENDED_MESSAGE)` for a suspended member (read the code paths); free-preview lessons remain accessible without membership; `src/routes/dashboard/+page.server.ts` is unchanged.
- [ ] `GET /api/progress` returns 401 without a profile, 403 for non-members and 403 for suspended members (read the handler).
- [ ] `toggleSuspend` reads the target's `is_admin` before updating and returns `fail(400, …)` for admins; on suspend it writes `suspended_at`, writes `suspended_reason` (or null), and deletes the target's `sessions` rows; on unsuspend it nulls both columns.
- [ ] In `admin/users/+page.svelte` the suspend control is not rendered (or is disabled) for admin rows.
- [ ] No file under `drizzle/` or `supabase/` changed; `package.json` unchanged.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
