export const SITE = {
  name: 'AsterZephyr',
  title: 'AsterZephyr',
  description: 'Personal homepage and blog of AsterZephyr — backend engineer, algorithm builder, and AI explorer.',
  url: 'https://www.asterzephyr.xyz',
  author: 'AsterZephyr',
  tagline: 'Algorithm Engineer. System Builder. AI Explorer.',
  subtitles: [
    'programmatic advertising & RTB.',
    'AI infrastructure.',
    'agent systems & LLM.',
    'open source.',
  ],
  bio: `I'm an algorithm engineer at a leading digital marketing group, where I design and build real-time bidding systems, ML model serving pipelines, and budget optimization algorithms for programmatic advertising at scale. My day-to-day involves Go and TensorFlow Serving — turning ad auction math into production models that handle millions of bid requests.`,
  bioExtended: `On the side, I run an AI infrastructure project: an LLM API gateway aggregating 40+ model providers, a lightweight agent framework, and a service quality monitoring system built on real-token probing. I care about systems that actually work under load — not just demos.`,
  bioSide: `My path: from search-ads-rec system architecture to algorithm research. Currently exploring LLM4Rec and unified sequence modeling for large-scale recommendation — where transformer architectures meet feature interaction in conversion prediction. I believe the best way to understand a system is to build it yourself.`,
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
