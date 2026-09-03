# Phase 8 (optional) — Signed Bunny Stream embed URLs

## Why

`VideoPlayer.svelte` builds `https://iframe.mediadelivery.net/embed/<library>/<video>`
on the client from `lesson.video_url`. Nothing about the URL is secret, so any
member (or anyone who once saw a page source) can embed every video forever.
Bunny Stream's "embed view token authentication" fixes that once the embed
URL carries `token` and `expires`, computed server-side from a key that must
never reach the browser.

Bunny's documented formula (verify it against
https://docs.bunny.net/docs/stream-embed-token-authentication before coding;
the sandbox has outbound web access):
`token = lowercase hex SHA-256( TOKEN_AUTHENTICATION_KEY + video_id + expires )`,
where `expires` is a Unix timestamp in seconds, appended as
`?token=<token>&expires=<expires>`.

## Deliverables

### `src/lib/server/bunny.ts` (new)

- `getBunnyEmbedUrl(videoUrl: string, ttlSeconds = 6 * 60 * 60): Promise<string | null>`:
  parse with the existing `parseBunnyUrl` from `$lib/types`; return `null` for
  unparsable input; build the embed URL with the existing query
  (`autoplay=false&preload=true`); when `BUNNY_EMBED_TOKEN_KEY` (private env)
  is set, append `token` and `expires` computed with WebCrypto
  `crypto.subtle.digest('SHA-256', …)`. When it is unset, return the unsigned
  URL (identical to today's output) so nothing changes until the key exists.

### Lesson page

- `src/routes/modules/[moduleSlug]/[lessonSlug]/+page.server.ts` computes
  `embedUrl` server-side for the lesson being viewed and returns it alongside
  `lesson`. Do not expose the key or the raw token formula to the client.
- `src/lib/components/course/VideoPlayer.svelte` takes `embedUrl: string | null`
  instead of `videoUrl`, and no longer imports `parseBunnyUrl`/`getBunnyEmbedUrl`.
  Update every usage (`grep -rn "VideoPlayer" src`).
- `getBunnyEmbedUrl` in `src/lib/types/index.ts` is removed if nothing else
  uses it; `parseBunnyUrl` stays (the seeder and admin may use it).

### Configuration

- `.env.example`: add `BUNNY_EMBED_TOKEN_KEY=` under the Bunny section with a
  comment: "Stream > Library > Security > Embed view token authentication".

Out of scope: enabling the setting in the Bunny dashboard, the free-preview
module thumbnails, the admin lesson editor.

## Steps

1. Fetch and read the Bunny embed-token documentation linked above; write the exact formula you verified as a comment in `src/lib/server/bunny.ts`.
2. Read `src/lib/types/index.ts` (`parseBunnyUrl`, `getBunnyEmbedUrl`), `src/lib/components/course/VideoPlayer.svelte`, the lesson load, and every `VideoPlayer` usage (`grep -rn "VideoPlayer" src`).
3. Create `src/lib/server/bunny.ts`; commit `feat(video): server-side Bunny embed URLs with optional signing`.
4. Switch the lesson load and `VideoPlayer` to the server-computed `embedUrl`; remove the client-side builder; commit `refactor(video): pass a ready embed URL to VideoPlayer`.
5. Document `BUNNY_EMBED_TOKEN_KEY` in `.env.example`; commit `docs: document BUNNY_EMBED_TOKEN_KEY`.
6. `npm run check` and `npm run build` after each commit.

## Definition of Done

- [ ] `src/lib/server/bunny.ts` exists; with `BUNNY_EMBED_TOKEN_KEY` unset its output equals the current `getBunnyEmbedUrl(libraryId, videoId)` string; with it set the URL has `token` (64 lowercase hex chars) and `expires` (integer seconds, now + ttl) query params, computed as SHA-256 over key + videoId + expires.
- [ ] No client-side code builds an `iframe.mediadelivery.net` URL (`grep -rn "mediadelivery" src` matches only `src/lib/server/bunny.ts`).
- [ ] `VideoPlayer.svelte` receives a ready `embedUrl` prop; the lesson load computes it on the server.
- [ ] The private key is read only via `$env/dynamic/private` in server code.
- [ ] `.env.example` documents `BUNNY_EMBED_TOKEN_KEY`.
- [ ] `npm run check` reports 0 errors and no new warnings; `npm run build` succeeds.
