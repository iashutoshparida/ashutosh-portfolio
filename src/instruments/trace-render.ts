// GrowthPilot agent trace (I-5). One renderer shared by the static build and the client,
// so the no-JS page and the interactive page show identical markup.
// Values are shown as committed: money is only padded to cents, ROAS and shares are never re-rounded.

export interface TraceDay {
  day: number;
  observe: { channel: string; spend: number; pred_revenue: number }[];
  estimate_roas: Record<string, number>;
  prev_allocation: Record<string, number>;
  proposal: Record<string, number>;
  rationale: string;
  guardrail_violations: string[];
  allocation: Record<string, number>;
  shifted_share: number;
  shifted_share_display: string;
  needs_approval: boolean;
  approval: string;
}
export interface Trace {
  meta: { source_repo: string; source_commit: string; approval_note: string };
  guardrails: { daily_budget: number; max_daily_change: number; min_share: number; approval_shift: number };
  featured_day: number;
  days: TraceDay[];
}

export const CHANNEL_LABEL: Record<string, string> = {
  meta: 'Meta',
  google_uac: 'Google UAC',
  applovin: 'AppLovin',
  unity: 'Unity',
};
const ch = (c: string) => CHANNEL_LABEL[c] ?? c;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
// Config constants are fractions (0.2); strip float noise when shown as a percent.
const pct = (x: number) => String(+(x * 100).toFixed(6));
const money = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function guardrailLine(g: Trace['guardrails']): string {
  return `Ceiling $${g.daily_budget.toLocaleString('en-US')}/day · ±${pct(g.max_daily_change)}% per channel per day · ≥${pct(g.min_share)}% per channel · >${pct(g.approval_shift)}% shift needs approval`;
}

export function approvalLine(d: TraceDay, g: Trace['guardrails']): string {
  const cap = `${pct(g.approval_shift)}%`;
  if (d.needs_approval) {
    const who = /simulated/.test(d.approval) ? 'approved by simulated reviewer (always approves)' : esc(d.approval);
    return `Shift ${d.shifted_share_display} &gt; ${cap} · approval needed · ${who}`;
  }
  return `Shift ${d.shifted_share_display} ≤ ${cap} · approval not required`;
}

export function liveText(d: TraceDay): string {
  const n = d.guardrail_violations.length;
  const v = n === 0 ? 'no guardrail violations' : `${n} guardrail violation${n === 1 ? '' : 's'}`;
  return `Day ${d.day}: ${v}, approval ${d.needs_approval ? 'needed' : 'not required'}`;
}

function pairBars(d: TraceDay, from: Record<string, number>, to: Record<string, number>, budget: number, toLabel: string): string {
  const rows = Object.keys(from)
    .map((c) => {
      const a = (from[c] / budget) * 100;
      const b = (to[c] / budget) * 100;
      return `<div class="tr-bars__row">
  <span class="tr-bars__ch">${esc(ch(c))}</span>
  <span class="tr-bars__track" aria-hidden="true"><span class="tr-bars__a" style="width:${a}%"></span><span class="tr-bars__b" style="width:${b}%"></span></span>
  <span class="tr-bars__v">${money(from[c])} → ${money(to[c])}</span>
</div>`;
    })
    .join('');
  return `<div class="tr-bars" role="group" aria-label="Spent today versus ${esc(toLabel)}, day ${d.day}">
  <p class="tr-bars__key"><span class="tr-key tr-key--a"></span>spent today <span class="tr-key tr-key--b"></span>${esc(toLabel)}</p>${rows}</div>`;
}

export function renderDay(d: TraceDay, g: Trace['guardrails']): string {
  const observe = d.observe.length
    ? `<table class="tr-table"><thead><tr><th scope="col">Channel</th><th scope="col">Spend</th><th scope="col">Predicted 30-day revenue</th></tr></thead><tbody>${d.observe
        .map((o) => `<tr><th scope="row">${esc(ch(o.channel))}</th><td>${money(o.spend)}</td><td>${money(o.pred_revenue)}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="tr-empty">No matured cohorts yet (cohorts mature after 3 days).</p>`;

  const estimate = `<dl class="tr-kv">${Object.entries(d.estimate_roas)
    .map(([c, v]) => `<div><dt>${esc(ch(c))}</dt><dd>${v}</dd></div>`)
    .join('')}</dl>`;

  const violations = d.guardrail_violations.length
    ? `<ul class="tr-violations">${d.guardrail_violations.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>`
    : `<p class="tr-empty">No violations</p>`;

  const step = (n: number, name: string, body: string, mod = '') =>
    `<li class="tr-step${mod}"><h3 class="tr-step__name"><span>${String(n).padStart(2, '0')}</span> ${name}</h3><div class="tr-step__body">${body}</div></li>`;

  return `<ol class="tr-steps" data-day="${d.day}">
${step(1, 'Observe', `<p class="tr-note">Cohorts with 3 days of play, by channel</p>${observe}`)}
${step(2, 'Estimate', `<p class="tr-note">Predicted 30-day ROAS per channel</p>${estimate}`)}
${step(3, 'Propose', `<p class="tr-quote">“${esc(d.rationale)}”</p>${pairBars(d, d.prev_allocation, d.proposal, g.daily_budget, 'planned for tomorrow')}`)}
${step(4, 'Guardrails', `<p class="tr-note">${guardrailLine(g)}</p>${violations}`, d.guardrail_violations.length ? ' has-violations' : '')}
${step(5, 'Allocation', pairBars(d, d.prev_allocation, d.allocation, g.daily_budget, 'allocated for tomorrow'))}
${step(6, 'Approval', `<p class="tr-approval">${approvalLine(d, g)}</p>`, d.needs_approval ? ' needs-approval' : '')}
</ol>`;
}
