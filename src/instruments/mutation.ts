import data from '../data/codepilot-mutation.json';

type Phase = 'before' | 'after';
const isKilled = (s: string) => s === 'killed' || s === 'timeout';

export function mount(root: HTMLElement) {
  const cells = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cell]'));
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-phase]'));
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const tip = root.querySelector<HTMLElement>('[data-tip]')!;
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase: Phase = 'before';

  const describe = (i: number) => {
    const m = data.mutants[i];
    return `${m.file}:${m.line}, ${m.operator}: ${m.description}. Before: ${m.before}. After: ${m.after}.`;
  };

  const set = (p: Phase, announce: boolean) => {
    phase = p;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.phase === p)));
    const step = reduced.matches ? 0 : 300 / cells.length;
    cells.forEach((c, n) => {
      const m = data.mutants[Number(c.dataset.cell)];
      c.style.transitionDelay = announce ? `${Math.round(n * step)}ms` : '0ms';
      c.classList.toggle('is-killed', isKilled(m[p]));
      c.setAttribute('aria-label', describe(Number(c.dataset.cell)));
    });
    const s = data.summary[p];
    readout.textContent = `${s.display.killed} · ${s.display.score}`;
    if (announce) live.textContent = `${p === 'before' ? 'Before' : 'After generated tests'}: ${s.display.killed}, ${s.display.score}`;
  };

  const showTip = (c: HTMLElement) => {
    const m = data.mutants[Number(c.dataset.cell)];
    tip.innerHTML = '';
    const line = (cls: string, text: string) => {
      const el = document.createElement('span');
      el.className = cls;
      el.textContent = text;
      tip.appendChild(el);
    };
    line('tip__loc', `${m.file}:${m.line} · ${m.operator}`);
    line('tip__desc', m.description);
    line('tip__src', m.source_line);
    line('tip__status', `Before: ${m.before} · After: ${m.after}`);
    tip.hidden = false;
    const sr = stage.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    const w = tip.offsetWidth;
    let left = cr.left - sr.left + cr.width / 2 - w / 2;
    left = Math.max(0, Math.min(left, sr.width - w));
    tip.style.left = `${left}px`;
    tip.style.top = `${cr.bottom - sr.top + 8}px`;
  };
  const hideTip = () => (tip.hidden = true);

  // Roving tabindex: one tab stop for the whole strip; arrows move cell by cell.
  let current = 0;
  const focusCell = (i: number) => {
    cells[current].tabIndex = -1;
    current = (i + cells.length) % cells.length;
    cells[current].tabIndex = 0;
    cells[current].focus();
  };
  cells.forEach((c, i) => {
    c.tabIndex = i === 0 ? 0 : -1;
    c.addEventListener('focus', () => {
      cells[current].tabIndex = -1;
      current = i;
      c.tabIndex = 0;
      showTip(c);
    });
    c.addEventListener('mouseenter', () => showTip(c));
    c.addEventListener('click', () => showTip(c));
    c.addEventListener('blur', hideTip);
    c.addEventListener('mouseleave', () => {
      if (document.activeElement !== c) hideTip();
    });
    c.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') focusCell(current + 1);
      else if (k === 'ArrowLeft' || k === 'ArrowUp') focusCell(current - 1);
      else if (k === 'Home') focusCell(0);
      else if (k === 'End') focusCell(cells.length - 1);
      else if (k === 'Escape') hideTip();
      else return;
      e.preventDefault();
    });
  });
  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.phase as Phase, true)));
  set(phase, false);
  root.dataset.ready = '';
}
