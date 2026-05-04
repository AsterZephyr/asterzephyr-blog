# Blog Writing Style Guide

This reference defines the writing voice, structure patterns, and quality standards for blog posts. The style is derived from the author's existing posts -- analytical, first-person, data-driven, written in Chinese with English technical terms.

## Voice and Tone

### The Core Voice

Write like an engineer explaining something interesting to a colleague over coffee. Not lecturing, not selling, not being modest for the sake of it. The reader is smart and has context -- don't over-explain basics, but do explain your reasoning.

**Good voice markers:**
- "结果有些出乎意料" -- honest about surprises
- "这并不意味着这些特征真的没用" -- pushes past surface-level conclusions
- "打个比方，你让一个员工自己评估自己的工作风险等级，结果能有多客观？" -- relatable analogies
- "这个问题不性感，但杀伤力巨大" -- direct, opinionated

**Bad voice markers:**
- "让我们一起来探索..." -- tutorial-speak
- "在当今快速发展的技术领域..." -- filler
- "X 是一个非常强大的工具" -- empty praise
- "这无疑是一个值得深思的问题" -- says nothing

### Language Rules

1. **Chinese body text, English technical terms** -- write prose in Chinese, keep technical nouns in English: "SHAP interaction values", "Training-Serving Skew", "Deployment Overhang"
2. **No translation of established terms** -- don't say "因式分解机" for "Factorization Machine" or "随机梯度下降" for "SGD"
3. **Short sentences preferred** -- avoid clauses nested 3+ levels deep
4. **Active voice** -- "我用 SHAP interaction values 做了分析" not "SHAP interaction values 被用来做了分析"
5. **First person when sharing experience** -- "我发现..." not "笔者发现..." or "我们发现..."
6. **No emoji** -- ever, in any part of the post

## Opening Patterns

The opening paragraph determines whether the reader continues. It must state something specific and interesting within the first 3 sentences.

### Pattern A: Surprising Result
> 我在 Criteo 广告点击数据上做了一组完整的特征工程实验。结果有些出乎意料：原始的 39 个特征，每一个单独拿出来做 IV 评估，全部被判定为 "useless"。但经过系统的特征构造之后，AUC 提升了 3.42%。

Why it works: Specific numbers, clear contradiction, hooks curiosity.

### Pattern B: Gap in Current Discussion
> Agent 安全这个话题讨论了一两年了，但之前所有讨论都有一个共同的问题：缺少真实数据。大家要么在假想场景里推演，要么在评估环境里跑 benchmark。

Why it works: Identifies a specific gap the reader has probably felt, promises to fill it.

### Pattern C: Counterintuitive Claim
> 大部分团队在做性能优化时，第一反应是加缓存。但在我们的 RTB 系统里，移除一层缓存反而让 P99 延迟降了 40%。

Why it works: Challenges an assumption, makes the reader want to understand why.

### Patterns to AVOID:
- "随着 X 技术的快速发展..." -- boring, generic
- "本文将介绍..." -- meta-commentary instead of content
- "X 是目前最热门的技术之一..." -- so what?

## Section Structure

Each major section should:

1. **Open with the point** -- state the section's key insight in the first 1-2 sentences
2. **Support with evidence** -- data, code, diagrams, or concrete examples
3. **Add analysis** -- what does this evidence mean? Why does it matter?
4. **Connect forward** -- bridge to the next section naturally

Avoid sections that are purely descriptive without analysis. Every section should have an opinion or insight.

### Section Length

- Target: 500-1200 characters per section
- A section under 300 characters probably doesn't justify its own heading
- A section over 1500 characters should probably be split

### Heading Style

- Use descriptive headings that preview the point: "手动交叉 vs FM 自动交叉" not "方法比较"
- Level 2 (`##`) for major sections (4-6 per post)
- Level 3 (`###`) for subsections (2-4 per major section, optional)
- No Level 4+ -- if you need that much nesting, restructure

## Data Presentation

### Tables

