# TASKS.md

## Today

- [ ] Update About page stats with course-overview.json numbers
  - Currently shows placeholder stats (270+ minutes, 6 modules)
  - Should use actual totals: 273 minutes, 32 videos, 6 tutorial slides

- [ ] Update modules page with correct duration/content from course-overview.json
  - Each module should show accurate video count and duration

- [ ] Update homepage module preview section with course-overview.json data
  - Sync module cards with actual content stats

## Next

- [ ] Configure production environment variables on Bunny.net
  - Set all required env vars for the container

- [ ] Replace placeholder social links on contact page
  - Currently using `#` hrefs for Instagram, YouTube, Pinterest

- [ ] Run Supabase migrations to create database tables
  - Execute `supabase/migrations/001_initial_schema.sql`
  - Execute `supabase/migrations/002_row_level_security.sql`
  - Execute `supabase/migrations/003_functions.sql`
  - Via Supabase Dashboard SQL Editor or `npx supabase db push`

- [ ] Run seed script to populate database
  - `npm run seed`
  - Verify modules, lessons, testimonials, FAQ, pricing, and blog posts are created

- [ ] Replace placeholder FAQ content with real questions/answers
  - Current FAQ in `seed/faq.json` contains Lorem Ipsum text

- [ ] Add featured images for blog posts
  - Update markdown frontmatter with `featured_image_url`
  - Add corresponding images to `static/images/blog/`

- [ ] Set up Stripe webhook endpoint in Stripe Dashboard
  - Point to `/api/stripe/webhook`
  - Configure `checkout.session.completed` event

- [ ] Configure Bunny.net video library
  - Add video URLs to lessons in format `bunny:{libraryId}/{videoId}`
  - Update `seed/lessons.json` with actual video references

- [ ] Add module thumbnail images
  - Create images for each module
  - Update `seed/modules.json` with `thumbnail_url` values

## Backlog

- [ ] Add search functionality for lessons and blog posts
- [ ] Implement email notifications (welcome email, purchase confirmation)
- [ ] Add analytics/tracking (page views, video engagement)
- [ ] Create downloadable resources for lessons
- [ ] Add course completion certificate generation
- [ ] Implement password reset flow UI
- [ ] Add social sharing for blog posts
- [ ] Create sitemap.xml generation
- [ ] Add OpenGraph meta tags for social previews
- [ ] Consider adding a "Notes" feature for members
- [ ] Implement video bookmarking/timestamps
- [ ] Add member profile editing page
- [ ] Create affiliate/referral system
- [ ] Add multi-currency support
- [ ] Implement gift purchases

## Completed

- [x] Update About page with course content (2026-01-12)
  - Rewrote page using only text from `assets/about/about-course.txt`
  - Added welcome section, course details, "Why Skyler's" section
  - Removed instructor bio (moved to homepage only)

- [x] Update homepage "Meet Your Instructor" section (2026-01-12)
  - Added bio text from `seed/first-page/about-me.txt`
  - Includes quote, journey narrative, 40+ years experience

- [x] Add real testimonials to database (2026-01-12)
  - Added McKenna and Sam testimonials to `seed/testimonials.json`
  - Seeded to database (testimonials only, preserved other data)

- [x] Standardize contact email site-wide (2026-01-12)
  - Changed all emails to `skyler@skylerssewingsecrets.com`
  - Updated: privacy, terms, claims, contact pages, email.ts

- [x] Create course-overview.json (2026-01-12)
  - Added `seed/course-overview.json` with module stats
  - 7 modules (6 + bonus), 32 videos, 273 minutes, 6 tutorial slides

- [x] Fix all TypeScript errors (0 errors) (2025-01-12)
  - Added semantic Badge variants (`warning`, `secondary`, `success`, `primary`, `error`)
  - Fixed user/profile confusion in modules, dashboard, and API routes
  - Fixed LessonSidebar interface to avoid type conflicts
  - Added `$bindable()` to Input/Textarea/Select for `bind:value` support
  - Fixed reactive ID generation with `$derived()` in form components
  - Fixed admin form error type unions with `Record<string, string>` casts

- [x] Fix a11y warnings (2025-01-12)
  - Added `aria-label` to Toggle component
  - Added svelte-ignore comments for modal/menu backdrop divs
  - Fixed admin dashboard stats reactivity with `$derived()`

- [x] Add lesson_id to resources query (2025-01-12)
  - Fixed LessonResource type mismatch in lesson page server

- [x] Add FreePreview section to homepage (2025-01-07)
  - Created `src/lib/components/marketing/FreePreview.svelte`
  - Added to homepage in 3rd position (after Hero and Features)

- [x] Fix Stripe initialization for Docker builds (2025-01-07)
  - Changed from eager to lazy initialization in `src/lib/server/stripe.ts`

- [x] Build and push Docker image to GHCR (2025-01-07)
  - Image: `ghcr.io/alexpetroni/skylers-sewing-secrets:latest`
  - Made package public

- [x] Deploy to Bunny.net Containers (2025-01-07)
