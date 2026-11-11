// Build-time loaders for single-file content (YAML / frontmatter) and derived values.
// Everything here runs only during the static build.
import { parse as parseYaml } from 'yaml';
import { getCollection, type CollectionEntry } from 'astro:content';
import siteRaw from '../content/site.yaml?raw';
import evidenceRaw from '../content/evidence.yaml?raw';
import aboutRaw from '../content/about.md?raw';
import experimentsRaw from '../content/lab/experiments.yaml?raw';
import writingRaw from '../content/lab/writing.yaml?raw';
import {
  About,
  EvidenceEntry,
  ExperimentsFile,
  Site,
  WritingFile,
  type EvidenceId,
  type Lens,
  type Metric,
} from './schemas';

function frontmatter(text: string): unknown {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('about.md has no frontmatter');
  return parseYaml(m[1]);
}

export const site = Site.parse(parseYaml(siteRaw));
export const evidence = EvidenceEntry.array().parse(parseYaml(evidenceRaw));
export const about = About.parse(frontmatter(aboutRaw));
export const experiments = ExperimentsFile.parse(parseYaml(experimentsRaw)).items;
export const writing = WritingFile.parse(parseYaml(writingRaw)).items;

export const evidenceById = new Map<EvidenceId, (typeof evidence)[number]>(evidence.map((e) => [e.id, e]));
export const evidenceLabel = (id: EvidenceId) => {
  const e = evidenceById.get(id);
  if (!e) throw new Error(`Unknown evidence id ${id}`);
  return e.label;
};

export type ProjectEntry = CollectionEntry<'projects'>;
export type LabCollectionEntry = CollectionEntry<'lab'>;

/** Flagships by number, then supporting projects alphabetically (DATA_AND_CONTENT_SCHEMA mapping table). */
export async function getProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection('projects');
  const flagships = all
    .filter((p) => p.data.tier === 'flagship')
    .sort((a, b) => (a.data.number ?? '').localeCompare(b.data.number ?? ''));
  const supporting = all
    .filter((p) => p.data.tier === 'supporting')
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
  return [...flagships, ...supporting];
}

export async function getFlagships(): Promise<ProjectEntry[]> {
  return (await getProjects()).filter((p) => p.data.tier === 'flagship');
}

export async function getLab(): Promise<LabCollectionEntry[]> {
  const all = await getCollection('lab');
  return all.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export const LENSES: { id: Lens | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'product', label: 'Product' },
  { id: 'research', label: 'Research' },
  { id: 'growth', label: 'Growth' },
];

export function lensCounts(projects: ProjectEntry[]): Record<string, number> {
  const counts: Record<string, number> = { all: projects.length };
  for (const l of LENSES) if (l.id !== 'all') counts[l.id] = projects.filter((p) => p.data.lenses.includes(l.id as Lens)).length;
  return counts;
}

export const lensLabel = (id: Lens) => LENSES.find((l) => l.id === id)!.label;

/** The "Result" column of the index: first metric, or a short form when a project has none. */
export function indexResult(p: ProjectEntry): { value: string; evidence: EvidenceId | null; metric: Metric | null } {
  const m = p.data.metrics[0];
  if (m) return { value: m.value, evidence: m.evidence, metric: m };
  return { value: 'Strategy case', evidence: p.data.primary_evidence ?? null, metric: null };
}

export async function getMetric(projectSlug: string, metricId: string) {
  const projects = await getProjects();
  const p = projects.find((x) => x.data.slug === projectSlug);
  if (!p) throw new Error(`proof_strip: unknown project ${projectSlug}`);
  const m = p.data.metrics.find((x) => x.id === metricId);
  if (!m) throw new Error(`proof_strip: unknown metric ${projectSlug}#${metricId}`);
  return { project: p, metric: m };
}

/** Split rendered Markdown HTML into H2 sections (for the section rail and the instrument slot). */
export interface Section {
  id: string;
  title: string;
  html: string;
}
export function splitSections(html: string): { lead: string; sections: Section[] } {
  const parts = html.split(/(?=<h2[\s>])/);
  const lead = parts[0]?.startsWith('<h2') ? '' : (parts.shift() ?? '');
  const sections = parts.map((part) => {
    const m = part.match(/^<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/);
    const title = (m?.[2] ?? '').replace(/<[^>]+>/g, '').trim();
    const id = m?.[1] || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return { id, title, html: part.slice(m?.[0].length ?? 0) };
  });
  return { lead, sections };
}

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path: string) => `${base}${path}`;
/** Site-relative paths stored by the editor (e.g. /files/cv.pdf) get the base path; full URLs pass through. */
export const asset = (v: string) => (v.startsWith('/') ? href(v) : v);
