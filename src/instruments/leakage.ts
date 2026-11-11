import data from '../data/pressure-vit-leakage.json';

type Key = 'loso' | 'random_frames';
const spoken = (s: string) => s.replace('%', ' percent');

export function mount(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-split]'));
  const value = root.querySelector<HTMLElement>('[data-value]')!;
  const ci = root.querySelector<HTMLElement>('[data-ci]')!;
  const delta = root.querySelector<HTMLElement>('[data-delta]')!;
  const fill = root.querySelector<HTMLElement>('[data-fill]')!;
  const whisker = root.querySelector<HTMLElement>('[data-whisker]')!;
  const expl = root.querySelector<HTMLElement>('[data-expl]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;

  const set = (k: Key, announce: boolean) => {
    const s = data.splits[k];
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.split === k)));
    value.textContent = s.display.accuracy;
    ci.textContent = `95% CI ${s.display.ci95}`;
    delta.hidden = k !== 'random_frames';
    fill.style.width = `${s.accuracy * 100}%`;
    whisker.style.left = `${s.accuracy_ci95[0] * 100}%`;
    whisker.style.width = `${(s.accuracy_ci95[1] - s.accuracy_ci95[0]) * 100}%`;
    expl.textContent = data.explanations[k];
    root.dataset.split = k;
    if (announce) {
      live.textContent =
        k === 'random_frames'
          ? `Random frames: ${spoken(s.display.accuracy)} accuracy, ${data.delta_pts} points higher than unseen people`
          : `Unseen people: ${spoken(s.display.accuracy)} accuracy`;
    }
  };
  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.split as Key, true)));
  set('loso', false);
  root.dataset.ready = '';
}
