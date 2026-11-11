# ashutosh-portfolio

Source for Ashutosh Parida's portfolio site: AI engineering, product and evaluation work, where every number carries a label saying how it was measured.

Static site built with [Astro](https://astro.build). No trackers, no cookies, no third-party scripts.

## Edit the site (no code)

Open **https://iashutoshparida.github.io/ashutosh-portfolio/admin/**. Visitors only ever see the public site, and only accounts with write access to this repository can save.

1. **First time on a device:** click **Sign In Using Access Token**. The dialog links to GitHub's token page with the right permission pre-selected. Choose *Only select repositories → ashutosh-portfolio*, keep **Contents: Read and write**, pick an expiry (for example one year) and generate. Paste the token into the dialog. It is stored in that browser only; never share it.
2. **Edit:** *Projects* (add, edit or delete case studies), *Lab research*, and *Profile & pages* (homepage text, contact details and CV, About page, Lab experiments and writing). Upload images and your CV PDF in the editor.
3. **Save.** Each save is a commit to `main`. GitHub Actions checks the content and republishes the site in about two minutes.
4. **If a change doesn't appear,** open the repo's **Actions** tab. A red run means a check failed and the live site kept its last good version. The log says why: for example a number in a project summary that isn't in its Results, a full report numbered out of sequence, or one of the withheld Digital Mirror percentages.

Rules the checks enforce: every result needs an evidence label; full reports are numbered 01, 02… with no gaps; short briefs have no number; a project's page address must match its file name.

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
| `tools/make-assets.py` | Regenerates favicons and Open Graph images from the content files. New projects use the default share image until it is re-run. |
| `public/admin/` | The editor (Sveltia CMS, self-hosted from npm by `tools/copy-cms.mjs`) and its field definitions in `config.yml`. |
| `public/files/` | Images and files uploaded from the editor. |

## Editing content

Use the editor (above), or change the Markdown/YAML in `src/content/` directly, then `npm run build && npm test`. The tests fail if a number on the page cannot be traced to a content or data file, if a metric has no evidence label, or if a placeholder turns into a link.

Open owner items are listed in `CHANGE_REQUESTS.md`.

## Licences

No licence file has been chosen for the code yet. Fonts: Archivo and IBM Plex Mono, SIL Open Font License 1.1 (`public/fonts/`). Dataset citations are listed on the colophon page.
