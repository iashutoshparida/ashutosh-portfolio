// QA_ACCEPTANCE §1–2: schemas, cross-file rules, banned strings and the number audit.
// Content is read straight from disk (no Astro runtime) and checked against the same Zod schemas the build uses.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { About, EvidenceEntry, ExperimentsFile, LabEntry, Project, Site, WritingFile } from '../../src/lib/schemas';

const ROOT = new URL('../../', import.meta.url).pathname;
const C = join(ROOT, 'src/content');
const DIST = join(ROOT, 'dist');
const fm = (file: string) => parse(readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)![1]);
const yml = (file: string) => parse(readFileSync(join(C, file), 'utf8'));

const projects = readdirSync(join(C, 'projects'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => Project.parse(fm(join(C, 'projects', f))));
const lab = readdirSync(join(C, 'lab'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => LabEntry.parse(fm(join(C, 'lab', f))));
const site = Site.parse(yml('site.yaml'));
const evidence = EvidenceEntry.array().parse(yml('evidence.yaml'));
const about = About.parse(fm(join(C, 'about.md')));
const experiments = ExperimentsFile.parse(yml('lab/experiments.yaml')).items;
WritingFile.parse(yml('lab/writing.yaml'));

const walk = (dir: string, ext: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p, ext) : p.endsWith(ext) ? [p] : [];
  });
const built = existsSync(DIST);
// The editor at /admin/ is not part of the public site.
const html = built
  ? walk(DIST, '.html')
      .filter((f) => !f.includes('/admin/'))
      .map((f) => ({ f, s: readFileSync(f, 'utf8') }))
  : [];
const js = built ? walk(join(DIST, '_astro'), '.js').map((f) => ({ f, s: readFileSync(f, 'utf8') })) : [];
const page = (route: string) => readFileSync(join(DIST, route, 'index.html'), 'utf8');
const text = (s: string) => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

describe('schemas and cross-file rules', () => {
  it('every project file name matches its slug, and slugs are unique', () => {
    const files = readdirSync(join(C, 'projects')).filter((f) => f.endsWith('.md'));
    expect(projects.length).toBeGreaterThan(0);
    files.forEach((f, i) => expect(projects[i].slug, f).toBe(f.replace(/\.md$/, '')));
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    const labFiles = readdirSync(join(C, 'lab')).filter((f) => f.endsWith('.md'));
    labFiles.forEach((f, i) => expect(lab[i].slug, f).toBe(f.replace(/\.md$/, '')));
  });

  it('rule 1: every evidence id exists; proof strip resolves', () => {
    const ids = new Set(evidence.map((e) => e.id));
    for (const p of projects) {
      if (p.primary_evidence) expect(ids.has(p.primary_evidence)).toBe(true);
      for (const m of p.metrics) expect(ids.has(m.evidence), `${p.slug}#${m.id}`).toBe(true);
    }
    for (const e of experiments) if (e.evidence) expect(ids.has(e.evidence)).toBe(true);
    for (const item of site.proof_strip) {
      const p = projects.find((x) => x.slug === item.project);
      expect(p, item.project).toBeTruthy();
      expect(p!.metrics.some((m) => m.id === item.metric_id), `${item.project}#${item.metric_id}`).toBe(true);
    }
  });

  it('rule 2: flagship numbers are 01–04, unique and contiguous; briefs have none', () => {
    const nums = projects.filter((p) => p.tier === 'flagship').map((p) => p.number).sort();
    expect(nums).toEqual(nums.map((_, i) => String(i + 1).padStart(2, '0')));
    for (const p of projects.filter((x) => x.tier === 'supporting')) expect(p.number || null, p.slug).toBeNull();
  });

  it('instrument data matches the committed display values', () => {
    const leak = JSON.parse(readFileSync(join(ROOT, 'src/data/pressure-vit-leakage.json'), 'utf8'));
    expect(leak.splits.loso.display).toMatchObject({ accuracy: '90.7%', ci95: '87.2–94.0' });
    expect(leak.splits.random_frames.display.accuracy).toBe('98.3%');
    expect(leak.delta_display).toBe('+7.6 pts');
    const mut = JSON.parse(readFileSync(join(ROOT, 'src/data/codepilot-mutation.json'), 'utf8'));
    expect(mut.mutants).toHaveLength(90);
    const killed = (p: 'before' | 'after') => mut.mutants.filter((m: any) => ['killed', 'timeout'].includes(m[p])).length;
    expect([killed('before'), killed('after')]).toEqual([mut.summary.before.killed, mut.summary.after.killed]);
    expect(mut.summary.before.display).toEqual({ killed: '7 / 90 killed', score: '7.8%' });
    expect(mut.summary.after.display).toEqual({ killed: '79 / 90 killed', score: '87.8%' });
    const tr = JSON.parse(readFileSync(join(ROOT, 'src/data/growthpilot-trace.json'), 'utf8'));
    expect(tr.days).toHaveLength(30);
    const d7 = tr.days.find((d: any) => d.day === tr.featured_day);
    expect(tr.featured_day).toBe(7);
    expect(d7.guardrail_violations).toHaveLength(4);
    expect(d7.guardrail_violations.every((v: string) => v.startsWith('change_cap:'))).toBe(true);
    expect(d7.shifted_share_display).toBe('8.55%');
    expect(d7.needs_approval).toBe(true);
  });
});

