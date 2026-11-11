// Global, tiny: evidence popovers (I-1), Contents sheet (I-7), copy email (I-8). Budget: homepage JS ≤ 15 KB gz.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- I-1 Evidence stamp popovers ---------- */
let openStamp: HTMLButtonElement | null = null;

function popoverOf(btn: HTMLButtonElement) {
  return document.getElementById(btn.getAttribute('aria-controls') || '') as HTMLElement | null;
}
function closeStamp(returnFocus = true) {
  if (!openStamp) return;
  const pop = popoverOf(openStamp);
  if (pop) pop.hidden = true;
  openStamp.setAttribute('aria-expanded', 'false');
  if (returnFocus) openStamp.focus();
  openStamp = null;
}
function openStampFor(btn: HTMLButtonElement) {
  if (openStamp && openStamp !== btn) closeStamp(false);
  const pop = popoverOf(btn);
  if (!pop) return;
  pop.hidden = false;
  pop.classList.remove('flip-x');
  const r = pop.getBoundingClientRect();
  if (r.right > window.innerWidth - 8) pop.classList.add('flip-x');
  btn.setAttribute('aria-expanded', 'true');
  openStamp = btn;
}
document.addEventListener('click', (ev) => {
  const t = ev.target as HTMLElement;
  const btn = t.closest<HTMLButtonElement>('button[data-stamp]');
  if (btn) {
    ev.preventDefault();
    ev.stopPropagation();
    if (openStamp === btn) closeStamp();
    else openStampFor(btn);
    return;
  }
  if (openStamp && !t.closest('.popover')) closeStamp(false);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && openStamp) {
    ev.preventDefault();
    closeStamp();
  }
});
document.addEventListener('focusout', (ev) => {
  if (!openStamp) return;
  const wrap = openStamp.closest('.stamp-wrap');
  const next = (ev as FocusEvent).relatedTarget as Node | null;
  if (wrap && next && !wrap.contains(next)) closeStamp(false);
});

/* ---------- I-7 Contents sheet ---------- */
const sheet = document.getElementById('contents-sheet');
const openBtn = document.querySelector<HTMLButtonElement>('[data-contents-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-contents-close]');
const background = () => [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.skip-link')];

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
}
function openSheet() {
  if (!sheet) return;
  sheet.hidden = false;
  if (!reduced()) {
    sheet.classList.add('is-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.remove('is-entering')));
  }
  background().forEach((el) => el?.setAttribute('inert', ''));
  document.documentElement.style.overflow = 'hidden';
  openBtn?.setAttribute('aria-expanded', 'true');
  sheet.querySelector<HTMLElement>('.toc a')?.focus();
}
function closeSheet() {
  if (!sheet || sheet.hidden) return;
  sheet.hidden = true;
  background().forEach((el) => el?.removeAttribute('inert'));
  document.documentElement.style.overflow = '';
  openBtn?.setAttribute('aria-expanded', 'false');
  openBtn?.focus();
}
openBtn?.addEventListener('click', openSheet);
closeBtn?.addEventListener('click', closeSheet);
sheet?.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    ev.preventDefault();
    closeSheet();
    return;
  }
  if (ev.key !== 'Tab') return;
  const f = focusables(sheet);
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault();
    first.focus();
  }
});
sheet?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeSheet()));

/* ---------- I-8 Copy email ---------- */
document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const label = btn.textContent;
      btn.textContent = 'COPIED';
      const status = btn.parentElement?.querySelector('[data-copy-status]');
      if (status) status.textContent = 'Email address copied';
      setTimeout(() => (btn.textContent = label), 1500);
    } catch {
      /* clipboard unavailable: the address is visible on the page */
    }
  });
});
