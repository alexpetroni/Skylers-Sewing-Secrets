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

## Deployment & Infrastructure

**[2025-01-07] Lazy initialization for Stripe client** – Changed `src/lib/server/stripe.ts` from eager initialization (`export const stripe = new Stripe(...)`) to lazy initialization via `getStripe()` function. This fixes Docker build failures where environment variables aren't available at build time. The Stripe client now only initializes when first called at runtime. Added a proxy object for backwards compatibility.

**[2025-01-07] Docker deployment to GHCR and Bunny.net** – Using GitHub Container Registry for image storage and Bunny.net Containers for hosting. Multi-stage Dockerfile keeps production image small. Container listens on port 3000 with health check at `/api/health`.

## Code Organization

**[2025-01-04] Server-only code in `$lib/server/`** – Stripe, Supabase admin client, and email utilities isolated in server-only directory. Prevents accidental client-side imports of sensitive code.

**[2025-01-04] Component structure by purpose** – Split components into `ui/` (generic), `marketing/` (homepage), `course/` (lessons), `layout/` (header/footer), and `auth/` (OAuth). Clear boundaries for reusability and maintenance.

## Type Safety & Patterns

**[2025-01-12] Use `locals.profile` for membership checks, not `locals.user`** – The `locals.user` is the Supabase Auth user (from JWT), which doesn't have `is_member`. The `locals.profile` is fetched from the `profiles` table and contains `is_member`, `is_admin`, `full_name`, etc. Server load functions should use `profile` for authorization checks and return it to pages that need user display data.

**[2025-01-12] Badge semantic variant aliases** – Added `warning`, `secondary`, `success`, `primary`, `error` as aliases mapping to existing color variants (`yellow`, `gray`, `green`, `brand`, `red`). This allows semantic usage in code while maintaining consistent styling. Pattern: extend the Variant type union and add entries to both `variantClasses` and `dotClasses` records.

**[2025-01-12] Form components support `bind:value` via `$bindable()`** – Input, Textarea, and Select components now declare `value = $bindable()` in props, enabling two-way binding. The value is also passed to the underlying element with `bind:value`. This is the Svelte 5 pattern for bindable props.

## Content Management

**[2026-01-12] Move course overview data from seed to src/lib/data** – Moved `course-overview.json` from `seed/` directory to `src/lib/data/course-overview.ts`. The `seed/` directory is for database initialization scripts only, while `src/lib/data/` holds application-level static data and constants. Added proper TypeScript interfaces for type safety. This separates concerns: seed populates database, src/lib/data serves runtime application data.

**[2026-01-12] Course statistics in `seed/course-overview.json`** – Created a single source of truth for course content statistics (videos, minutes, tutorial slides per module). This JSON file can be imported wherever stats are displayed (About page, homepage, modules page) to ensure consistency. Totals: 7 modules (6 + 1 bonus), 32 videos, 273 minutes, 6 tutorial slides.

**[2026-01-12] Standardized contact email to `skyler@skylersewingsecrets.com`** – Consolidated all contact emails across the site (previously had separate privacy@, legal@, hello@ addresses) to a single email. Simpler for the business owner to manage one inbox. Updated in: privacy policy, terms, claims disclaimer, contact page, and email.ts default sender.

**[2026-01-12] About page content separation** – The About page (`/about`) uses only course-focused content from `about-course.txt`. Instructor bio content from `about-me.txt` is used only on the homepage "Meet Your Instructor" section. This keeps the About page focused on selling the course, while the homepage handles personal connection.

## Infrastructure & Media

**[2026-01-13] Bunny.net for image optimization and CDN** – Using Bunny.net Storage with CDN for serving static images with automatic resizing and quality optimization. Images uploaded to storage zone `skyler-storage` and served via CDN at `https://skyler-storage.b-cdn.net`. Created `OptimizedImage` component that generates responsive images with `srcset` and URL parameters (`?width=800&quality=80`). This provides automatic image resizing (400px, 800px, 1200px, 1600px breakpoints) and quality control without local processing. All static images from `/static/images/` uploaded to Bunny Storage (20 files uploaded: fabrics, portraits, logos, favicons, module thumbnails, blog featured images).

