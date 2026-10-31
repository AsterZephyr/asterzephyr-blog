# Gallery journal

## Theme
A cinematic aerial of Goa Beaches introduces a personal journal about systems, intelligence and life. The film, serif titles and generous margins create the identity. Article content stays quiet and legible. The user selected the local macOS footage; aesthetic decisions were specified by Claude and implemented within the existing page structure.

## Palette
CSS variables in `src/styles/global.css` are the source of truth; Tailwind references them. Paper #F7F4EE, alternate paper #EEE9DF, ink #262722, body #45463F, brass #86663B, muted #716D63, rules #D8D1C4. Existing semantic colors in article diagrams and callouts retain their meaning.
The hero alone uses cyan-ink overlays (rgb(4 30 34)) and seafoam supporting text (#D9ECE7). Do not tint or desaturate the film itself.

## Typography
Georgia with Songti SC / Noto Serif CJK SC / SimSun fallbacks for headings. Native system sans-serif for navigation and body. No external font dependency. Hero 40–144px, section titles 32–48px, journal titles 21–27px, reading title 30–44px. Chinese body 17px on mobile, 18px desktop; line-height 1.95.

## Components
Articles are rows separated by thin rules, with date metadata and an optional pinned label. Search results use the same journal classes and include the same cover, title, summary and tags. Project descriptions and links are always visible, including on touch and keyboard navigation.

## Layout
Maximum outer width 1152px with 24px gutters. Reading column remains 768px. Home: beach film, author introduction, latest writing. The film fills at least the full dynamic viewport height, without a fixed height cap; the introduction begins below the first screen. Hero text is bottom-aligned like opening film titles, with dedicated space for the footer. Desktop article rows have a 138px metadata column; mobile stacks metadata above the title.

## Depth
Use the film itself for depth. Paper surfaces and separators replace tilted cards, shadows and ornamental gradients. Local cyan-ink hero overlays protect text contrast while retaining the ocean's color. Keep the hard edge between film and paper.

## Do and don't
Keep all meaningful content visible without JavaScript. Keep text out of busy image details. No looping typing, bouncing arrows, 3D card tilt or hidden hover-only actions. Use 180ms interactions, a 450ms one-time hero entrance, a 600ms video fade and at most 24px desktop scroll parallax. The user explicitly chose continuous silent playback with no play/pause control. No page-router changes or animation library.

## Responsive and accessibility
375px is a required preview width; also check 320px and desktop. The user explicitly requires 4K quality on every screen: use the same 3840 × 2160 film on desktop and mobile, never downgrade based on network estimates. Mobile uses CSS portrait cropping with no parallax. Reduced motion and Save-Data default to a static poster without requesting video. Reduced motion also disables smooth scrolling and decorative entrances. Video pauses offscreen and in hidden tabs, then resumes on return. Autoplay rejection leaves the poster. Media URLs carry content fingerprints and have long-lived cache headers; replacing media requires a new fingerprint. Navigation uses native details on mobile. Preserve visible focus and readable contrast throughout the selected clip. Fonts, video and JavaScript failing must not hide content.

## Iteration guide
Preserve the selected footage and content when adjusting typography, overlay strength or crop. Check home, archive, search, tag listings, projects and a long mixed Chinese/English post after shared-style changes. Build before presenting the preview. Scope commits to visual files, keeping unrelated content edits out. Present a local preview for approval before pushing. The user approved pushing the selected Apple-derived footage on 2026-10-31; redistribution rights have not been independently verified. See `docs/hero-video.md` for provenance, media variants and license boundaries.
