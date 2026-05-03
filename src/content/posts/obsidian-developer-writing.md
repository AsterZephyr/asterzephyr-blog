---
title: "Notes on Obsidian as a Developer's Writing Tool"
date: 2026-03-15
tags: [obsidian, writing, productivity]
category: Tools
summary: "Why Obsidian has become my go-to tool for technical writing, and how it integrates with a Git-based blog."
draft: false
---

## Why Obsidian

Obsidian hits a sweet spot for developers who write:

1. **Local-first** — Your files are plain Markdown on disk
2. **Git-friendly** — No proprietary database, just files in a repo
3. **Extensible** — Plugins for everything from Kanban boards to LaTeX
4. **Fast** — No cloud sync latency, no web app jank

## My Writing Workflow

1. Open the blog vault in Obsidian
2. Create a new Markdown file with frontmatter
3. Write the post using Obsidian's editor
4. Preview with live Markdown rendering
5. `git add`, `git commit`, `git push`
6. Vercel auto-deploys in seconds

## Tips for Blog Integration

- Keep images in a `public/images/` directory and reference them with absolute paths
- Use frontmatter consistently — Astro's content collections validate it for you
- The `draft: true` flag lets you work on posts without publishing them
- Obsidian's graph view helps you see connections between ideas

It's a simple, effective workflow that keeps the focus on writing rather than tooling.
