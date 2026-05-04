---
name: blog-writer
description: >
  Write deep, original technical blog posts in Chinese for the Astro blog at asterzephyr.xyz.
  Covers AdTech/RTB algorithms, AI/ML/LLM, recommendation systems, Go/system design,
  and LLM4Rec. Use this skill whenever the user wants to write a blog post,
  draft a technical article, brainstorm blog topics, or asks for content ideas.
  Also triggers on: "写博客", "写文章", "blog", "选题", "技术文章", "深度分析".
  The skill researches the latest industry trends via web search and synthesizes
  external insights with the author's hands-on experience.
---

# Blog Writer (Astro Blog)

Write deep, original Chinese technical blog posts for asterzephyr.xyz. Each post targets 4000+ words, aimed at mid-senior engineers (3-7 years experience) who value depth over breadth.

## Output Format

Posts are written to the Astro blog at `/Users/hxz/code/asterzephyr-blog/`.

**Frontmatter schema** (must match `src/content.config.ts`):

```yaml
---
title: "文章标题"
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
category: "分类"
summary: "一句话摘要，显示在博客卡片上"
draft: false
pinned: false
---
```

**File location:** `src/content/posts/[slug].md`
**File naming:** Use Chinese title or descriptive slug, e.g. `推荐系统召回层设计.md`, `LLM4Rec实践总结.md`

**Existing tags** (reuse when possible): 广告, 开发, 思考, AI, agent, 基础设施, 工具, llm, obsidian, writing, productivity, 推荐, 算法, 健康, web3, 阅读

**Existing categories**: 技术分享, 个人思考, 工具推荐

## Core Principles

**Quality bar:** If a reader finishes the post and thinks "I could have guessed all of this", the post failed.

**Research bar:** If a post could have been written six months ago with the same content, the research phase failed. Every post should reference or respond to something happening in the industry right now.

**Synthesis bar:** If a post just reports what others said without the author's own analysis, it's a news summary, not a blog post.

## When This Skill Triggers

- User says they want to write a blog post or technical article
- User asks for blog topic suggestions or content ideas
- User provides a topic and wants it developed into a full post
- User wants to expand existing notes into publishable content

## Workflow

### Phase 1: Topic Discovery

Topics come from three sources. Explore all three before suggesting options.

#### Source 1: Existing Posts Scan

Search `src/content/posts/` for existing topics. Note what's covered and where gaps exist. Also scan `~/notes/` for draft material that could become posts.

#### Source 2: Web Trend Research

Use WebSearch to scan for recent discussions across these domains:

**Recommendation & Ad Algorithms:**
- CTR/CVR prediction architectures (DCN, DeepFM, DIN, transformers for rec)
- LLM4Rec: LLMs applied to recommendation systems
- Unified sequence modeling and feature interaction
- Ad auction optimization, bid strategies, budget pacing algorithms
- Real-time serving under latency constraints

**LLM Production & Applied AI:**
- RAG architectures in production
- Agent frameworks and orchestration (MCP, tool-use patterns, multi-agent)
- LLM evaluation and monitoring in production
- Fine-tuning vs prompting vs RAG tradeoffs with real cost data

**System Design & Engineering:**
- High-performance Go services, ML serving pipelines
- Real-time ML serving architectures
- Feature engineering pipelines at scale
- A/B testing and experimentation platforms

Search queries should be specific and recent-biased. Examples:
- `"LLM4Rec" recommendation transformer 2025 2026`
- `"CTR prediction" unified architecture feature interaction`
- `"real-time bidding" algorithm optimization production`
- `广告算法 CVR预估 实践 2026`

**Graceful degradation:** If WebSearch is unavailable, fall back: WebFetch on known URLs -> curl + public APIs (HN Algolia) -> notes + training knowledge. Always produce output with best available sources.

#### Source 3: Cross-Domain Synthesis

The most interesting topics come from intersections:

- **Ad Algorithms + LLM**: How do ad CTR/CVR prediction patterns transfer to LLM4Rec?
- **RTB + Agent Systems**: What can agent orchestration learn from RTB decision-under-uncertainty?
- **Feature Engineering + Transformer**: How do classical feature interaction methods compare with attention-based approaches?
- **A/B Testing + LLM Evaluation**: Statistical traps from ad experiments that recur in LLM eval

#### Presenting Topic Options

