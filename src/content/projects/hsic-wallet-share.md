---
slug: hsic-wallet-share
tier: supporting
title: Card share-of-wallet diagnosis
question: Why is a credit card losing share at a retail partner?
lenses: [product, growth]
year: null
role: Team member
team: "Team ASYNC: Sarvagya, Ashutosh, Amit"
stack: [Python, LightGBM, k-means, Kaplan–Meier, Bootstrap, Experiment design]
data_note: Case dataset supplied by the NextLeap programme.
primary_evidence: team
repos: []
documents:
  - { label: "Team deck (on NextLeap)", url: "https://nextleap.app/portfolio/ashutosh-parida" }
summary:
  question: The card's share of its cardholders' spend at the partner store fell sharply in a year. Who should be won back, with what, and how would we prove it?
  approach: Decompose the decline into reach and depth, trace where the spend went, segment customers, design targeted offers, and test them with 20% holdouts.
  outcome: Reach, not depth, explained most of the decline; the team recommended a 90-day pilot with holdouts.
metrics:
  - id: sow
    label: Share of wallet, year over year
    value: "28.9% → 19.5%"
    evidence: team
    method: Programme case data; share of cardholders' spend at the partner store paid with the card.
    source: null
  - id: reach-share
    label: Share of the decline explained by reach
    value: "87%"
    evidence: team
    method: Reach × depth decomposition of the change in share of wallet.
    source: null
build_note: "Team project. Credit: Sarvagya, Ashutosh and Amit (Team ASYNC)."
---
Misses: programme case data, not a real bank; response rates in the plan are planning assumptions.
