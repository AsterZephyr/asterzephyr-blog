// Fence metadata: ```ts title="example.ts" {2,4-6}
export function codeAnnotations() {
  return {
    name: 'asterzephyr-code-annotations',
    pre(node) {
      const raw = this.options.meta?.__raw || '';
      const title = /(?:^|\s)(?:title|filename)=(?:"([^"]+)"|'([^']+)')/.exec(raw);
      if (title) node.properties['data-code-title'] = title[1] || title[2];
    },
    line(node, number) {
      const raw = this.options.meta?.__raw || '';
      const marked = /(?:^|\s)\{([\d,\s-]+)\}/.exec(raw)?.[1];
      if (marked?.split(',').some((part) => {
        const match = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(part);
        return match && number >= Number(match[1]) && number <= Number(match[2] || match[1]);
      })) this.addClassToHast(node, 'line-emphasis');
    },
  };
}
