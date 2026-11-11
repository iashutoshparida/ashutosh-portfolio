// I-2 lens filter. Progressive: without JS, chips are anchor links to a by-lens list.
type LensId = 'all' | 'engineering' | 'product' | 'research' | 'growth';
const LENS_IDS: LensId[] = ['all', 'engineering', 'product', 'research', 'growth'];

function apply(root: HTMLElement, lens: LensId, updateHash: boolean) {
  const rows = root.querySelectorAll<HTMLLIElement>('li[data-lenses]');
  let shown = 0;
  rows.forEach((li) => {
    const match = lens === 'all' || (li.dataset.lenses ?? '').split(' ').includes(lens);
    li.hidden = !match;
    if (match) shown++;
  });
  root.querySelectorAll<HTMLElement>('[data-group]').forEach((g) => {
    g.hidden = !g.querySelector('li[data-lenses]:not([hidden])');
  });
  root.querySelectorAll<HTMLElement>('[data-lens]').forEach((c) => {
    c.setAttribute('aria-pressed', String(c.dataset.lens === lens));
  });
  const status = root.querySelector('[data-pindex-status]');
  if (status) status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}`;
  if (updateHash) {
    const url = lens === 'all' ? location.pathname + location.search : `#${lens}`;
    history.replaceState(null, '', url);
  }
}

document.querySelectorAll<HTMLElement>('[data-pindex]').forEach((root) => {
  root.querySelectorAll<HTMLAnchorElement>('[data-lens]').forEach((chip) => {
    chip.addEventListener('click', (ev) => {
      ev.preventDefault();
      apply(root, chip.dataset.lens as LensId, true);
    });
    chip.addEventListener('keydown', (ev) => {
      if (ev.key === ' ') {
        ev.preventDefault();
        apply(root, chip.dataset.lens as LensId, true);
      }
    });
  });
  const fromHash = () => {
    const h = location.hash.slice(1) as LensId;
    if (LENS_IDS.includes(h)) apply(root, h, false);
  };
  fromHash();
  // Same-page links such as /work/#research change only the hash; re-apply.
  window.addEventListener('hashchange', fromHash);
});
