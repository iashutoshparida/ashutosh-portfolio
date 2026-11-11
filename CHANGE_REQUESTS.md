# Open items for the owner

Anything not confirmed renders as a visible placeholder. Nothing here is guessed.

## Decided 2026-11-11 (from the StemAI resume)
- Email, LinkedIn and phone are published (`src/content/site.yaml`).
- About now shows resume bullets for CIL Lab, Rungta, OPGC and the TA role, plus skills, the IIT Madras and Anthropic certificates, the Synchrony top-5 result and ARENA'25 figures. All carry the **SELF-REPORTED** label.
- Job titles are unchanged: CIL Lab "AI/ML Researcher"; the Rungta title stays pending.
- The four resume projects with no public repo (AR app, startup market map, Diligence Copilot, LLM cost model) stay off the site until there is a repo or demo to link.

## Still open
| # | Item | Where it shows | What is needed |
|---|---|---|---|
| 1 | CV | Hero, contact block, Contents sheet | A PDF at `public/cv/ashutosh-parida-cv.pdf`, then set `contact.cv`. |
| 2 | Rungta role title | About and Home experience | One title. Your resumes use three different ones. |
| 3 | Rungta numbers the code contradicts | About, Rungta bullets | The public MechanicSaathi code indexes one KTM manual (about 24 sections) with refusals in 10 languages and has no timing code. "504 chunks", "11 languages" and "under 4 s" are shown as you wrote them, labelled SELF-REPORTED. Consider removing them or committing the build that produced them. The RV-Vision repo can't run its 87 tests from a fresh clone because `rvvision/data/` is missing. |
| 4 | Pressure-ViT collaboration | Pressure-ViT meta "Role" | Collaborators, and whether it relates to CIL Lab. |
| 5 | SHA-3 role | SHA-3 brief | Your part, and who made the wrappers and testbenches. |
| 6 | Digital Mirror deck link | Digital Mirror build notes | The linked NextLeap PDF shows the survey percentages that D6 keeps off the site. Keep the link or remove it? |
| 7 | FirstClub teardown link | Lab · Writing | The URL is a generic `PRODUCTTEARDOWN-…pdf`. Confirm it is your FirstClub deck. |
| 8 | GitHub Pages | Deployment | Repo Settings → Pages → Source: GitHub Actions. The workflow deploys `main` to iashutoshparida.github.io/ashutosh-portfolio. |

## Deferred to v1.1 (approved scope)
Digital Mirror scrollytelling, CreativeLab grid, TestLedger explainer, viscous-fingering sketch, RAG explorer.
