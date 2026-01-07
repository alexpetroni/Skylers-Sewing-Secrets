# ARCHITECTURE.md

## High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        SvelteKit App                            │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  Marketing  │   Member    │    Admin    │    Auth     │   API   │
│    Pages    │  Dashboard  │    Panel    │    Flow     │ Routes  │
└─────────────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
                     │             │             │           │
              ┌──────▼─────────────▼─────────────▼───────────▼────┐
              │              hooks.server.ts                      │
              │         (Session & Auth Middleware)               │
              └──────────────────────┬────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
┌───────▼───────┐          ┌─────────▼─────────┐        ┌─────────▼─────────┐
│   Supabase    │          │      Stripe       │        │     Bunny.net     │
│  (Database +  │          │    (Payments)     │        │  (Video Hosting)  │
│     Auth)     │          │                   │        │                   │
└───────────────┘          └───────────────────┘        └───────────────────┘
```

### Component Responsibilities

- **Marketing Pages** (`/`, `/about`, `/faq`, `/blog`): Public content, SEO, conversion
- **Member Dashboard** (`/dashboard`, `/modules/*`): Course access, progress tracking
- **Admin Panel** (`/admin/*`): Content management, user management, analytics
- **Auth Flow** (`/auth/*`): Sign-in, sign-out, OAuth callbacks, password reset
- **API Routes** (`/api/*`): Webhooks, progress updates, health checks

## Data Flow

### Authentication Flow
```
User → Sign In Page → Supabase Auth → Callback → Session Cookie → hooks.server.ts → locals.user
```

### Purchase Flow
```
Checkout Page → Stripe Checkout → Stripe Webhook → Update profiles.is_member → Redirect to Dashboard
```

### Course Progress Flow
```
Lesson Page → Mark Complete Button → POST /api/progress → Insert user_progress → Update UI
```

### Content Loading Flow
```
+page.server.ts (load) → locals.supabase query → Return data → +page.svelte renders
```

## Key Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| User Profile | `profiles` | User data, membership status, admin flag |
| Module | `modules` | Course sections (e.g., "Seams", "Zippers") |
| Lesson | `lessons` | Individual videos/articles within modules |
| Progress | `user_progress` | Tracks lesson completion per user |
| Payment | `payments` | Stripe payment records |
| Blog Post | `blog_posts` | Marketing blog content |
| Testimonial | `testimonials` | Customer reviews for homepage |
| Promo Code | `promo_codes` | Discount codes for checkout |

## External Services

### Supabase
- **Auth**: Email/password, Google OAuth, magic links
- **Database**: PostgreSQL with Row Level Security
- **Access**: 
  - `locals.supabase` - Respects RLS (user context)
  - `locals.supabaseAdmin` - Bypasses RLS (server-only)

### Stripe
- **Mode**: One-time payment (not subscriptions)
- **Integration**: Stripe Checkout (hosted payment page)
- **Webhook**: `/api/stripe/webhook` handles `checkout.session.completed`
- **On Success**: Sets `profiles.is_member = true`, records payment

### Bunny.net
- **Purpose**: Video hosting and streaming
- **URL Format**: `bunny:{libraryId}/{videoId}`
- **Embed**: Converted to iframe URL at render time

### Resend
- **Purpose**: Transactional emails
- **Use Cases**: Welcome emails, password reset, purchase confirmation

## Security Model

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only read/write their own progress
- Only admins can modify content tables
- Public read access for published content only

### Protected Routes
| Route Pattern | Requirement |
|---------------|-------------|
| `/dashboard/*` | `is_member = true` |
| `/modules/*/[lesson]` | `is_member = true` OR `is_free_preview = true` |
| `/admin/*` | `is_admin = true` |

### Auth Validation
- Session validated on every request in `hooks.server.ts`
- JWT verified via `supabase.auth.getUser()`
- Profile fetched and attached to `locals.profile`

## Known Constraints

### Performance
- **Video Loading**: Bunny.net CDN handles delivery; no server-side processing
- **Database Queries**: Most pages make 1-3 queries; no complex joins
- **SSR**: All pages server-rendered for SEO; no client-side data fetching

### Limitations
- **No Subscriptions**: Single lifetime payment only
- **No Video Upload**: Videos managed directly in Bunny.net dashboard
- **No Search**: No full-text search implementation
- **No i18n**: English only

### Scalability Considerations
- Supabase connection pooling handles concurrent users
- Static assets served from `/static` (consider CDN for production)
- No caching layer; relies on Supabase query performance
