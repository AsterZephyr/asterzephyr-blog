# AsterZephyr Blog

Personal homepage and blog built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [MDX](https://mdxjs.com/). Designed with an amber-toned, academic aesthetic inspired by classical art. Content managed via Obsidian and deployed on Vercel.

**Live site**: [asterzephyr.xyz](https://www.asterzephyr.xyz)

## Quick Start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Static output to dist/
npm run preview    # Preview the build locally
```

Requires Node.js >= 22.12.0.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Astro v6 (static output) |
| Styling | Tailwind CSS v3 + `@tailwindcss/typography` |
| Content | Astro Content Collections (glob loader + Zod) |
| Rich content | MDX |
| Fonts | Raleway (headings) + Open Sans (body) via Google Fonts |
| Syntax highlighting | Shiki (github-dark theme) |
| Deployment | Vercel (static) |
| SEO | Sitemap, RSS, OpenGraph, Twitter Cards |

## Project Structure

```
src/
  components/    # Astro components (Hero, Header, Footer, cards, etc.)
  content/
    posts/       # Blog posts (Markdown/MDX)
    projects/    # Project entries (Markdown)
    research/    # Research/publications (Markdown)
  content.config.ts   # Collection schemas (Zod)
  data/site.ts        # Site-wide config (name, bio, social links, nav)
  layouts/             # BaseLayout, PageLayout, PostLayout
  pages/               # File-based routing
  styles/global.css    # Tailwind + CSS variables + animations
public/
  images/              # Static images (hero, avatar, project covers)
  files/               # Downloadable files (resume, etc.)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage: Hero + About + Projects + Research + Latest Posts |
| `/blog` | Blog listing with tag filter |
| `/blog/[slug]` | Individual post with TOC sidebar |
| `/projects` | Project card gallery |
| `/tags` | All tags with post counts |
| `/tags/[tag]` | Posts filtered by tag |
| `/rss.xml` | RSS feed |
| `/sitemap-index.xml` | Sitemap |
| `/404` | Custom 404 page |

## Content Workflow (Obsidian)

1. Open `src/content/posts/` as an Obsidian vault (or include it in your existing vault)
2. Create a new `.md` file with frontmatter:
   ```yaml
   ---
   title: "My New Post"
   date: 2026-05-04
   tags: [topic1, topic2]
   summary: "A brief description."
   draft: false
   ---
   ```
3. Write your content in standard Markdown
4. `git add` + `git commit` + `git push`
5. Vercel auto-deploys

Posts with `draft: true` are excluded from production builds.

## Content Schemas

### Posts (`src/content/posts/*.md`)
- `title` (required) - Post title
- `date` (required) - Publication date
- `updated` (optional) - Last updated date
- `tags` (optional) - String array, defaults to `[]`
- `category` (optional) - Category string
- `summary` (optional) - Brief description for cards and SEO
- `cover` (optional) - Path to cover image (e.g. `/images/covers/my-post.jpg`)
- `draft` (optional) - Set `true` to hide from production, defaults to `false`

### Projects (`src/content/projects/*.md`)
- `title`, `description` (required)
- `date` (required)
- `cover` (optional) - Path to project screenshot/image
- `url` (optional) - Live demo link
- `repo` (optional) - GitHub repo link
- `tags` (optional), `featured` (optional), `order` (optional)

### Research (`src/content/research/*.md`)
- `title`, `authors`, `venue` (required)
- `date` (required)
- `paper` (optional) - Link to PDF
- `project` (optional) - Link to project page
- `cover`, `featured`, `order` (optional)

## Design System

### Color Palette (Amber Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-surface` | `#ffffff` | Main background |
| `--color-surface-alt` | `#faf8f5` | Alternate section backgrounds |
| `--color-heading` | `#1a1a1a` | Heading text |
| `--color-body` | `#3d3d3d` | Body text |
| `--color-accent` | `#b45309` | Primary accent (buttons, links) |
| `--color-accent-light` | `#d97706` | Lighter accent (hover states) |
| `--color-accent-glow` | `#fbbf24` | Highlight accent (decorative elements) |
| `--color-accent-bg` | `#fffbeb` | Accent background tint |
| `--color-muted` | `#8a8a8a` | Muted/secondary text |
| `--color-border` | `#e8e4de` | Borders |

### Typography
- **Headings**: Raleway, 600-900 weight
- **Body**: Open Sans, 400-600 weight, 16px base, 1.65 line-height

## Replacing Placeholder Images

The site ships with classical oil paintings as placeholders. Replace them with your own:

### Hero Background
- **File**: `public/images/hero-bg.jpg`
- **Recommended size**: 1920x1200px or wider, landscape orientation
- **Current**: Thomas Cole - "The Consummation of Empire" (1836), public domain
- **Tips**: A dark or richly-colored image works best since it gets a gradient overlay. Landscapes, cityscapes, or dramatic scenes work well.

### Avatar / Profile Photo
- **File**: `public/images/avatar.jpg`
- **Recommended size**: 400x500px, portrait orientation (4:5 ratio)
- **Current**: Placeholder crop from hero painting
- **Tips**: Replace with your actual photo. The image gets a subtle amber-tinted background frame.

### Project Cover Images
- **Files**: `public/images/projects/project-1.jpg`, `project-2.jpg`, `project-3.jpg`
- **Recommended size**: 800x600px, landscape orientation
- **Current paintings**:
  - `project-1.jpg`: Karl Bryullov - "The Last Day of Pompeii" (1833)
  - `project-2.jpg`: Jean-Leon Gerome - "The Death of Caesar" (1867)
  - `project-3.jpg`: Jacques-Louis David - "Oath of the Horatii" (1784)
- **Tips**: Replace with actual project screenshots. Reference the new path in each project's frontmatter `cover` field.

### Adding New Images
Place any new images in `public/images/` (or subdirectories). Reference them in frontmatter or components as `/images/your-file.jpg`.

## Customization

### Site Config
Edit `src/data/site.ts` to change:
- Name, tagline, bio
- Social links (GitHub, email, Twitter, LinkedIn)
- Navigation items
- Typed text subtitles on the hero

### Color Theme
Edit CSS variables in `src/styles/global.css` and corresponding values in `tailwind.config.mjs`. The amber palette can be swapped to any color family by updating the `--color-accent*` variables.

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Framework preset: **Astro**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

Custom domain: Add your domain in Vercel project settings > Domains.

## Image Credits

All placeholder images are **public domain** paintings sourced from [Wikimedia Commons](https://commons.wikimedia.org/):

- **Hero**: Thomas Cole, *The Consummation of Empire* (1836) - [source](https://commons.wikimedia.org/wiki/File:Cole_Thomas_The_Consummation_The_Course_of_the_Empire_1836.jpg)
- **Project 1**: Karl Bryullov, *The Last Day of Pompeii* (1833) - [source](https://commons.wikimedia.org/wiki/File:Karl_Brullov_-_The_Last_Day_of_Pompeii_-_Google_Art_Project.jpg)
- **Project 2**: Jean-Leon Gerome, *The Death of Caesar* (1867) - [source](https://commons.wikimedia.org/wiki/File:Gerome_Death_of_Caesar.jpg)
- **Project 3**: Jacques-Louis David, *Oath of the Horatii* (1784) - [source](https://commons.wikimedia.org/wiki/File:%22Oath_of_the_Horatii%22_by_Jacques-Louis_David.jpg)

## Future Extensions

- Dark mode toggle
- Full-text search (Pagefind)
- Comments (giscus)
- View transitions (Astro ViewTransitions)
- i18n support
- Analytics (Umami/Plausible)

## License

Content (blog posts, project descriptions) is copyright the author. Code and templates are MIT licensed.
