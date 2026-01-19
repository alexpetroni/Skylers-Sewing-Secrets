# TASKS.md

## Today (2026-01-16)

- [x] Make header sticky for better navigation UX
  - Added `sticky top-0 z-50` to Header component
- [x] Rename package to "skyler-sewing-secrets" in package.json
- [x] Review and update project documentation
  - Verified task completion status
  - Confirmed migrations are applied (4 migrations, seed works)

## Next

- [ ] Configure production environment variables on Bunny.net
  - Set all required env vars for container (SUPABASE_URL, keys, Stripe, etc.)
  - Update Bunny CDN URL if different from development

- [ ] Replace placeholder social links
  - Contact page and Footer use `#` hrefs for Instagram, YouTube, Pinterest, Facebook
  - User to provide actual social media URLs

- [ ] Replace placeholder FAQ content with real questions/answers
  - Current FAQ in `seed/faq.json` contains Lorem Ipsum text
  - User to provide actual FAQ content

- [ ] Set up Stripe webhook endpoint in Stripe Dashboard
  - Point to `/api/stripe/webhook`
  - Configure `checkout.session.completed` event

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
  - Changed all emails to `skyler@skylerssewingsecrets.com`
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