Provide 3-5 options with:
- Working title (provocative or question-based)
- Core thesis in one sentence
- 2-3 key external references with URLs
- Why this topic matters right now
- How it differs from existing posts

### Phase 2: Deep Research and Outline

#### Step 1: Vault Research
Search `~/notes/` for related notes, experiments, code snippets.

#### Step 2: Web Deep Dive
Find 3-5 substantive recent sources. For each:
1. Search with specific queries
2. Read via WebFetch to understand the argument
3. Extract core claim and supporting evidence
4. React: what does the author agree/disagree with based on production experience?

#### Step 3: Outline
- Hook (opening paragraph)
- 4-6 major sections with clear points
- For each section: which sources inform it, what's the author's angle
- Where diagrams would add value
- Where code examples fit
- A "so what" conclusion

Present outline to user for approval before writing.

### Phase 3: Writing

Follow [references/writing-guide.md](references/writing-guide.md) for style rules.

**Length target:** 4000+ Chinese characters (excluding code blocks and frontmatter).

**Integrating external research:**
1. **Setup**: "Netflix 工程团队最近发表了 X，但在我们的 RTB 系统里..."
2. **Contrast**: "业界普遍做法是 A，但在 100ms 延迟预算下，A 行不通..."
3. **Building on**: "这篇论文的发现和我们生产环境的观察一致，但他们忽略了..."

Ratio: ~30% external context, ~70% author's analysis.

**Diagrams:** Use code blocks with architecture descriptions, or create simple ASCII diagrams. Mermaid syntax is supported in the markdown but may require a plugin to render — if using Mermaid, note this in the PR so the plugin can be added.

### Phase 4: Review and Polish

1. Verify word count >= 4000 characters
2. Ensure frontmatter matches Astro schema exactly
3. Check no overlap with existing posts in `src/content/posts/`
4. Read for flow — does each section earn its place?
5. Verify external sources are attributed with URLs
6. Run `npm run build` to confirm the post builds correctly
7. Check the post renders correctly on dev server

### Phase 5: Publish

After user approval:
1. Ensure `draft: false` in frontmatter
2. `git add` the new post file
3. Commit with `feat: add blog post — [title]`
4. Push to trigger Vercel deployment

## Domain Knowledge

The author is an algorithm engineer at BlueFocus (digital marketing group), transitioning from ad system architecture to algorithm research, currently exploring LLM4Rec.

### Career Path
搜广推架构 -> 搜广推算法 -> LLM4Rec

### AdTech/RTB Algorithms
- CTR/CVR prediction, feature engineering for ad models
- Budget pacing with K-factor optimization, bid strategies
- Multi-stage ad filtering pipeline (32 filters)
- Real-time bidding under strict latency budgets
- TensorFlow Serving for production model inference

### Recommendation Systems
- Full pipeline: recall -> pre-ranking -> ranking -> re-ranking
- Unified sequence modeling + feature interaction (TAAC 2026 / KDD Cup)
- Transformer architectures for CVR prediction (HyFormer, OneTrans)
- Embedding strategies, hash embeddings, sequence features

### LLM4Rec (Current Focus)
- Applying LLM to recommendation tasks
- Unified tokenization for heterogeneous features
- Scaling laws in recommendation models
- Transfer learning from NLP to rec-sys

### AI Infrastructure (Side Project)
- LLM API gateway (40+ providers), agent framework
- Service quality monitoring with real-token probing
- Go + Python production systems

### System Design
- High-concurrency Go services
- Kafka pipelines, Redis patterns, distributed systems
- Performance optimization, profiling, benchmarking

## Anti-Patterns to Avoid

- **Tutorial voice**: "First, let's install X..."
- **List posts**: "5 ways to improve your Go code"
- **Hedge everything**: "It depends on your use case" without analysis
- **Fake conclusions**: "In conclusion, X is a powerful tool"
- **Throat-clearing openings**: "在当今快速发展的技术领域..."
- **Emoji in prose**: Never
- **AI writing patterns**: No "delve into", "it's worth noting", em-dash overuse
- **Citation-dumping**: Don't list sources without analysis
- **Forced AdTech angle**: Not every post needs to connect to advertising — write what's genuinely interesting

## References

- [references/writing-guide.md](references/writing-guide.md) — Writing style guide
- [references/mermaid-for-blog.md](references/mermaid-for-blog.md) — Mermaid syntax reference
