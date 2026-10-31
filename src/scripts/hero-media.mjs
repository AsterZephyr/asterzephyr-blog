export function allowsAutomaticMotion(reducedMotion, connection) {
  return !reducedMotion && !connection?.saveData;
}

export function setupHeroMedia(hero) {
  const video = hero.querySelector('video');
  const background = hero.querySelector('[data-hero-background]');
  if (!video || !background) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 768px)');
  const connection = navigator.connection;
  let inView = hero.getBoundingClientRect().bottom > 0;
  let pageActive = true;
  let autoplayBlocked = false;
  let failed = false;
  let pendingPlay = false;
  let frame = 0;
  video.muted = true;

  const shouldPlay = () => !failed && !autoplayBlocked && pageActive
    && !document.hidden && inView && allowsAutomaticMotion(motion.matches, connection);
  const syncPlayback = () => {
    if (!shouldPlay()) {
      video.pause();
      return;
    }
    if (pendingPlay || !video.paused) return;
    if (!video.hasAttribute('src')) {
      // Quality is explicit: every viewport uses the same cacheable 4K file.
      video.src = video.dataset.src;
      video.load();
    }
    pendingPlay = true;
    let interrupted = false;
    // pause() during initial loading rejects play() with AbortError. It is not
    // an autoplay-policy block: returning onscreen must be allowed to resume.
    video.play().then(() => {
      if (!shouldPlay()) video.pause();
    }).catch((error) => {
      if (error?.name === 'AbortError') {
        interrupted = true;
      } else {
        autoplayBlocked = true;
        hero.dataset.videoReady = 'false';
      }
    }).finally(() => {
      pendingPlay = false;
      if (interrupted) syncPlayback();
    });
  };

  video.addEventListener('playing', () => {
    if (shouldPlay()) hero.dataset.videoReady = 'true';
    else video.pause();
  });
  video.addEventListener('error', () => {
    failed = true;
    hero.dataset.videoReady = 'false';
    video.pause();
  });

  const updateScroll = () => {
    frame = 0;
    const rect = hero.getBoundingClientRect();
    inView = rect.bottom > 0 && rect.top < window.innerHeight;
    const offset = !motion.matches && desktop.matches && inView
      ? Math.min(Math.max(-rect.top * 0.06, 0), 24) : 0;
    background.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : '';
    syncPlayback();
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  };
  const onPreferences = () => {
    if (!allowsAutomaticMotion(motion.matches, connection)) {
      hero.dataset.videoReady = 'false';
    }
    // Apply stop immediately, even when the tab cannot run animation frames.
    syncPlayback();
    schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', () => { pageActive = true; schedule(); });
  window.addEventListener('pagehide', () => { pageActive = false; video.pause(); });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', onPreferences);
  connection?.addEventListener?.('change', onPreferences);
  schedule();
}
