import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsAutomaticMotion, setupHeroMedia } from '../src/scripts/hero-media.mjs';

const settle = () => new Promise((resolve) => setImmediate(resolve));

function fixture(t, { reduced = false, saveData = false, width = 1440, effectiveType = '4g', downlink = 10 } = {}) {
  const originals = new Map(['window', 'document', 'navigator', 'requestAnimationFrame']
    .map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  t.after(() => {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const desktop = Object.assign(new EventTarget(), { matches: true });
  const connection = Object.assign(new EventTarget(), { saveData, effectiveType, downlink });
  const win = Object.assign(new EventTarget(), {
    innerWidth: width, innerHeight: 900, devicePixelRatio: 1,
    matchMedia: (query) => query.includes('reduced-motion') ? motion : desktop,
  });
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const frames = [];
  let frameId = 0;
  let top = 0;
  let pending;
  const video = Object.assign(new EventTarget(), {
    paused: true, playCalls: 0, dataset: { src: '/goa-4k.mp4' },
    hasAttribute: () => Boolean(video.src),
    load() {},
    play() {
      this.paused = false;
      this.playCalls++;
      return new Promise((resolve, reject) => { pending = { resolve, reject }; });
    },
    pause() {
      this.paused = true;
      if (pending) {
        const { reject } = pending;
        pending = undefined;
        reject(new DOMException('Interrupted by pause()', 'AbortError'));
      }
    },
  });
  const background = { style: {} };
  const hero = {
    dataset: {},
    querySelector: (selector) => selector === 'video' ? video : background,
    getBoundingClientRect: () => ({ top, bottom: top + 900 }),
  };
  for (const [name, value] of Object.entries({ window: win, document: doc, navigator: { connection }, requestAnimationFrame: (callback) => { frames.push(callback); return ++frameId; } })) {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
  const flush = () => { frames.splice(0).forEach((callback) => callback()); };
  setupHeroMedia(hero);
  flush();
  return {
    video, hero, motion, connection, doc, win, flush,
    scroll(y) { top = y; win.dispatchEvent(new Event('scroll')); flush(); },
    finishPlay() {
      const current = pending;
      pending = undefined;
      video.dispatchEvent(new Event('playing'));
      current.resolve();
    },
    rejectPlay(error) { const current = pending; pending = undefined; video.paused = true; current.reject(error); },
  };
}

for (const width of [375, 1440, 2560]) {
  test(`${width}px uses 4K even when the network estimate says 3G`, async (t) => {
    const f = fixture(t, { width, effectiveType: '3g', downlink: 1.2 });
    assert.equal(f.video.src, '/goa-4k.mp4');
    f.finishPlay();
    await settle();
    f.win.innerWidth = width === 375 ? 1440 : 375;
    f.win.dispatchEvent(new Event('resize'));
    f.flush();
    assert.equal(f.video.src, '/goa-4k.mp4');
    assert.equal(f.video.playCalls, 1);
  });
}

test('normal slow connections still animate; explicit motion/data preferences take priority', () => {
  assert.equal(allowsAutomaticMotion(false), true);
  assert.equal(allowsAutomaticMotion(true), false);
  assert.equal(allowsAutomaticMotion(false, { saveData: true }), false);
  assert.equal(allowsAutomaticMotion(false, { effectiveType: '3g' }), true);
});

test('scrolling offscreen during initial loading cannot permanently block playback', async (t) => {
  const f = fixture(t);
  assert.equal(f.video.playCalls, 1);
  f.scroll(-1000);
  assert.equal(f.video.paused, true);
  // Return before the interrupted promise has settled, reproducing the race.
  f.scroll(0);
  await settle();
  assert.equal(f.video.playCalls, 2);
  f.finishPlay();
  await settle();
  assert.equal(f.hero.dataset.videoReady, 'true');
});

test('hidden-tab interruption resumes when visible, including back/forward restoration', async (t) => {
  const f = fixture(t);
  f.doc.hidden = true;
  f.doc.dispatchEvent(new Event('visibilitychange'));
  await settle();
  assert.equal(f.video.playCalls, 1);
  f.doc.hidden = false;
  f.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.video.playCalls, 2);
  f.finishPlay();
  await settle();
  f.win.dispatchEvent(new Event('pagehide'));
  assert.equal(f.video.paused, true);
  f.win.dispatchEvent(new Event('pageshow'));
  f.flush();
  assert.equal(f.video.playCalls, 3);
  f.finishPlay();
  await settle();
});

for (const preference of ['reduced', 'saveData']) {
  test(`${preference} does not attach or fetch a video source`, async (t) => {
    const f = fixture(t, { [preference]: true });
    assert.equal(f.video.src, undefined);
    assert.equal(f.video.playCalls, 0);
    if (preference === 'reduced') {
      f.motion.matches = false;
      f.motion.dispatchEvent(new Event('change'));
    } else {
      f.connection.saveData = false;
      f.connection.dispatchEvent(new Event('change'));
    }
    assert.equal(f.video.playCalls, 1);
    f.finishPlay();
    await settle();
  });
}

test('autoplay-policy rejection keeps the poster without a retry loop', async (t) => {
  const f = fixture(t);
  f.rejectPlay(new DOMException('Autoplay disabled', 'NotAllowedError'));
  await settle();
  assert.equal(f.hero.dataset.videoReady, 'false');
  f.scroll(-1000);
  f.scroll(0);
  await settle();
  assert.equal(f.video.playCalls, 1);
});
