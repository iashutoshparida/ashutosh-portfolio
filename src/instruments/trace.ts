import data from '../data/growthpilot-trace.json';
import { liveText, renderDay, type Trace } from './trace-render';

export function mount(root: HTMLElement) {
  const trace = data as unknown as Trace;
  const out = root.querySelector<HTMLElement>('[data-trace-out]')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-trace-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-trace-next]')!;
  const select = root.querySelector<HTMLSelectElement>('[data-trace-select]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const label = root.querySelector<HTMLElement>('[data-trace-label]')!;
  const max = trace.days.length;
  let day = trace.featured_day;

  const show = (n: number, announce: boolean) => {
    day = Math.min(max, Math.max(1, n));
    const d = trace.days.find((x) => x.day === day)!;
    out.innerHTML = renderDay(d, trace.guardrails);
    select.value = String(day);
    prev.disabled = day === 1;
    next.disabled = day === max;
    label.textContent = `Day ${day} of ${max}`;
    if (announce) live.textContent = liveText(d);
  };
  prev.addEventListener('click', () => show(day - 1, true));
  next.addEventListener('click', () => show(day + 1, true));
  select.addEventListener('change', () => show(Number(select.value), true));
  show(day, false);
  root.dataset.ready = '';
}
