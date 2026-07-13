export const SITE = {
  name: 'AsterZephyr',
  title: 'AsterZephyr',
  description: 'Personal homepage and blog of AsterZephyr — backend engineer, algorithm builder, and AI explorer.',
  url: 'https://www.asterzephyr.xyz',
  author: 'AsterZephyr',
  tagline: 'AdTech Algorithm Engineer. System Builder. AI Explorer.',
  subtitles: [
    'programmatic advertising & RTB.',
    'AI infrastructure.',
    'agent systems & LLM.',
    'open source.',
  ],
  bio: `I build the prediction and pricing stack for a programmatic ad exchange. CTR models that convert CPM bids into CPC prices, serving millions of auction requests daily. The work is half ML (DNN with FM interactions, isotonic calibration, PCOC monitoring) and half systems (Go on 300+ K8s pods, multi-region TF Serving, Kafka pipelines).`,
  bioExtended: `Recently I've been designing training pipelines from the ground up: Parquet ingestion, feature canonicalization, cross-feature generation, incremental retraining with cold-start handling. I also lead an AI Agent project that automates ad traffic allocation, turning hours of daily manual ops into LLM-driven analysis and one-click config.`,
  bioSide: `Side projects: an LLM API gateway aggregating 40+ providers with real-token probing for quality monitoring, and a lightweight agent framework. I'm drawn to the overlap between recommendation systems and large language models, specifically how transformer architectures can improve conversion prediction at scale.`,
  social: {
    github: 'https://github.com/asterzephyr',
    twitter: '',
    linkedin: '',
    email: 'hxz2046084122@outlook.com',
  },
  nav: [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
  ],
} as const;
