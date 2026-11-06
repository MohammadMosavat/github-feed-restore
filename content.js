(() => {
  const KEY = 'ghFeedState';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const isFeed = () =>
    location.pathname === '/' || location.pathname.startsWith('/dashboard');

  const findMore = () =>
    [...document.querySelectorAll('button, a')].find(
      (el) => /^(load )?more$/i.test(el.textContent.trim()) && !el.disabled
    );

  const save = () => {
    if (!isFeed()) return;
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        h: document.documentElement.scrollHeight,
        y: window.scrollY,
      })
    );
  };

  let lastAction = 'advance';
  let restoring = false;

  async function restore() {
    const raw = sessionStorage.getItem(KEY);
    if (!raw || restoring) return;
    const { h, y } = JSON.parse(raw);
    restoring = true;

    for (let i = 0; i < 20; i++) {
      if (document.documentElement.scrollHeight >= h) break;

      const btn = findMore();
      if (!btn) {
        await sleep(300);
        if (!findMore()) break;
        continue;
      }

      const before = document.documentElement.scrollHeight;
      btn.click();

      // wait for new content (max ~5s)
      for (let t = 0; t < 25; t++) {
        await sleep(200);
        if (document.documentElement.scrollHeight > before) break;
      }
    }

    window.scrollTo(0, y);
    restoring = false;
  }

  function init() {
    if (!isFeed()) return;
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    const isBack = lastAction === 'restore' || navType === 'back_forward';

    if (isBack) restore();
    else sessionStorage.removeItem(KEY); // fresh visit = reset

    lastAction = 'advance';
  }

  document.addEventListener('turbo:visit', (e) => {
    lastAction = e.detail?.action || 'advance';
  });
  document.addEventListener('turbo:before-visit', save);
  document.addEventListener('turbo:load', init);
  window.addEventListener('pagehide', save);
  window.addEventListener('popstate', () => (lastAction = 'restore'));

  init();
})();