---
title: "Building My New Blog with Astro"
date: 2026-05-04
tags: [astro, blog, webdev]
category: Tech
summary: "How I migrated from NotionNext to a custom Astro-powered blog with Obsidian as my writing tool."
draft: false
---

## Why I Switched

After running my blog on NotionNext for a while, I decided it was time for something more personal. I wanted full control over the design, a local-first writing experience, and the freedom to craft every pixel of my homepage.

## The Stack

- **Astro** for static site generation
- **Tailwind CSS** for styling
- **MDX** for rich content
- **Obsidian** for writing
- **Vercel** for deployment

## What I Learned

Building a blog from scratch teaches you a lot about web fundamentals. Content collections in Astro are incredibly powerful — you define a schema, write your Markdown, and everything just works.

```typescript
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});
```

## What's Next

I'm planning to add:
- Dark mode
- Full-text search with Pagefind
- Comments via giscus
- More projects and research entries

Stay tuned for more posts about the journey.
