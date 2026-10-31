import rehypeKatex from 'rehype-katex';

// Keep invalid author input out of published HTML: rehype-katex normally warns
// and falls back to raw TeX, which is easy to miss in a successful site build.
export function renderMath() {
  const render = rehypeKatex({ strict: 'error', trust: false });
  return (tree, file) => {
    const messageCount = file.messages.length;
    render(tree, file);
    const error = file.messages.slice(messageCount).find((message) => message.source === 'rehype-katex');
    if (error) file.fail(error);
  };
}
