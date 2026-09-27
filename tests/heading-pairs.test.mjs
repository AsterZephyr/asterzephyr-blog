import test from 'node:test';
import assert from 'node:assert/strict';
import { pairHeadings } from '../src/lib/heading-pairs.js';
const h = (text, level = 'H2') => ({ text, level });

test('ordinary translated outlines keep positional correspondence', () => {
  assert.deepEqual(pairHeadings([h('组织'), h('协作')], [h('Organization'), h('Collaboration')]), [[0, 0], [1, 1]]);
});
test('repaired missing fences do not shift existing section anchors', () => {
  const source = [h('导言'), h('Part 40：系统'), h('40.3 OneSearch', 'H3'), h('Part 50：部署'), h('附录')];
  const target = [h('Introduction'), h('Part 40: Systems'), h('40.3 OneSearch', 'H3'), h('40.4 Gaps', 'H3'), h('Part 41: Training'), h('Part 50: Deployment'), h('Appendix')];
  assert.deepEqual(pairHeadings(source, target), [[0, 0], [1, 1], [2, 2], [3, 5], [4, 6]]);
});
test('ambiguous duplicate section numbers are not mistaken for matches', () => {
  assert.deepEqual(pairHeadings([h('1. A'), h('1. B')], [h('1. C'), h('1. D'), h('Other')]), []);
});
test('heading levels distinguish parts from subsections', () => {
  assert.deepEqual(pairHeadings([h('Part 1：开始'), h('1. 小节', 'H3')], [h('Part 1: Start'), h('1. Section', 'H3'), h('2. Extra', 'H3')]), [[0, 0], [1, 1]]);
});
