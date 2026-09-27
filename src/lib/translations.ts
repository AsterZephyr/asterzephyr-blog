import { getCollection, type CollectionEntry } from 'astro:content';

export async function getTranslations() {
  const entries = await getCollection('translations', ({ data }) => !data.draft);
  return new Map(entries.map((entry) => [entry.data.sourceFile, entry]));
}

export function translationFor(
  post: CollectionEntry<'posts'>,
  translations: Map<string, CollectionEntry<'translations'>>,
) {
  // Use the source filename rather than assuming Astro's slug normalization.
  return translations.get(post.filePath?.split('/').pop() || '');
}
