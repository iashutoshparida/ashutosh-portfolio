# ashutosh-portfolio

Source for Ashutosh Parida's portfolio site: AI engineering, product and evaluation work, where every number carries a label saying how it was measured.

Static site built with [Astro](https://astro.build). No trackers, no cookies, no third-party scripts.

## Run it

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
```

To build for a sub-path (GitHub Pages project site): `BASE_PATH=/ashutosh-portfolio SITE_URL=https://iashutoshparida.github.io npm run build`.

## Tests

```sh
npm run build && npm test          # content rules, banned strings, number audit (Vitest)
npx playwright test                # interactions, axe, no-JS fallbacks, reduced motion
CHROME_PATH=/usr/bin/google-chrome npx playwright test   # with a system Chrome instead of Playwright's
ALL_BROWSERS=1 npx playwright test # adds WebKit and Firefox
```

## Where things live

| Path | What |
|---|---|
| `src/content/` | All public copy: projects, lab entries, about, site identity, evidence labels. Validated by `src/lib/schemas.ts` at build time. |
| `src/data/` | Data for the three interactive figures, exported from each project's own repository. The UI shows the committed `display` strings and never re-rounds. |
| `src/instruments/` | Client code for the figures; loaded only on the page that uses them, when they come near the viewport. |
| `src/components/`, `src/pages/` | Templates. Flagship reports and supporting briefs share `src/pages/work/[slug].astro`. |
| `public/figures/` | Approved static figures from the owner's repositories. |
| `tools/make-assets.py` | Regenerates favicons and Open Graph images from the content files. |

## Editing content

Change the Markdown/YAML in `src/content/`, then `npm run build && npm test`. The tests fail if a number on the page cannot be traced to a content or data file, if a metric has no evidence label, or if a placeholder turns into a link.

Placeholders that still need the owner: email, LinkedIn URL and CV in `src/content/site.yaml`; one pending role title in `src/content/about.md`.

## Licences

No licence file has been chosen for the code yet. Fonts: Archivo and IBM Plex Mono, SIL Open Font License 1.1 (`public/fonts/`). Dataset citations are listed on the colophon page.