describe.skipIf(!built)('rendered site (run after `npm run build`)', () => {
  it('rule 3: "All work (N)" and lens counts are computed from content', () => {
    expect(page('')).toContain(`All work (${projects.length})`);
    const work = page('work');
    for (const lens of ['engineering', 'product', 'research', 'growth'] as const) {
      const n = projects.filter((p) => p.lenses.includes(lens)).length;
      expect(work, lens).toMatch(new RegExp(`data-lens="${lens}"[\\s\\S]*?${n}`));
    }
  });

  it('rule 4: placeholders render visibly and never become links', () => {
    for (const { f, s } of html) {
      expect(s, f).not.toMatch(/href="[^"]*PLACEHOLDER/);
      for (const m of s.matchAll(/href="mailto:([^"]*)"/g)) {
        expect(site.contact.email.placeholder, `mailto while email is a placeholder in ${f}`).toBe(false);
        expect(m[1], f).toBe(site.contact.email.value);
      }
    }
    const home = text(page(''));
    for (const k of ['email', 'linkedin', 'cv'] as const) {
      if (site.contact[k].placeholder) expect(home).toContain(site.contact[k].display);
    }
  });

  it('every resume bullet block carries an evidence label', () => {
    const t = text(page('about'));
    const n = about.experience.filter((e) => e.points?.length).length;
    expect((t.match(/SELF-REPORTED/g) ?? []).length).toBeGreaterThanOrEqual(n);
    for (const e of about.experience) for (const pt of e.points ?? []) expect(t).toContain(pt);
  });

  it('rule 5: pending roles show a visible marker', () => {
    for (const e of about.experience.filter((x) => x.pending)) {
      const marker = e.role.match(/\[[^\]]+\]/)![0];
      for (const route of ['', 'about']) expect(page(route)).toContain(`<span class="pending"`);
      expect(text(page('about'))).toContain(marker);
    }
  });

  it('rule 6: banned strings are absent from HTML and client JS', () => {
    // Owner decision 2026-11-11: Rungta work (MechanicSaathi, RV-Vision) may appear on /about/ as SELF-REPORTED,
    // and the owner's own email and phone may be published. SafarSaathi and AI Compounder stay excluded.
    const approvedEmail = site.contact.email.placeholder ? null : site.contact.email.value;
    const banned: [RegExp, string][] = [
      [/Agentic AI Product Intern/i, 'unverified title (D7)'],
      [/Hyderabad, India/, 'location string'],
      [/0 hallucinations/i, 'unsupported claim'],
      [/~4s/, 'unsupported claim'],
      [/504 chunks/i, 'unsupported claim'],
      [/HIPAA/, 'unsupported claim'],
      [/Safar[ -]?Saathi|AI[ -]Compounder/i, 'excluded Rungta-era project (D7)'],
      [/physics for fun/i, 'removed copy'],
    ];
    const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    for (const { f, s } of [...html.map((h) => ({ f: h.f, s: text(h.s) + ' ' + h.s })), ...js]) {
      for (const [re, why] of banned) expect(re.test(s), `${why} in ${f}`).toBe(false);
      const emails = [...s.matchAll(emailRe)].map((m) => m[0]).filter((e) => e !== approvedEmail);
      expect(emails, `unapproved email address in ${f}`).toEqual([]);
    }
    // D6: the withheld Digital Mirror survey percentages must not appear outside the About page's resume bullets.
    for (const { f, s } of html.filter((h) => !h.f.includes('/about/'))) {
      expect(/(^|[^0-9.])(68|61|46|84)%/.test(text(s)), `Digital Mirror statistic (D6) in ${f}`).toBe(false);
    }
    expect(/(^|[^0-9.])(68|46)%/.test(text(page('about'))), 'D6 statistic on /about/').toBe(false);
    expect(text(page('work/digital-mirror'))).not.toMatch(/(^|[^0-9.])(68|61|46|84)%/);
  });

  it('number audit: every data-claim number exists in content or instrument display strings', () => {
    const allowed = new Set<string>();
    const add = (s: string | null | undefined) => (s ?? '').match(/\d[\d,.]*/g)?.forEach((n) => allowed.add(n.replace(/[.,]$/, '')));
    for (const p of projects) {
      Object.values(p.summary).forEach(add);
      for (const m of p.metrics) [m.value, m.detail, m.label].forEach(add);
    }
    for (const l of lab) for (const m of l.metrics) [m.value, m.detail].forEach(add);
    JSON.stringify(yml('site.yaml')).match(/"[^"]*"/g)?.forEach(add);
    for (const f of ['pressure-vit-leakage', 'codepilot-mutation']) {
      const d = readFileSync(join(ROOT, 'src/data', `${f}.json`), 'utf8');
      d.match(/"(display|delta_display|killed|score)":\s*"[^"]*"/g)?.forEach(add);
      d.match(/"display":\s*\{[^}]*\}/g)?.forEach(add);
    }
    const mut = JSON.parse(readFileSync(join(ROOT, 'src/data/codepilot-mutation.json'), 'utf8'));
    add(`${mut.summary.bugs_caught.before} ${mut.summary.bugs_caught.after} ${mut.summary.bugs_caught.total}`);

    let claims = 0;
    for (const { f, s } of html) {
      for (const m of s.matchAll(/<(\w+)[^>]*\sdata-claim[^>]*>([\s\S]*?)<\/\1>/g)) {
        claims++;
        const nums = text(m[2]).match(/\d[\d,.]*/g) ?? [];
        for (const n of nums) expect(allowed.has(n.replace(/[.,]$/, '')), `"${n}" in ${f}: ${text(m[2]).trim()}`).toBe(true);
      }
    }
    expect(claims).toBeGreaterThan(20);
  });

  it('every rendered metric carries a full evidence label', () => {
    const labels = evidence.map((e) => e.label);
    for (const route of projects.map((p) => `work/${p.slug}`)) {
      const s = page(route);
      const rows = s.match(/<tr>[\s\S]*?<\/tr>/g)?.filter((r) => r.includes('data-claim')) ?? [];
      for (const r of rows) expect(labels.some((l) => r.includes(`>${l}<`) || r.includes(`> ${l} <`) || r.includes(l)), route).toBe(true);
    }
  });

  it('credits, citations and build notes are present', () => {
    expect(text(page('work/hsic-wallet-share'))).toMatch(/Sarvagya/);
    expect(text(page('lab/vqe'))).toContain('Prahlad M. V.');
    expect(text(page(''))).toContain('Prahlad M. V.');
    for (const route of ['colophon', 'work/pressure-vit']) {
      const t = text(page(route));
      expect(t).toContain('10.13026/C2W09K');
      expect(t).toContain('10.1109/BHI.2017.7897206');
    }
    for (const p of projects) expect(text(page(`work/${p.slug}`))).toContain(p.build_note);
  });

  it('one h1 per page, unique titles, no duplicate ids', () => {
    const titles = new Set<string>();
    for (const { f, s } of html) {
      expect((s.match(/<h1[\s>]/g) ?? []).length, f).toBe(1);
      const t = s.match(/<title>([^<]*)<\/title>/)![1];
      expect(titles.has(t), `duplicate title ${t}`).toBe(false);
      titles.add(t);
      const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      expect(ids.length - new Set(ids).size, `duplicate id in ${f}: ${ids.filter((x, i) => ids.indexOf(x) !== i)}`).toBe(0);
    }
  });

  it('no secrets or workbench folders in dist', () => {
    const files = walk(DIST, '');
    expect(files.some((f) => /\.env|intelligence\/|strategy\/|handoff\/|OWNER_NOTES/.test(f.replace(DIST, '')))).toBe(false);
    for (const { f, s } of [...html, ...js]) expect(/sk-[A-Za-z0-9]{20}|ghp_[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}/.test(s), f).toBe(false);
  });
});
