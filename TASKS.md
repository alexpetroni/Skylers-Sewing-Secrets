# TASKS.md

## Today

- [ ] Configure production environment variables on Bunny.net
  - Set all required env vars for the container

- [ ] Replace placeholder social links on contact page
  - Currently using `#` hrefs for Instagram, YouTube, Pinterest

## Next

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
