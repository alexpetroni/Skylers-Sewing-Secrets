# Phase 13 (optional) — Admin forms return validation errors, not 500s

## Why

Phase 4 hardened the public forms. The admin forms still feed `parseInt(...)`
results straight into Drizzle: an empty or non-numeric `order_index`,
`duration_minutes`, `rating`, `max_uses` or `discount_value` becomes `NaN`,
the insert fails, and the admin sees "Failed to update …" (a 500) instead of
which field is wrong. `rating` is never range-checked (the DB has a 1–5
check constraint), `valid_until` is stored as whatever string was typed, and
`module_id` is not checked to be a UUID. Also, `applyPromo` in the checkout
action uses `gte(valid_until, now)` while `validPromoWhere` uses `gt`, and the
checkout load throws a bare `Error` when no active pricing exists.

## Deliverables

### `src/lib/server/validation.ts` (new)

Small pure helpers, no framework types:

- `parseIntField(raw: FormDataEntryValue | null, opts: { min?: number; max?: number; required?: boolean; fallback?: number | null }): { value: number | null } | { error: string }`
  — empty and not required → `{ value: fallback ?? null }`; non-integer or out of range → `{ error }` with a human message.
- `isUuid(value: string): boolean` (the same regex Phase 11 uses for `lessonId`).
- `parseDateField(raw: FormDataEntryValue | null): { value: string | null } | { error: string }` — empty → null; otherwise `new Date(raw)` must be valid and the result is stored as ISO.
- `PROMO_CODE_PATTERN = /^[A-Z0-9_-]{2,32}$/`.

### Admin actions that must use them

- `src/routes/admin/pricing/+page.server.ts`: `createPromo` — `code` must match `PROMO_CODE_PATTERN`; `discount_value` integer ≥ 1 (≤ 100 for percentage, as today); `max_uses` null or integer ≥ 1; `valid_until` via `parseDateField`; `description` ≤ 500 chars. `updatePrice` — `base_price` via `parseIntField` (min 0, max 10 000 000).
- `src/routes/admin/lessons/new/+page.server.ts`, `src/routes/admin/lessons/[id]/+page.server.ts`: `module_id` must be a UUID; `order_index` integer ≥ 0 (fallback 1); `duration_minutes` null or integer 1–600; `video_url` empty, or `parseBunnyUrl(video_url)` non-null, or `https://` URL.
- `src/routes/admin/modules/new/+page.server.ts`, `src/routes/admin/modules/[id]/+page.server.ts`: `order_index` integer ≥ 0.
- `src/routes/admin/testimonials/new/+page.server.ts`, `src/routes/admin/testimonials/[id]/+page.server.ts`: `rating` integer 1–5 (required); `order_index` integer ≥ 0.
- `src/routes/admin/faq/new/+page.server.ts`, `src/routes/admin/faq/[id]/+page.server.ts`: `order_index` integer ≥ 0.
- Every failure is reported through the action's existing `errors` object /
  `fail(400, …)` shape so the current pages display it without changes.

### `src/routes/checkout/+page.server.ts`

- One shared `promoValidity()` predicate (active, inside the window with `gt` on `valid_until`, under the usage cap) used by both `validPromoWhere(id)` and `applyPromo` (with `eq(code)`); delete the duplicated conditions in `applyPromo` and its separate usage-limit check.
- The load returns `error(503, 'Checkout is temporarily unavailable. Please try again shortly.')` instead of `throw new Error(...)` when no active pricing row exists.

Out of scope: the admin `.svelte` files (no UI changes), blog actions (no numeric fields), schema changes.

## Steps

1. Read the eleven server files above and `parseBunnyUrl` in `src/lib/types/index.ts`.
2. Create `src/lib/server/validation.ts`; commit `feat(validation): shared form field parsers`.
3. Admin actions, one commit per area (`pricing`, `lessons`, `modules`, `testimonials`, `faq`).
4. Checkout promo predicate and pricing error; commit `fix(checkout): single promo validity predicate; 503 when pricing is missing`.
5. `npm run check`, `npm run build` after each commit.

## Definition of Done

- [ ] `src/lib/server/validation.ts` exists with the four exports above.
- [ ] `grep -rn "parseInt(" src/routes/admin` returns nothing — every numeric field goes through `parseIntField`.
- [ ] Testimonial actions reject `rating` outside 1–5 with a field error; lesson actions reject a non-UUID `module_id`; promo creation rejects codes outside `PROMO_CODE_PATTERN` and unparsable `valid_until` (read the actions).
- [ ] No admin action can pass `NaN` to Drizzle (every parsed number is checked with `Number.isInteger` inside the helper).
- [ ] In `src/routes/checkout/+page.server.ts`, `applyPromo` and `validPromoWhere` share one predicate and `gte(promo_codes.valid_until` no longer appears; the missing-pricing path uses `error(503, …)`.
- [ ] No `.svelte` file changed; no new dependencies; no file under `drizzle/` or `supabase/` changed.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
