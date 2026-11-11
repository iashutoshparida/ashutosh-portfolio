---
slug: digital-mirror
tier: flagship
number: "04"
title: Digital Mirror
subtitle: NextLeap Product Management Fellowship · graduation project
question: What if screen time felt like a mirror, not an accountant?
lenses: [product]
year: 2026
role: Solo · research, product strategy, design concept
team: null
stack: [User research, Personas, Problem framing, Metrics design, GTM]
data_note: A survey I ran (57 responses). Concept only; not built.
primary_evidence: primary-research
repos: []
documents:
  - { label: Project deck (PDF), url: "https://assets.nextleap.app/submissions/NLDIGITALMIRROR-75a5e828-196b-4ae6-8b57-91d2dd73a8a0.pdf" }
summary:
  question: Screen-time dashboards count minutes and make people feel guilty, so they switch them off. What would help instead?
  approach: A survey, two personas, two ideas rejected with evidence, and a concept that reflects why you scroll and offers a soft off-ramp instead of a block.
  outcome: A product concept with on-device privacy, a one-intervention-a-day limit and a success metric that is not "time reduced". Built on 57 survey responses.
metrics:
  - id: survey
    label: Survey responses
    value: "57"
    evidence: primary-research
    method: Survey on screen-time habits and reactions to existing digital-wellbeing tools.
    source: null
instrument: { id: digital-mirror-scrollytelling, data: null, release: v1.1 }
build_note: Product concept from the NextLeap PM Fellowship. Not implemented.
---

## Question
Phones already tell people how many hours they spent on each app. People feel judged, and they switch the feature off. What would actually help someone who wants to scroll less at night?

## Stakes
Digital wellbeing is hidden in a settings menu. A feature people trust could become a daily companion instead of a weekly scolding.

## Research
A survey with 57 responses and two personas: the late-night scroller who opens the phone for one message and loses 45 minutes, and the autopilot scroller who cannot tell useful time from empty time.

## Ideas rejected
- **Better charts.** People already ignore raw time data; more of it would not help.
- **Smarter app blocking.** People already override limits; a harder block invites a harder override.

## Concept
An on-device layer that notices rapid app-switching late at night, combined with wearable signals such as heart rate, and asks a gentle question ("Winding down?"). It offers an off-ramp (grayscale, a short breathing exercise) instead of locking the app.

## Metrics
Success is the share of prompts where someone chooses an off-ramp, plus trust ("I feel in control"). Minutes saved is deliberately not the target.

## Guardrails
All processing on the device, questions instead of diagnoses, and at most one prompt a day.

## Misses
- Concept only; not built or tested with users.
- The survey is small and self-selected.
