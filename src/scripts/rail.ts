// I-6 section rail: highlight the section in the top 40% of the viewport; jump menu on small screens.
const rail = document.querySelector<HTMLElement>('[data-rail]');
if (rail) {
  const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>('[data-rail-link]'));
  const select = rail.querySelector<HTMLSelectElement>('[data-rail-select]');
  const headings = links
    .map((l) => document.getElementById(l.dataset.railLink!))
    .filter((h): h is HTMLElement => !!h);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setCurrent = (id: string) => {
    links.forEach((l) => {
      if (l.dataset.railLink === id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    if (select && select.value !== id) select.value = id;
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setCurrent(visible[0].target.id);
    },
    { rootMargin: '0px 0px -60% 0px', threshold: 0 },
  );
  headings.forEach((h) => io.observe(h));
  if (headings[0]) setCurrent(headings[0].id);

  const go = (id: string) => {
    const h = document.getElementById(id);
    if (!h) return;
    h.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
    history.replaceState(null, '', `#${id}`);
    setCurrent(id);
  };
  links.forEach((l) =>
    l.addEventListener('click', (ev) => {
      ev.preventDefault();
      go(l.dataset.railLink!);
    }),
  );
  select?.addEventListener('change', () => go(select.value));
}
