# TASKS.md

## Today (2026-01-24) - Session 5

- [x] Fix Stripe checkout redirect not working
  - Added `isRedirect()` check to re-throw redirects caught in try-catch
- [x] Fix account not created after Stripe payment
  - Moved account creation from webhook to success page (webhooks can't access cookies)
- [x] Fix header showing "Log in" after successful payment
  - Added redirect after sign-in to trigger new request and refresh session
- [x] Fix missing video duration for last two lessons in basics module
  - Changed lesson_type from "article" to "video" and added duration_minutes
- [x] Sync video durations from Bunny API with course-overview.ts
  - Corrected totals: 37 videos / 239 minutes (was 33 / 603)
- [x] Create newsletter subscription API endpoint
  - Added `/api/newsletter` with email validation and upsert
- [x] Update Footer newsletter section with new text and layout
- [x] Fix user dropdown menu not closing when clicking on main page
  - Added window click handler to detect clicks outside menu
- [x] Remove free preview from module 1 lesson 1
- [x] Redirect admin users to /admin after login instead of /dashboard
- [x] Add SEO noindex robots meta tag to all admin pages (18 pages)

## Completed (2026-01-21) - Session 4

- [x] Process new carousel images from assets/new-images
- [x] Extract video thumbnails with ffmpeg
- [x] Upload all new images to Bunny.net CDN
- [x] Expand Hero carousel from 6 to 11 slides

## Completed (2026-01-20) - Session 3

- [x] Fix horizontal overflow at 1024px viewport
  - Made About page image responsive (removed fixed `w-[37rem]`)
  - Added `overflow-x-hidden` to main layout container
- [x] Reduce base line-height from 1.7 to 1.5
- [x] Create typography utility classes for font size consistency
  - Added: page-title, section-heading, subsection-heading, card-title
  - Added: eyebrow, body-lg, body-base, meta
- [x] Apply typography classes across all pages
  - Updated: checkout, dashboard, profile, blog, contact, faq, modules, testimonials, fabric-library
  - Updated: Pricing, Cta, Testimonials, FreePreview, Instructor, Features components
- [x] Change "lessons" to "tutorials" in dashboard Modules section

## Completed (2026-01-19) - Session 2

- [x] Fix Pricing.svelte text replacement
  - Restored first sentence, replaced only the second sentence
- [x] Update domain across site
  - Changed skylerssewingsecrets.com → skylersewingsecrets.com in 7 files
- [x] Replace "lesson" with "tutorial" on /modules page
  - Updated user-facing text (card count, CTA section)
- [x] Remove "New: Bonus Chanel Skirt Tutorial" button from Hero
- [x] Update ModulesPreview stats display
  - Shows "X videos, total Y min" on first line
  - Shows "Z tutorial slides" on second line (if slides > 0)
  - Loads lessons from database for consistency with /modules page
- [x] Sync checkout page benefits with homepage Pricing
  - Now uses courseOverview data for consistent feature list
- [x] Restructure About page
  - Moved second section content into first section hero
  - Added 4-feature list (video minutes, modules, domestic machine, bonus)
  - Removed duplicate "Course Features" section
- [x] Rename "About" menu item to "About Course"

## Completed (2026-01-19) - Session 1

- [x] Remove "Gabi" from instructor name
  - Updated Instructor.svelte to display "Skyler" instead of "Gabi Skyler"
- [x] Add country field to testimonials
  - Created migration 005_testimonial_country.sql
  - Updated Testimonial type in src/lib/types/index.ts
  - Updated seed/testimonials.json with country data (UK, Saudi Arabia)
  - Modified Testimonials.svelte to display country
  - Updated admin testimonial forms
- [x] Create dedicated testimonials page
  - Created /testimonials route with page and server files
  - Added Testimonials link to Footer navigation
- [x] Update "What's Included" pricing features
  - Updated Pricing.svelte with new feature list (39 tutorials, 7 modules, etc.)
- [x] Rewrite all blog posts for authentic voice
  - Rewrote 7 blog posts in seed/blog-posts/ with warm, human tone
  - Removed excessive bullet lists and AI-generated patterns
  - Re-seeded blog posts to database
- [x] Restructure seed scripts into modular architecture
  - Created seed/lib/client.ts (shared Supabase client)
  - Created seed/lib/utils.ts (shared utilities)
  - Created individual seeders in seed/seeders/*.ts
  - Updated seed/index.ts as CLI entry point
  - Added individual npm scripts (seed:blog, seed:testimonials, etc.)
- [x] Update project documentation
  - Updated CLAUDE.md folder structure
  - Updated ARCHITECTURE.md with testimonial country field
  - Updated TASKS.md with today's work
  - Updated DECISIONS.md with new decisions

## Next

- [ ] Set up production Stripe webhook
  - Point to `/api/stripe/webhook` in Stripe Dashboard
  - Configure `checkout.session.completed` event
  - Test end-to-end payment flow

- [ ] Configure production environment variables on Bunny.net
  - Set all required env vars for container (SUPABASE_URL, keys, Stripe, etc.)
  - Update Bunny CDN URL if different from development

- [ ] Replace placeholder social links
  - Contact page and Footer use `#` hrefs for Instagram, YouTube, Pinterest, Facebook
  - Waiting for actual social media URLs

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

- [x] Make header sticky for better navigation UX (2026-01-16)
  - Added `sticky top-0 z-50` to Header component

- [x] Rename package to "skyler-sewing-secrets" in package.json (2026-01-16)

- [x] Supabase migrations verified (2026-01-16)
  - All 4 migrations applied (001_initial_schema, 002_row_level_security, 003_functions, 004_user_testimonials)
  - Database operational, seed script works

- [x] Complete image setup and OptimizedImage migration (2026-01-13)
  - Created 20 placeholder images (hero, instructor, logos, favicons, module thumbnails, blog featured)
  - Uploaded all images to Bunny.net Storage CDN
  - Added thumbnail_url to all 7 modules in seed/modules.json
  - Added featured_image_url to all 7 blog post markdown files
  - Replaced 12 `<img>` tags with OptimizedImage component across layout, auth, admin, and public pages
  - Updated .env.example to remove sensitive Bunny API keys

- [x] Database seed verification (2026-01-13)
  - Seeded data: 7 modules, 32 lessons, 11 testimonials, 6 FAQ items, 2 promo codes, 7 blog posts
  - Test user confirmed: test@test.com (password: test123, is_member: true)

- [x] Update About page with course overview statistics (2026-01-13)
  - Now displays 273 minutes, 32 videos, 6 modules
  - Dynamically pulls data from `src/lib/data/course-overview.ts`

- [x] Update modules page with accurate video/duration stats (2026-01-13)
  - Each module now shows correct video count and duration
  - Dynamic calculation from database lesson data

- [x] Update homepage Features section with course overview data (2026-01-13)
  - Module preview section now synced with actual course statistics
  - Displays video counts and minutes per module

- [x] Add module descriptions to Features section (2026-01-13)
  - Added description field to CourseModule interface in course-overview.ts
  - Features component now displays module descriptions
  - Also shows tutorial slides count when present

- [x] Add Bunny.net video URLs to lessons (2026-01-13)
  - Configure Bunny.net video library
  - Add video URLs in format `bunny:{libraryId}/{videoId}`
  - Update lesson records in database or `seed/lessons.json`

- [x] Set up Bunny.net Image Optimization CDN (2026-01-13)
  - Create upload script (scripts/upload-images.ts)
  - Upload all static images to Bunny Storage
  - Create OptimizedImage component for responsive images
  - Update .env.example with Bunny configuration keys
  - Uploaded 13 images successfully to skyler-storage
  - Updated fabric library, about page, instructor, hero components to use OptimizedImage
  - Note: PUBLIC_BUNNY_CDN_URL requires proper format `https://` (with double slash) for CDN to function

- [x] Create test user with member access (2026-01-13)
  - User: test@test.com / test123
  - Has is_member = true for paywall testing

- [x] Move course overview data to src/lib/data (2026-01-13)
  - Moved from seed/course-overview.json to src/lib/data/course-overview.ts
  - Added TypeScript interfaces for type safety
  - Deleted seed file (seed directory for database only)

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

- [x] Standardize contact email (2026-01-12)
  - Changed all emails to `skyler@skylersewingsecrets.com`
  - Updated: privacy, terms, claims, contact pages, email.ts

- [x] Create course-overview.json (2026-01-12)
  - Added `seed/course-overview.json` with module stats
  - 7 modules (6 + 1 bonus), 32 videos, 273 minutes, 6 tutorial slides

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
