# DECISIONS.md

## Architecture & Technology

**[2025-01-06] Use dotenv for seed script environment variables** – Installed `dotenv` package and added `import 'dotenv/config'` to `seed/run.ts`. Alternative was Node's built-in `--env-file` flag, but dotenv is more widely compatible and keeps the npm script simple (`npx tsx seed/run.ts`).

**[2025-01-06] Blog posts stored as individual Markdown files with frontmatter** – Moved from a single `blog-posts.json` to individual `.md` files in `seed/blog-posts/`. This makes content easier to edit, diff, and manage in version control. Each file uses YAML frontmatter for metadata (title, slug, excerpt, published_at) and HTML content below.

**[2025-01-06] Seed data organization** – Removed empty placeholder folders (`seed/blog/`, `seed/courses/`, etc.) and kept a flat structure with JSON files for structured data (modules, lessons, testimonials) and a subfolder only for blog posts (which benefit from individual files). Simpler is better until complexity is needed.

## Database & Backend

**[2025-01-04] Supabase for database and auth** – Chose Supabase over alternatives (Firebase, custom PostgreSQL) for built-in auth, Row Level Security, real-time capabilities, and generous free tier. PostgreSQL provides reliability and SQL familiarity.

**[2025-01-04] One-time payment model, not subscriptions** – Business decision: lifetime access for a single payment via Stripe Checkout. Simpler than recurring billing, no churn management, aligns with course-based product model.

**[2025-01-04] Row Level Security for data access control** – RLS policies on all tables rather than application-level checks. Security is enforced at database level, reducing risk of access control bugs in application code.

## Frontend & Styling

**[2025-01-04] SvelteKit with Svelte 5 runes** – Chose Svelte 5's new reactivity model (`$props()`, `$state()`, `$derived()`) over Svelte 4 syntax. Cleaner, more explicit reactivity that scales better. SvelteKit provides SSR, routing, and deployment flexibility.

**[2025-01-04] TailwindCSS for styling** – Utility-first CSS over component libraries (MUI, Chakra) or custom CSS. Faster development, consistent design system, smaller bundle with purging. Added `@tailwindcss/forms` and `@tailwindcss/typography` plugins.

**[2025-01-04] Bunny.net for video hosting** – Chose Bunny.net over Vimeo/Wistia for cost-effectiveness and CDN performance. Videos referenced by `bunny:{libraryId}/{videoId}` format and embedded via iframe.

## Code Organization

**[2025-01-04] Server-only code in `$lib/server/`** – Stripe, Supabase admin client, and email utilities isolated in server-only directory. Prevents accidental client-side imports of sensitive code.

**[2025-01-04] Component structure by purpose** – Split components into `ui/` (generic), `marketing/` (homepage), `course/` (lessons), `layout/` (header/footer), and `auth/` (OAuth). Clear boundaries for reusability and maintenance.
