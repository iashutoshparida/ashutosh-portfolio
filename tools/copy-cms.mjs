// Copies the Sveltia CMS bundle from node_modules into public/admin/cms/ so the editor is self-hosted
// (no third-party CDN on a page that holds your GitHub token). Runs before dev and build.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules/@sveltia/cms/dist');
const out = join(root, 'public/admin/cms');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'chunks'), { recursive: true });
cpSync(join(src, 'sveltia-cms.js'), join(out, 'sveltia-cms.js'));
for (const f of readdirSync(join(src, 'chunks'))) {
  if (!f.endsWith('.map')) cpSync(join(src, 'chunks', f), join(out, 'chunks', f), { recursive: true });
}
console.log('editor bundle copied to public/admin/cms');
