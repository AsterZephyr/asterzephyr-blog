# Goa Beaches hero media

## Scope and provenance

The user selected the downloaded macOS **Goa Beaches** aerial on 2026-10-31. Its asset ID is `B13D40FC-C033-436D-A197-185900EC3552`; the source is a 3840 × 2160 HEVC MOV in the user's local macOS wallpaper cache. The 801 MB source stays outside the repository and is never modified.

The user approved pushing the selected footage and homepage implementation on 2026-10-31 after reviewing the local preview. Public redistribution rights for Apple's footage have not been independently established; this user approval is not a claim of an Apple license. The footage retains its original copyright and is not covered by this repository's code license.

Claude specified the aesthetic direction: light aerial imagery, text over the quieter water on the left, bottom-aligned titles, cyan-ink overlays and seafoam supporting text. The user subsequently explicitly removed the proposed pause control in favor of continuous silent looping. The site's navigation, wording, fonts and subsequent sections are retained.

## Derivatives

The user subsequently required **4K on every screen**, preferring cache reuse to automatic quality reduction. Active files live under `public/media/goa/4k/`; exact fingerprinted URLs are recorded in `src/data/hero-media.json`.

| File | Dimensions | Use |
| --- | --- | --- |
| `goa-4k.<hash>.mp4` | 3840 × 2160 | All screens, including slow reported connections |
| `poster-desktop.<hash>.jpg` | 3840 × 2160 | All-screen first paint and static fallback, cropped with identical CSS to the video |

The active MP4 is H.264, 24 fps, YUV 4:2:0, audio-free, with front-loaded metadata. The high-quality CRF 20 encode is about 33.4 MiB. It retains the same 4K spatial resolution on phones; CSS crops its display rather than fetching a lower-resolution file. Older lower-resolution derivatives remain local but are no longer referenced by the page.

The source interval is 450–468 seconds. The last 1.2 seconds crossfade into the first 1.2 seconds; trimming the matching opening interval yields a 16.8-second loop. The poster matches the resulting first frame. Both image and video retain the full landscape source and use identical `object-fit: cover` and mobile `object-position: 84% 50%`, so portrait, landscape and tablet layouts do not change composition during fade-in. Encoding uses normal timeline speed, not the source's high capture frame rate.

The source is attached once before playback. Resizing and rotating do not change its URL, restart playback or request another rendition. Network quality estimates cannot select a blurry source. Explicit reduced-motion and Save-Data preferences still take priority over automatic playback.

## Cache policy

All active media filenames include the first 12 hexadecimal characters of their SHA-256 content hash. `vercel.json` assigns `Cache-Control: public, max-age=31536000, immutable` only to `/media/goa/4k/:path*`. Other pages and assets keep their existing cache policies. The same file can be reused across desktop/mobile layouts and repeat visits while it remains in the browser cache. Browser eviction or user cache clearing can still require another download.

Whenever media bytes change, generate a new filename and update the manifest; never overwrite an immutable URL with different bytes. `tests/hero-cache.test.mjs` checks every referenced fingerprint against the actual file and verifies the scoped Vercel policy. Astro's local preview does not apply `vercel.json` response headers; validate the one-year deployment headers and CDN cache hits after Vercel deploys the approved push. No service worker, IndexedDB copy or forced full-file download is introduced, preserving native video streaming and byte-range behavior.

## Playback and verification

The HTML contains no video `src`, so no JavaScript, reduced motion and Save-Data show the poster without fetching video. Normal connections, including 3G, request silent continuous looping without controls. Muted inline playback and the MP4 format target current Chromium, Firefox and Safari. Every rejected play promise is handled; browser-imposed autoplay blocking keeps the poster. Offscreen or hidden-tab interruptions during loading must not be mistaken for autoplay-policy rejection. The poster remains present underneath the video throughout loading, playback and failure.

Run `npm test`, `npm run build`, and `npm run check:discovery`. Inspect the real homepage at 320px, 375px and desktop widths; check automatic looping, scroll out and back, reduced motion, disabled JavaScript, blocked video requests, mobile navigation, keyboard focus and contrast across the loop. Actual iOS Safari requires a real-device check before release; a desktop WebKit run is useful evidence but does not replace it.
