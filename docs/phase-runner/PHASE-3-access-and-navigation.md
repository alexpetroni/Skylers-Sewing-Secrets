# Phase 3 — Suspension revokes content; sign-in returns to the right page

## Why

- The old Supabase `is_member()` helper required `NOT is_suspended` for every
  member read. After the migration, `src/routes/modules/[moduleSlug]/[lessonSlug]/+page.server.ts`
  grants `canAccess` on `is_member` alone, so a suspended member can still
  watch every video; only resources and progress writes are blocked.
- `dashboard`, `profile`, `leave-review` and the lesson page redirect to
  `/auth/sign-in?redirect=…`, but the sign-in page reads `redirectTo`, so the
  return target is always dropped.
- A suspended member who lands on the dashboard sees no explanation.

## Deliverables

### `src/routes/modules/[moduleSlug]/[lessonSlug]/+page.server.ts`

- `const isActiveMember = !!profile?.is_member && !profile.is_suspended;`
- `canAccess = isActiveMember || lesson.is_free_preview`.
- When `!canAccess`: if the profile is a member but suspended → `throw error(403, 'Your account has been suspended. Please contact us if you think this is a mistake.')`; otherwise the existing redirect to checkout, with the query key renamed to `redirectTo`.
- `resources` is `lesson.resources` only when `isActiveMember`, else `[]`.
- Keep free-preview lessons reachable by everyone, suspended or not.

### Redirect query key

- Replace `?redirect=` with `?redirectTo=` in `src/routes/dashboard/+page.server.ts`, `src/routes/profile/+page.server.ts`, `src/routes/leave-review/+page.server.ts` (both the sign-in and the checkout redirects, for consistency).

### `src/routes/dashboard/+page.svelte`

- Import `Alert` from `$lib/components/ui`.
- Under the welcome copy in the hero section, when `data.user.is_suspended`, render `<Alert variant="warning" title="Account suspended">` whose children say access is suspended and link to `/contact` with the existing `link` class. Use `{#snippet children()}` as the other Alert usages do.

Out of scope: `src/routes/api/progress/+server.ts` (already checks suspension), `src/routes/modules/+page.server.ts` and `src/routes/modules/[moduleSlug]/+page.server.ts` (listings only, no paid content).

## Steps

1. Read the lesson load, the three redirecting loads, `src/routes/dashboard/+page.svelte`, `src/lib/components/ui/Alert.svelte`, `src/routes/auth/sign-in/+page.server.ts`.
2. Implement; `npm run check`; `npm run build`.
3. Commit `fix(access): suspended members lose lesson access; unify redirectTo param`.

## Definition of Done

- [ ] In the lesson load, access is computed from an `isActiveMember` value that is false when `profile.is_suspended` is true; a suspended member requesting a non-preview lesson gets `error(403, …)`, not a redirect to checkout.
- [ ] Free-preview lessons remain accessible to signed-out users and to suspended members.
- [ ] `resources` is empty unless `isActiveMember`.
- [ ] `grep -rn "?redirect=" src` returns nothing; the four files above use `redirectTo`.
- [ ] `src/routes/dashboard/+page.svelte` renders an `Alert` with `variant="warning"` only when `data.user.is_suspended`, containing a link to `/contact`.
- [ ] `src/routes/api/progress/+server.ts` is unchanged.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
