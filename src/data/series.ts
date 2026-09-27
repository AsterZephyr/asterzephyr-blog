// Source filenames remain stable even when Astro normalizes their URL slugs.
// These are curated reading paths, ordered by prerequisites rather than date.
export const SERIES = [
  {
    id: 'generative-recommendation',
    title: 'Generative recommendation',
    description: 'From the foundations of semantic IDs to training trade-offs and production systems.',
    posts: [
      '从梯度下降到-semantic-id-理解-rqvae-所需的全部前序知识.mdx',
      '码本利用率的骗局-rqvae-semantic-id-训练的七个工程权衡.mdx',
      '广告生成式推荐的工程全景-从三篇工业论文提炼系统设计观.mdx',
      'PPO搬到推荐系统后为什么水土不服-从小红书SAGE看生成式推荐的非对称优化设计.mdx',
    ],
  },
  {
    id: 'building-agents',
    title: 'Building and evaluating agents',
    description: 'Infrastructure, application architecture, evaluation, and the limits of benchmarks.',
    posts: [
      'agent-infra-到底在建什么-从模型调用到-agent-原生基础设施的全景拆解.mdx',
      '面向业务的agent后端架构设计.mdx',
      'agent-eval-全景-怎么评-怎么设计-怎么学.mdx',
      'agent-benchmark-正在失效-为什么静态评估无法衡量真实的-agent-能力.mdx',
      'closed-loop-rsi-三篇论文深读.mdx',
    ],
  },
  {
    id: 'recommendation-systems',
    title: 'Recommendation systems, from the ground up',
    description: 'A guided path through system design, retrieval, reranking, and industrial architectures.',
    posts: [
      '推荐系统系列之推荐系统概览.md',
      '通用推荐系统架构.md',
      '推荐系统系列之推荐系统召回阶段的深入探讨.md',
      '推荐广告算法链路-rerank演进.md',
      'OneTrans-字节跳动如何用一个Transformer统一推荐系统的特征交互与序列建模.mdx',
      '一份历史千个候选-四篇工业推荐论文里的计算复用.mdx',
    ],
  },
];
