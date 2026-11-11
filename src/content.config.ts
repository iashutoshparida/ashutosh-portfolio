import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { Project, LabEntry } from './lib/schemas';

// Markdown collections. The build fails on any schema violation.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: Project,
});

const lab = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/lab' }),
  schema: LabEntry,
});

export const collections = { projects, lab };