**[2026-01-13] Replace all `<img>` tags with OptimizedImage component** – Standardized image loading across the application by replacing all `<img>` tags with the `OptimizedImage` component. This ensures consistent CDN usage, automatic image optimization, and responsive image loading. Component supports width prop for generating appropriate srcset, and maintains all standard HTML img attributes (src, alt, class, loading, etc.). Updated 12 files across layout, auth, admin, and public-facing pages.

## UI/UX

**[2026-01-16] Sticky header for persistent navigation** – Added `sticky top-0 z-50` to the Header component. This keeps navigation visible while scrolling through long pages (lessons, blog posts, modules list). The `z-50` ensures the header stays above other content including modals and dropdowns.

**[2026-01-19] Dedicated testimonials page** – Created a separate `/testimonials` page to showcase all customer reviews. The homepage continues to show featured testimonials, while the dedicated page displays all published testimonials with full details. Added link in footer navigation for easy access.

**[2026-01-19] Country field for testimonials** – Added `country` column to testimonials table to display where students are from (e.g., "UK", "Saudi Arabia"). This shows international reach and adds credibility. Country displays after author_title on testimonial cards. Migration: `005_testimonial_country.sql`.

## Content Strategy

**[2026-01-19] Authentic voice for blog content** – Rewrote all blog posts to use warm, conversational tone with personal anecdotes rather than AI-generated patterns. Removed excessive bullet lists in favor of flowing prose. Content should feel like it's coming from an experienced instructor sharing knowledge, not a template.

**[2026-01-19] Instructor name simplified to "Skyler"** – Changed instructor display from "Gabi Skyler" to just "Skyler" across the site. Simpler, more personal, aligns with brand name "Skyler's Sewing Secrets".

## Developer Experience

**[2026-01-19] Modular seed script architecture** – Restructured seed scripts to allow seeding individual data types. Structure: `seed/lib/` for shared utilities (client.ts, utils.ts), `seed/seeders/` for individual seeders (modules.ts, lessons.ts, testimonials.ts, faq.ts, pricing.ts, blog.ts), and `seed/index.ts` as CLI entry point. npm scripts: `seed:blog`, `seed:testimonials`, etc. This enables quick iteration on specific content without re-seeding everything.

**[2026-01-19] Domain correction to single 's'** – Changed domain from `skylerssewingsecrets.com` (double 's') to `skylersewingsecrets.com` (single 's'). Updated across 7 files: email.ts, contact page, legal pages (privacy, terms, claims), and documentation.

**[2026-01-19] Terminology: "tutorial" instead of "lesson" on /modules page** – Changed user-facing text from "lessons" to "tutorials" for consistency with marketing language. Internal code (variable names, database columns) retains "lesson" terminology.

**[2026-01-19] ModulesPreview stats from database** – Updated homepage ModulesPreview component to calculate video count and duration from the lessons table (same data source as /modules page). Tutorial slides still come from `course-overview.ts` as they're not stored in the database. This ensures stat consistency between homepage and modules page. Format changed to two lines: "X videos, total Y min" and "Z tutorial slides" (when applicable).

**[2026-01-19] Checkout benefits synced with courseOverview** – Updated checkout page to use the same `includedFeatures` list as the homepage Pricing component, both sourced from `course-overview.ts`. This ensures consistency between what users see on the homepage and checkout page. Previously checkout had a hardcoded list with different items.

**[2026-01-19] About page consolidated layout** – Restructured the About page to combine the hero section with the course features. The first section now includes: image on left, text on right with heading, description, CTA buttons, and a compact 4-feature list (video minutes, modules, domestic machine only, bonus project). Removed the separate "Course Features" section to reduce redundancy and improve visual flow.
