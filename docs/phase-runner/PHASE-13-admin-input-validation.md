# Phase 13 (optional) — Admin forms return validation errors, not 500s; checkout survives bad pricing

## Why

Phase 4 hardened the public forms. The admin forms still feed `parseInt(...)`
results straight into Drizzle: an empty or non-numeric `order_index`,
`duration_minutes`, `rating` or `max_uses` becomes `NaN`, the insert fails,
and the admin sees "Failed to update …" instead of which field is wrong.
`rating` is never range-checked (the DB has a 1–5 check constraint),
`valid_until` is stored as whatever string was typed, `module_id` and the ids
of toggle actions are not checked to be UUIDs, and a non-UUID `[id]` route
parameter produces a Postgres error (500) instead of a 404.

Scope note (2026-09-06 review): this phase adds **no security control** beyond
Phases 4 and 11 — admins are trusted and gated, every query is parameterised,
slugs are already validated. Its value is admin UX plus two checkout
**availability** fixes that live in the same files:

1. The checkout load throws a bare `Error` when no active pricing row exists
   (an admin unticking "Active" on the only row), so every visitor gets a raw
   500 page.
2. A zero-amount checkout is reachable: `base_price` may be 0, a percentage
   promo may be 100, and a fixed discount is capped at the base price. Stripe
   rejects amounts below its GBP minimum (30 pence), so every buyer sees
   "Failed to create checkout session".

HTML fields (`blog_posts.content`, `faq_items.answer`, `lessons.content`) are
intentionally stored and rendered unsanitised via `{@html}`; out of scope.

## Deliverables

### `src/lib/server/validation.ts` (new)

Small pure helpers, no framework types, no imports from `$lib/server/db` or
`$lib/server/auth` (Phase 14 unit-tests this file):

- `type FieldResult<T> = { ok: true; value: T } | { ok: false; error: string }` (exported).
- `parseIntField(raw: FormDataEntryValue | null, opts: { min?: number; max?: number; required?: boolean; fallback?: number | null }): FieldResult<number | null>`
  — empty and not required → `{ ok: true, value: fallback ?? null }`; empty
  and required → error; non-integer (checked with `Number.isInteger` after
  `Number(...)` on the trimmed string, so `'12abc'` is rejected) or out of
  range → `{ ok: false, error }` with a human message that names the bounds.
- `isUuid(value: string): boolean` — the same regex `src/routes/api/progress/+server.ts` uses.
- `parseDateField(raw: FormDataEntryValue | null): FieldResult<string | null>`
  — empty → `null`; `new Date(raw)` must be valid (`!Number.isNaN(d.getTime())`,
  checked before calling `toISOString()`); a bare `YYYY-MM-DD` input means
  the **end** of that UTC day (`T23:59:59.999Z`) so a promo "valid until 31
  December" still works on 31 December; anything else is stored as its ISO
  string.
- `PROMO_CODE_PATTERN = /^[A-Z0-9_-]{2,32}$/`.
- `isBunnyVideoRef(value: string): boolean` — `/^bunny:\d+\/[A-Za-z0-9-]+$/`.
- `isHttpsUrl(value: string): boolean` — `new URL(value)` parses and `protocol === 'https:'`.

### Admin actions that must use them

Every failure is reported through the action's existing shape
(`fail(400, { errors })` with per-field messages where the page renders
`errors.<field>`, or `fail(400, { error })` where the page renders a single
`form.error`, as the pricing page does) so the current pages display it.

