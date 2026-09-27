# Article reading tools

All articles automatically receive a responsive H2/H3 table of contents, active-section tracking, local reading bookmarks, image enlargement, and code-copy controls. The tools refresh after the same-URL Chinese/English switch. On long articles, subsection groups expand around the current section; readers can also expand them manually.

Reading positions are stored only in the current browser, per article URL, for up to 180 days. Returning readers choose whether to continue. An explicit section link takes precedence. Finished articles clear their saved position. No account or server storage is required.

Click a body image (including Figure and TechGraph SVG images), or focus it and press Enter, to open the image viewer. Use +/− to zoom, drag with a mouse or scroll with touch to pan, 0 to reset, and Escape to close. Images already wrapped in links keep their original link behavior.

Code blocks receive a language label and a copy button automatically. Mermaid source blocks are excluded because they render as diagrams. To show a filename and highlight lines, add metadata to the code fence:

````md
```ts title="example.ts" {2,4-6}
const message = 'hello';
console.log(message);
```
````

`filename="example.ts"` is also accepted. Line numbers are one-based; filenames and emphasized lines are author-provided, never inferred. Highlighting does not alter copied code. Keep metadata consistent in the Chinese and English versions and follow the bilingual source-hash workflow when editing published articles.
