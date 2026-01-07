# TASKS.md

## Today

- [ ] Run Supabase migrations to create database tables
  - Execute `supabase/migrations/001_initial_schema.sql`
  - Execute `supabase/migrations/002_row_level_security.sql`
  - Execute `supabase/migrations/003_functions.sql`
  - Via Supabase Dashboard SQL Editor or `npx supabase db push`

- [ ] Run seed script to populate database
  - `npm run seed`
  - Verify modules, lessons, testimonials, FAQ, pricing, and blog posts are created

- [ ] Fix TypeScript errors in components
  - `src/routes/modules/+page.svelte` - Badge variant type mismatch
  - `src/routes/dashboard/+page.svelte` - User type missing properties
  - `src/routes/modules/[moduleSlug]/[lessonSlug]/+page.svelte` - Multiple type issues

## Next

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