Use tables for structured comparisons. Keep them scannable:

```markdown
| 实验 | 特征数 | AUC | LogLoss |
|:-----|:-------|:----|:--------|
| Baseline | 23 | 0.5672 | 0.1923 |
| Enhanced | 38 | **0.5866** | **0.1916** |
```

- Bold the winning/key numbers
- Left-align text columns, right or center for numbers
- Keep columns to 5-6 max

### Code Blocks

Include code when it adds clarity, but not for trivial operations:

```python
# Good: Shows a non-obvious technique with a brief comment
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
```

```python
# Bad: Shows something any reader could write
import pandas as pd
df = pd.read_csv('data.csv')
```

Rules:
- Always specify language in the code fence
- Keep code blocks under 15 lines -- link to full source for longer examples
- Add a brief comment explaining the "why", not the "what"
- Python and Go are the primary languages; use whichever fits the topic

### Inline Numbers

When citing numbers in text, provide context for interpretation:

- Good: "AUC 提升了 +0.0194（+3.42%）。在 CTR 预估领域，这个幅度不算小。线上系统里 0.01 的 AUC 提升就值得上一次 AB 实验。"
- Bad: "AUC 提升了 0.0194。"

Always answer the implicit question: "is that number big or small?"

## Closing Patterns

The closing section is NOT a summary. Never start with "总结一下" or "综上所述". Instead:

### Pattern A: Personal Takeaways
> 回顾整个实验，有几件事我自己印象比较深。
> [List of specific, opinionated observations]

### Pattern B: Open Questions
> 这篇研究回答了一些问题，但也留下了更多：
> [Specific unanswered questions that point toward future work]

### Pattern C: Honest Assessment
> 这个方案解决了 X，但对 Y 的处理仍然粗糙。如果再做一次，我会...

### Patterns to AVOID:
- "总之，X 是一个值得关注的方向" -- says nothing
- Restating each section's main point as a bullet list
- "希望这篇文章对你有帮助" -- unnecessary

## Analogies and Comparisons

Good analogies make technical concepts stick. Use them when bridging from unfamiliar to familiar:

- "新手的策略像驾校教练坐在副驾上随时准备踩刹车" -- maps abstract pattern to concrete image
- "这有点像早期的云计算采用曲线" -- connects to reader's existing knowledge

Rules:
- One good analogy per 1000 characters is about right
- Don't stretch analogies beyond one paragraph
- Analogies from the reader's likely experience (software engineering, product development) work better than abstract metaphors

## Transitions

Connect sections with substance, not filler:

- Good: "实验做完，我拿这套流程和自己负责的 RTB 生产系统做了对比。教科书和生产之间的差距，比我预想的大得多。"
- Bad: "接下来我们来看看生产环境中的情况。"

The transition should hint at what's coming AND why it matters.

## Footnotes and References

- Inline links for sources: `[原文链接](url)`
- Separate references section at the end for academic papers or major sources
- When citing a research paper, include authors and date on first mention
- When referencing vault notes, use wikilinks: `[[note-name]]`

## Quality Checklist

Before considering a post complete:

- [ ] Title is specific and interesting (not generic like "关于 X 的思考")
- [ ] Opening paragraph hooks the reader with something concrete
- [ ] Every section has an opinion or insight, not just description
- [ ] At least 2 Mermaid diagrams that add genuine value
- [ ] Code examples are non-trivial and commented
- [ ] Numbers are contextualized ("is that big or small?")
- [ ] No AI writing patterns (no "delve into", no "it's worth noting", no em-dash overuse)
- [ ] Closing section adds new insight, not just summary
- [ ] Word count >= 4000 Chinese characters (excluding code/frontmatter)
- [ ] All Mermaid diagrams follow syntax rules and render correctly
- [ ] Frontmatter matches Astro schema: title, date, tags, category, summary
- [ ] File saved to `src/content/posts/` with descriptive slug naming
- [ ] `npm run build` passes with the new post