- `src/routes/admin/pricing/+page.server.ts`: `updatePrice` — `base_price`
  via `parseIntField` with min **30** (Stripe's GBP minimum) and max
  10 000 000. `createPromo` — `code` must match `PROMO_CODE_PATTERN` after
  upper-casing and trimming; `discount_value` integer ≥ 1 and ≤ **99** for
  `percentage` (100 % yields a zero amount), ≤ 10 000 000 for `fixed`;
  `max_uses` null or integer ≥ 1; `valid_until` via `parseDateField`;
  `description` ≤ 500 characters. `togglePromo` — `id` must pass `isUuid`.
- `src/routes/admin/lessons/new/+page.server.ts`, `src/routes/admin/lessons/[id]/+page.server.ts`:
  `module_id` must pass `isUuid`; `order_index` integer ≥ 0 (fallback 1);
  `duration_minutes` null or integer 1–600; `video_url` empty or
  `isBunnyVideoRef` (after Phase 8 anything else renders "Video unavailable",
  so an `https://` URL is rejected with a message saying to use
  `bunny:<library>/<video>`); `thumbnail_url` empty or `isHttpsUrl`.
- `src/routes/admin/modules/new/+page.server.ts`, `src/routes/admin/modules/[id]/+page.server.ts`:
  `order_index` integer ≥ 0; `thumbnail_url` empty or `isHttpsUrl`.
- `src/routes/admin/testimonials/new/+page.server.ts`, `src/routes/admin/testimonials/[id]/+page.server.ts`:
  `rating` integer 1–5, required; `order_index` integer ≥ 0.
- `src/routes/admin/faq/new/+page.server.ts`, `src/routes/admin/faq/[id]/+page.server.ts`:
  `order_index` integer ≥ 0.
- `src/routes/admin/blog/new/+page.server.ts`, `src/routes/admin/blog/[id]/+page.server.ts`:
  `featured_image_url` empty or `isHttpsUrl`. Nothing else in the blog actions changes.
- `src/routes/admin/users/+page.server.ts` (`toggleSuspend`, `userId`) and
  `src/routes/admin/contacts/+page.server.ts` (`markRead`, `id`): the id must pass `isUuid`.
- Every `[id]` admin page (`modules`, `lessons`, `testimonials`, `faq`, `blog`):
  in the `load` and in each action, `if (!isUuid(params.id)) error(404, …)`
  before any query, so a mistyped URL is a 404, not a Postgres error.

### The one permitted `.svelte` change

`src/routes/admin/testimonials/new/+page.svelte` and
`src/routes/admin/testimonials/[id]/+page.svelte`: the rating `Select` has no
`error` prop, so a rating error would be silently dropped. Add
`error={form?.errors?.rating}` to that one component in each file (the
`Select` component already renders it). No other `.svelte` change.

### `src/routes/checkout/+page.server.ts`

- One shared `promoValidity(match: SQL)` predicate (active, `valid_from` ≤
  now, `valid_until` null or **`gt`** now, `current_uses` under `max_uses`
  when set) used by both `validPromoWhere(id)` (with `eq(promo_codes.id, id)`)
  and `applyPromo` (with `eq(promo_codes.code, code)`). Delete the duplicated
  conditions and the separate usage-limit check in `applyPromo`. Behaviour
  change, accepted: a promo at its usage cap now reports "Invalid or expired
  promo code" instead of "reached its usage limit".
- Missing active pricing: the load uses
  `error(503, 'Checkout is temporarily unavailable. Please try again shortly.')`
  and the `checkout` action uses `fail(503, { error: <same message> })`
  instead of the bare `throw new Error` / `fail(500, …)`.
- Sub-minimum guard, in both the load and the action, after
  `calculateDiscount`: if `finalPrice < 30`, ignore the promo (treat it as not
  applied, delete the `promo_code_id` cookie) and
  `console.error('[checkout] promo <code> yields a sub-minimum amount, ignored')`.
  With the admin bounds above this is only reachable through a fixed discount
  within 29 pence of the base price; it must never produce a Stripe call.

Out of scope: any `.svelte` file other than the two named, blog content
sanitising, schema changes, the other blog fields.

## Steps

1. Read the server files above, `src/lib/components/ui/Select.svelte`,
   `src/lib/components/ui/Input.svelte`, the admin pages that render `errors`
   (to match each action's existing error shape), `parseBunnyUrl` in
   `src/lib/types/index.ts`, and the `isUuid` regex in
   `src/routes/api/progress/+server.ts`.
2. Create `src/lib/server/validation.ts`; commit `feat(validation): shared form field parsers`.
3. Admin actions, one commit per area (`pricing`, `lessons`, `modules`,
   `testimonials` including the two `error=` props, `faq`, `blog`,
   `users` + `contacts`, `[id]` guards).
4. Checkout predicate, 503 and sub-minimum guard; commit
   `fix(checkout): single promo validity predicate; 503 when pricing is missing; no sub-minimum amounts`.
5. `npm run check`, `npm run build` after each commit.

## Definition of Done

- [ ] `src/lib/server/validation.ts` exists with `FieldResult`, `parseIntField`, `isUuid`, `parseDateField`, `PROMO_CODE_PATTERN`, `isBunnyVideoRef`, `isHttpsUrl`; it imports nothing from `$lib/server/db` or `$lib/server/auth`.
- [ ] `grep -rn "parseInt(\|parseFloat(\|Number(" src/routes/admin` returns nothing; every numeric form field is read only through `parseIntField` (reviewer reads each action).
- [ ] No admin action can pass `NaN` to Drizzle.
- [ ] `base_price` below 30, a percentage promo of 100, a `code` of `hi there`, an unparsable `valid_until`, and a non-UUID `togglePromo` id each return 400 with a message (read the actions).
- [ ] Testimonial actions reject `rating` outside 1–5 with `errors.rating`, and both testimonial pages pass `errors.rating` to the rating `Select`.
- [ ] Lesson actions reject a non-UUID `module_id` and a `video_url` of `https://example.com`, and accept `bunny:1/abc-123`.
- [ ] Every `[id]` admin page returns 404 for a non-UUID `params.id` before querying.
- [ ] In `src/routes/checkout/+page.server.ts`: one predicate serves both promo lookups; `gte(promo_codes.valid_until` no longer appears; the missing-pricing paths use 503 (`grep -n "Pricing configuration not found" src/routes/checkout/+page.server.ts` returns nothing); a `finalPrice` below 30 never reaches `stripe.checkout.sessions.create`.
- [ ] `git diff --stat` against the phase base shows no `.svelte` file other than the two testimonial pages, no new dependencies, and no file under `drizzle/` or `supabase/`.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
