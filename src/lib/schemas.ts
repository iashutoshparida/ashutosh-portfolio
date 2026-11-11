// Normative schemas from handoff/DATA_AND_CONTENT_SCHEMA.md §2.
// Shared by the content collections (build-time validation) and the unit tests.
import { z } from 'astro/zod';

/** Optional field. The editor may save an untouched optional field as "" — treat that as not set. */
const opt = <T extends z.ZodType>(t: T) => z.preprocess((v) => (v === '' ? null : v), t.nullish());

export const EvidenceId = z.enum([
  'verified',
  'simulation',
  'seeded-benchmark',
  'public-data',
  'synthetic',
  'team',
  'course-research',
  'primary-research',
  'self-reported',
]);
export type EvidenceId = z.infer<typeof EvidenceId>;

export const Link = z.object({ label: z.string(), url: z.url() });
export type Link = z.infer<typeof Link>;

export const Metric = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  value: z.string(),
  detail: opt(z.string()),
  evidence: EvidenceId,
  method: z.string(),
  source: opt(z.url()),
});
export type Metric = z.infer<typeof Metric>;

export const Instrument = z.object({
  id: z.string(),
  data: opt(z.string()),
  release: z.enum(['v1', 'v1.1']),
  caption: opt(z.string()),
});

// Images added from the editor (stored under public/files, referenced as /files/...).
export const FigureFile = z.object({
  src: z.string(),
  alt: z.string(),
  caption: opt(z.string()),
  evidence: opt(EvidenceId),
});

export const Lens = z.enum(['engineering', 'product', 'research', 'growth']);
export type Lens = z.infer<typeof Lens>;

export const Project = z.object({
  slug: z.string(),
  tier: z.enum(['flagship', 'supporting']),
  number: opt(z.string()),
  title: z.string(),
  subtitle: opt(z.string()),
  question: z.string(),
  lenses: z.array(Lens).min(1),
  year: opt(z.number().int()),
  role: z.string(),
  team: opt(z.string()),
  stack: z.array(z.string()).default([]),
  data_note: z.string(),
  primary_evidence: opt(EvidenceId),
  repos: z.array(Link).default([]),
  documents: opt(z.array(Link)),
  summary: z.object({ question: z.string(), approach: z.string(), outcome: z.string() }),
  metrics: z.array(Metric).default([]),
  figures: opt(z.array(FigureFile)),
  instrument: opt(Instrument),
  build_note: z.string(),
});
export type Project = z.infer<typeof Project>;

export const LabEntry = z.object({
  slug: z.string(),
  kind: z.literal('research'),
  title: z.string(),
  question: z.string(),
  course: z.string(),
  supervisor: z.string(),
  team: opt(z.string()),
  evidence: EvidenceId,
  metrics: z.array(Metric).default([]),
  document: opt(Link),
  documents: opt(z.array(Link)),
  instrument: opt(Instrument),
});
export type LabEntry = z.infer<typeof LabEntry>;

export const Experiment = z.object({
  slug: z.string(),
  title: z.string(),
  line: z.string(),
  evidence: opt(EvidenceId),
  note: opt(z.string()),
  repo: z.url(),
});
export const ExperimentsFile = z.object({ items: z.array(Experiment).default([]) });
export const Writing = z.object({ title: z.string(), url: z.url() });
export const WritingFile = z.object({ items: z.array(Writing).default([]) });

export const ContactLink = z.object({ value: z.string().default(''), placeholder: z.boolean().default(false), display: z.string() });
export const Site = z.object({
  name: z.string(),
  statement: z.array(z.string()).length(3),
  descriptor: z.array(z.string()).length(3),
  institution_line: z.string(),
  now: z.string(),
  intro: z.string(),
  proof_strip: z.array(z.object({ project: z.string(), metric_id: z.string() })).length(3),
  nav: z.array(z.object({ label: z.string(), number: z.string(), href: z.string() })),
  contact: z.object({
    cta_heading: z.string(),
    email: ContactLink,
    linkedin: ContactLink,
    github: ContactLink,
    cv: ContactLink,
    phone: opt(ContactLink),
  }),
  footer: z.object({ build_note: z.string(), updated: z.string() }),
});
export type Site = z.infer<typeof Site>;

export const EvidenceEntry = z.object({ id: EvidenceId, label: z.string(), definition: z.string() });
export type EvidenceEntry = z.infer<typeof EvidenceEntry>;

export const About = z.object({
  bio: z.string(),
  how_i_work: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
  experience: z.array(
    z.object({
      dates: z.string(),
      role: z.string(),
      org: z.string(),
      pending: opt(z.boolean()),
      points: opt(z.array(z.string())),
      evidence: opt(EvidenceId),
    }),
  ),
  education: z.array(z.object({ dates: z.string(), degree: z.string(), org: z.string() })).default([]),
  programmes: z.array(z.object({ title: z.string(), org: z.string() })).default([]),
  leadership: z
    .array(z.object({ dates: opt(z.string()), role: z.string(), org: z.string(), note: opt(z.string()) }))
    .default([]),
  achievements: opt(z.array(z.object({ text: z.string(), href: opt(z.string()) }))),
  skills: opt(z.array(z.object({ group: z.string(), items: z.string() }))),
  off_the_clock: z.array(z.string()).default([]),
});
export type About = z.infer<typeof About>;
