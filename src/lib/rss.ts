import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../data/site';
import { getTranslations, translationFor } from './translations';

export async function blogFeed(language: 'zh' | 'en', site: URL) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const translations = await getTranslations();
  const entries = posts.sort((a, b) => +b.data.date - +a.data.date || a.id.localeCompare(b.id))
    .map((post) => ({ post, translation: translationFor(post, translations) }))
    .filter(({ translation }) => language === 'zh' || Boolean(translation)).slice(0, 30);
  const feedURL = new URL(language === 'en' ? '/rss-en.xml' : '/rss.xml', site).href;
  return rss({
    title: `${SITE.name} — ${language === 'en' ? 'English' : '中文'}`,
    description: language === 'en' ? 'New writing on systems, intelligence, and life. English editions.' : '关于系统、智能与生活的新文章。中文原文。',
    site,
    trailingSlash: false,
    items: entries.map(({ post, translation }) => ({
      title: language === 'en' ? translation!.data.title : post.data.title,
      description: language === 'en' ? translation!.data.summary || translation!.data.title : post.data.summary || post.data.title,
      pubDate: post.data.date,
      link: `/blog/${encodeURIComponent(post.id)}/?lang=${language}`,
      // Preserve the existing Chinese feed identity when adding edition hints.
      customData: `<guid isPermaLink="true">${new URL(`/blog/${encodeURIComponent(post.id)}/${language === 'en' ? '?lang=en' : ''}`, site).href}</guid>`,
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${language === 'en' ? 'en' : 'zh-CN'}</language><atom:link href="${feedURL}" rel="self" type="application/rss+xml" />`,
  });
}
