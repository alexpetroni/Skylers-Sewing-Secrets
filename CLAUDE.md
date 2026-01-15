# CLAUDE.md

## Project Summary

**Skyler's Sewing Secrets** is an online sewing course platform where users can purchase lifetime access to video lessons and articles teaching professional sewing techniques. The platform includes a marketing site, member dashboard with progress tracking, admin panel for content management, blog, and Stripe payment integration.



## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (using runes: `$props()`, `$state()`, `$derived()`)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password + OAuth)
- **Payments**: Stripe Checkout (one-time payment for lifetime access)
- **Video Hosting**: Bunny.net
- **Email**: Resend
- **Styling**: TailwindCSS with `@tailwindcss/forms` and `@tailwindcss/typography`
- **Build**: Vite, deployed with `@sveltejs/adapter-node`


## Folder Structure

```
├── src/
│   ├── routes/                 # SvelteKit file-based routing
│   │   ├── admin/              # Admin panel (protected, requires is_admin)
│   │   ├── api/                # API endpoints (+server.ts files)
│   │   ├── auth/               # Authentication pages (sign-in, callback, etc.)
│   │   ├── blog/               # Public blog
│   │   ├── checkout/           # Stripe checkout flow
│   │   ├── dashboard/          # Member dashboard (protected, requires is_member)
│   │   ├── modules/            # Course content (lessons, videos)
│   │   └── legal/              # Terms, privacy, claims pages
│   ├── lib/
│   │   ├── components/         # Reusable Svelte components
│   │   │   ├── ui/             # Generic UI components (Button, Card, Badge, etc.)
│   │   │   ├── marketing/      # Homepage sections (Hero, Features, Pricing, etc.)
│   │   │   ├── course/         # Course-specific (VideoPlayer, ProgressBar, etc.)
│   │   │   ├── layout/         # Header, Footer
│   │   │   └── auth/           # OAuth buttons
│   │   ├── data/               # Static data and constants (course overview, etc.)
│   │   ├── server/             # Server-only code (supabase admin, stripe, email)
│   │   └── types/              # TypeScript type definitions
│   ├── hooks.server.ts         # SvelteKit server hooks (auth, session handling)
│   └── app.d.ts                # App-wide type declarations
├── seed/                       # Database seed data
│   ├── blog-posts/             # Blog articles as individual markdown files
│   ├── modules.json            # Course modules
│   ├── lessons.json            # Lessons within modules
│   ├── testimonials.json       # Customer testimonials
│   ├── faq.json                # FAQ items
│   ├── pricing.json            # Pricing config and promo codes
│   └── run.ts                  # Seed script entry point
├── supabase/
│   └── migrations/             # SQL migrations (run in order: 001, 002, 003)
├── static/                     # Static assets (images, robots.txt)
├── scripts/                    # Utility scripts (image optimization)
└── tailwind/                   # Tailwind UI component examples (reference only)
```

## Coding Conventions

### Style
- Use TypeScript for all `.ts` and `.svelte` files
- Use Svelte 5 runes (`$props()`, `$state()`, `$derived()`) - not Svelte 4 syntax
- Use `{#snippet}` for component children, not slots
- Prefer `const` over `let` where possible
- Use single quotes for strings in TypeScript, double quotes in JSON

### Naming
- Files: kebab-case (`my-component.svelte`, `+page.server.ts`)
- Components: PascalCase (`Button.svelte`, `VideoPlayer.svelte`)
- Variables/functions: camelCase
- Database columns: snake_case
- CSS classes: Tailwind utilities, kebab-case for custom classes

### Error Handling
- Use SvelteKit's `fail()` for form action errors
- Use `error()` for throwing HTTP errors
- Log errors to console with `console.error()` on server
- Return user-friendly error messages, not raw error details

### Data Fetching
- Use `+page.server.ts` for data loading (SSR)
- Use `+server.ts` for API endpoints
- Access Supabase via `locals.supabase` (respects RLS) or `locals.supabaseAdmin` (bypasses RLS)

### Components
- Props interface defined with `interface Props { ... }`
- Destructure props with `let { prop1, prop2 }: Props = $props()`
- Keep components focused and single-purpose
- UI components in `$lib/components/ui/` should be generic and reusable

## Behavior Guidelines

### Before Making Changes
- Read existing code patterns before implementing new features
- Check for existing components in `$lib/components/` before creating new ones
- Understand the data flow (load functions → page data → components)

### When Editing Code
- Preserve existing code style and patterns
- Don't refactor unrelated code without asking first
- Keep changes focused on the task at hand
- Update TypeScript types when changing data structures

### Database Changes
- Never modify migrations that have been applied
- Create new migration files for schema changes
- Test migrations locally before applying to production
- Seed data goes in `seed/` directory, not in migrations

### Testing & Validation
- Run `npm run check` to verify TypeScript before committing
- Test auth flows (sign-in, sign-out, protected routes)
- Test payment flows in Stripe test mode
- Verify RLS policies when changing data access patterns

### What to Avoid
- Don't commit `.env` files or secrets
- Don't use `any` type unless absolutely necessary
- Don't bypass RLS without explicit reason
- Don't add dependencies without justification
- Don't create documentation files unless explicitly requested
