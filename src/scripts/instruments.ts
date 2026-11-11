// Lazy loader: an instrument's code and data are fetched only when its figure comes within one viewport.
const loaders: Record<string, () => Promise<{ mount: (el: HTMLElement) => void }>> = {
  leakage: () => import('../instruments/leakage'),
  mutation: () => import('../instruments/mutation'),
  trace: () => import('../instruments/trace'),
};
const figures = document.querySelectorAll<HTMLElement>('[data-instrument]');
const load = (el: HTMLElement) => loaders[el.dataset.instrument!]?.().then((m) => m.mount(el));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        load(e.target as HTMLElement);
      }
    },
    { rootMargin: '100% 0px' },
  );
  figures.forEach((f) => io.observe(f));
} else figures.forEach(load);
