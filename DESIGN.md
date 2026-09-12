# Gallery journal

## Theme
A classical painting introduces a personal journal about systems, intelligence and life. The painting, serif titles and generous margins create the identity. Article content stays quiet and legible.

## Palette
CSS variables in `src/styles/global.css` are the source of truth; Tailwind references them. Paper #F7F4EE, alternate paper #EEE9DF, ink #262722, body #45463F, brass #86663B, muted #716D63, rules #D8D1C4. Existing semantic colors in article diagrams and callouts retain their meaning.

## Typography
Georgia with Songti SC / Noto Serif CJK SC / SimSun fallbacks for headings. Native system sans-serif for navigation and body. No external font dependency. Hero 40–144px, section titles 32–48px, journal titles 21–27px, reading title 30–44px. Chinese body 17px on mobile, 18px desktop; line-height 1.95.

## Components
Articles are rows separated by thin rules, with date metadata and an optional pinned label. Search results use the same journal classes and include the same cover, title, summary and tags. Project descriptions and links are always visible, including on touch and keyboard navigation.

## Layout
Maximum outer width 1152px with 24px gutters. Reading column remains 768px. Home: painting, author introduction, latest writing. Desktop article rows have a 138px metadata column; mobile stacks metadata above the title.

## Depth
Use the painting itself for depth. Paper surfaces and separators replace tilted cards, shadows and ornamental gradients. Hero overlays protect text contrast while retaining the painting's color.

## Do and don't
Keep all meaningful content visible without JavaScript. Keep text out of busy image details. No looping typing, bouncing arrows, 3D card tilt or hidden hover-only actions. Use 180ms interactions, a 450ms one-time hero entrance and at most 24px desktop scroll parallax. No page-router changes or animation library.

## Responsive and accessibility
375px is a required preview width; also check 320px and desktop. Mobile painting is static. Reduced motion disables decorative movement, including smooth scrolling. Navigation uses native details on mobile. Preserve visible focus and readable contrast. Fonts and JavaScript failing must not hide content.

## Iteration guide
Preserve the image and content when adjusting typography, overlay strength or crop. Check home, archive, search, tag listings, projects and a long mixed Chinese/English post after shared-style changes. Build before presenting the preview. Scope commits to visual files, keeping unrelated content edits out. Present a local preview for approval before pushing.
