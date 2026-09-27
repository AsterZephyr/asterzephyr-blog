// One subject per post, plus an optional reading-series tag.
export const BLOG_TAGS = [
  '技术报告解读',
  '读书笔记',
  'AI 与机器学习',
  'Agent 与编程',
  '系统与工程',
  '广告与推荐',
  '工具与效率',
  '成长与思考',
] as const;

export const TAG_LABELS: Record<string, string> = {
  '技术报告解读': 'Research Notes',
  '读书笔记': 'Book Notes',
  'AI 与机器学习': 'AI & Machine Learning',
  'Agent 与编程': 'Agents & Programming',
  '系统与工程': 'Systems & Engineering',
  '广告与推荐': 'Ads & Recommendations',
  '工具与效率': 'Tools & Productivity',
  '成长与思考': 'Life & Reflections',
};
