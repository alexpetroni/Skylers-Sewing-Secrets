# Phase 4 — Input hardening: email escaping, newsletter abuse, pricing units, length caps

## Why

- `src/lib/server/email.ts` interpolates user-supplied strings (buyer name,
  contact-form name/email/subject/message) into HTML bodies unescaped.
- `POST /api/newsletter` re-sends the welcome email on every call, so anyone
  can use the site to spam an address and burn Resend quota.
- `src/routes/admin/pricing/+page.server.ts` falls back to `149` for
  `base_price`, but the column is pence (`14900`), so a blank field would set
  the price to £1.49; the form label says "GBP" while showing pence. Promo
  `discount_value` is parsed with `parseFloat` into an integer column and a
  percentage above 100 is accepted.
- Contact and profile forms accept unbounded text.

## Deliverables

### `src/lib/server/email.ts`

- Export `escapeHtml(value: string): string` escaping `& < > " '`.
- Apply it to every user-supplied value interpolated into an **HTML** body: `name` in `welcomeEmail` and `purchaseConfirmationEmail`; `name`, `email`, `subject`, `message` in `contactNotificationEmail` (including the `mailto:` href). Plain-text bodies and the `subject:` lines stay unescaped.

### `src/routes/api/newsletter/+server.ts`

- Normalise the email (`trim().toLowerCase()`) once.
- Before writing, select the existing row; if it exists with `is_active === true`, return the same success JSON without sending an email.
- Otherwise upsert as today, additionally setting `unsubscribed_at: null` on conflict, then send the welcome email once.

### `src/routes/admin/pricing/+page.server.ts` and `+page.svelte`

- `updatePrice`: parse `base_price` with `parseInt(..., 10)` and no numeric fallback; `fail(400, { error })` unless `Number.isInteger(base_price) && base_price >= 0`. Insert path uses `currency: 'gbp'` (lower-case, matching the schema default).
- `createPromo`: coerce `discount_type` to `'fixed'` or `'percentage'`; parse `discount_value` with `parseInt`; reject non-integers and values `<= 0`; reject `percentage` values `> 100`.
- Svelte form: label reads "Base Price (pence, e.g. 14900 = £149.00)"; default value `14900` (use `??`, not `||`, so a stored `0` is shown).

### Length caps

- `src/routes/contact/+page.server.ts`: `name` ≤ 200, `subject` ≤ 200, `message` ≤ 5000, each producing the existing `errors.<field>` shape.
- `src/routes/profile/+page.server.ts` `updateProfile`: trimmed name ≤ 100 → `fail(400, { error, fullName })`.

Out of scope: an unsubscribe route (separate optional phase), changing email copy.

## Steps

1. Read the files above.
2. One commit per bullet group: `fix(email): escape user input in HTML templates`, `fix(newsletter): do not resend welcome email to active subscribers`, `fix(admin): pricing in pence and integer promo values`, `fix(forms): cap contact and profile field lengths`.
3. `npm run check` and `npm run build` after each.

## Definition of Done

- [ ] `escapeHtml` is exported from `src/lib/server/email.ts` and used for `name` in `welcomeEmail` and `purchaseConfirmationEmail`, and for `name`, `email`, `subject`, `message` in `contactNotificationEmail`'s HTML (grep shows no raw `${name}`, `${email}`, `${subject …}`, `${message}` inside the HTML template literals of those functions).
- [ ] Text bodies of those templates are byte-for-byte unchanged apart from nothing (diff shows no change in the `text:` sections).
- [ ] `POST /api/newsletter` for an already-active subscriber returns `{ success: true, … }` and calls neither the upsert nor `sendEmail` (read the control flow).
- [ ] The newsletter upsert's conflict `set` includes `unsubscribed_at: null`.
- [ ] `updatePrice` has no `'149'` fallback, rejects non-integer or negative pence with `fail(400, …)`, and inserts `currency: 'gbp'`.
- [ ] `createPromo` uses `parseInt` for `discount_value`, rejects `<= 0` and non-integers, rejects `percentage > 100`, and `discount_type` can only be `'fixed'` or `'percentage'`.
- [ ] Pricing form label mentions pence and the fallback value is `14900` via `??`.
- [ ] Contact caps (200/200/5000) and profile cap (100) exist with the error shapes described.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
