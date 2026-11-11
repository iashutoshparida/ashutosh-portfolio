// Normative schemas from handoff/DATA_AND_CONTENT_SCHEMA.md §2.
// Shared by the content collections (build-time validation) and the unit tests.
import { z } from 'astro/zod';

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
  detail: z.string().optional(),
  evidence: EvidenceId,
  method: z.string(),
  source: z.url().nullable().optional(),
});
export type Metric = z.infer<typeof Metric>;

export const Instrument = z.object({
  id: z.string(),
  data: z.string().nullable(),
  release: z.enum(['v1', 'v1.1']),
  caption: z.string().optional(),
});

export const Lens = z.enum(['engineering', 'product', 'research', 'growth']);
export type Lens = z.infer<typeof Lens>;

export const Project = z.object({
  slug: z.string(),
  tier: z.enum(['flagship', 'supporting']),
  number: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  question: z.string(),
  lenses: z.array(Lens).min(1),
  year: z.number().int().nullable(),
  role: z.string(),
  team: z.string().nullable(),
  stack: z.array(z.string()),
  data_note: z.string(),
  primary_evidence: EvidenceId.nullable(),
  repos: z.array(Link),
  documents: z.array(Link).optional(),
  summary: z.object({ question: z.string(), approach: z.string(), outcome: z.string() }),
  metrics: z.array(Metric),
  instrument: Instrument.optional(),
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
  team: z.string().nullable(),
  evidence: EvidenceId,
  metrics: z.array(Metric.extend({ source: z.url().nullable().optional() })),
  document: Link.optional(),
  documents: z.array(Link).optional(),
  instrument: Instrument.optional(),
});
export type LabEntry = z.infer<typeof LabEntry>;

export const Experiment = z.object({
  slug: z.string(),
  title: z.string(),
  line: z.string(),
  evidence: EvidenceId.nullable(),
  note: z.string().optional(),
  repo: z.url(),
});
export const Writing = z.object({ title: z.string(), url: z.url() });

export const ContactLink = z.object({ value: z.string(), placeholder: z.boolean(), display: z.string() });
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
    phone: ContactLink.optional(),
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
      pending: z.boolean().optional(),
      points: z.array(z.string()).optional(),
      evidence: EvidenceId.optional(),
    }),
  ),
  education: z.array(z.object({ dates: z.string(), degree: z.string(), org: z.string() })),
  programmes: z.array(z.object({ title: z.string(), org: z.string() })),
  leadership: z.array(
    z.object({ dates: z.string().nullable(), role: z.string(), org: z.string(), note: z.string().optional() }),
  ),
  achievements: z.array(z.object({ text: z.string(), href: z.string().optional() })).optional(),
  skills: z.array(z.object({ group: z.string(), items: z.string() })).optional(),
  off_the_clock: z.array(z.string()),
});
export type About = z.infer<typeof About>;
