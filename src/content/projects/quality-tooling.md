---
slug: quality-tooling
tier: flagship
number: "01"
title: Quality tooling
subtitle: CodePilot · PR Risk Analyzer · TestLedger
question: Would your tests notice if I broke this?
lenses: [engineering]
year: 2026
role: Solo · design, implementation, evaluation
team: null
stack: [Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL, networkx, hypothesis, Docker, GitHub Actions]
data_note: Evaluated on a sample app, scenario set and simulated CI histories that I built for the purpose.
primary_evidence: seeded-benchmark
repos:
  - { label: CodePilot, url: "https://github.com/iashutoshparida/codepilot" }
  - { label: PR Risk Analyzer, url: "https://github.com/iashutoshparida/pr-risk-analyzer" }
  - { label: TestLedger, url: "https://github.com/iashutoshparida/Testledger" }
summary:
  question: Coverage says which lines ran, not whether tests would catch a bug. How do you know your tests protect the code?
  approach: Three tools around a developer's day. CodePilot finds unprotected code and generates gated tests; PR Risk Analyzer points reviewers at risky changes; TestLedger separates real regressions from flaky tests.
  outcome: On my sample app, CodePilot raised mutation score from 7.8% to 87.8% and caught 10 of 12 planted bugs.
metrics:
  - id: mutation-score
    label: Mutation score, before → after generated tests
    value: "7.8% → 87.8%"
    detail: 90 mutants
    evidence: seeded-benchmark
    method: CodePilot mutates the sample app 90 ways and runs the tests against each mutant. A mutant is "killed" if a test fails. Score = killed ÷ total.
    source: https://github.com/iashutoshparida/codepilot/blob/main/docs/EVALUATION.md
  - id: bugs-caught
    label: Planted bugs caught
    value: "0/12 → 10/12"
    evidence: seeded-benchmark
    method: Twelve realistic bugs were injected one at a time; a bug counts as caught if any test fails.
    source: https://github.com/iashutoshparida/codepilot/blob/main/docs/EVALUATION.md
  - id: coverage
    label: Line / branch coverage
    value: "33.9% → 95.8% / 3.9% → 85.0%"
    evidence: seeded-benchmark
    method: coverage.py on the sample app, before and after generated tests.
    source: https://github.com/iashutoshparida/codepilot/blob/main/docs/EVALUATION.md
  - id: flaky-precision
    label: TestLedger flaky-test precision vs a naive rule
    value: "1.000 vs 0.554"
    detail: recall 0.975
    evidence: simulation
    method: Scored on simulated CI histories with known ground truth (which tests are flaky, which failures are real regressions).
    source: https://github.com/iashutoshparida/Testledger/blob/main/docs/EVALUATION.md
  - id: regressions-quarantined
    label: Real regressions wrongly quarantined
    value: "0 of 160"
    detail: naive rule 160 of 160
    evidence: simulation
    method: Same simulated CI histories; a real regression must never be hidden as "flaky".
    source: https://github.com/iashutoshparida/Testledger/blob/main/docs/EVALUATION.md
  - id: pr-risk-benchmark
    label: PR Risk Analyzer, expected rule fired / benign false alarms / ranking AUC
    value: "12/12 · 0/12 · 1.000"
    evidence: seeded-benchmark
    method: 24 labelled pull-request scenarios that I wrote (12 risky, 12 benign), each applied as a real git branch. "Expected rule fired" means the rule written for that risk triggered; it does not mean every risky PR was rated high.
    source: https://github.com/iashutoshparida/pr-risk-analyzer/blob/main/docs/EVALUATION.md
  - id: own-tests
    label: The tools' own test suites
    value: "144 · 101 · 82 tests"
    detail: 92% · 96% · 98% line+branch coverage
    evidence: verified
    method: pytest with coverage, run on each repository.
    source: https://github.com/iashutoshparida/codepilot
instrument: { id: codepilot-mutation-strip, data: data/codepilot-mutation.json, release: v1 }
build_note: Built with AI coding agents. Architecture, evaluation design and decisions are mine; every number reproduces from the repositories.
---

## Question
Coverage tells you which lines ran. It does not tell you whether a test would fail if the code were wrong. I wanted three sharper answers: are tests protecting this code, where should a reviewer look first, and is that red build a real regression or a flaky test?

## Stakes
Reviewer attention and trust in CI are scarce. When teams stop trusting a red build, real regressions slip through; when reviewers read every line with equal care, risky changes get the same attention as typo fixes.

## System
- **CodePilot** parses the code, builds call graphs, finds functions no test protects, and generates tests. Generated tests are kept only if they are safe, pass against the unmodified code and are stable across repeated runs. An LLM is optional and always verified, never trusted.
- **PR Risk Analyzer** scores a pull request with 18 explainable rules (unsafe calls, signature changes with callers, deep nesting and more) and is packaged as a GitHub Action that posts one reviewer comment (not yet run live on a real repository).
- **TestLedger** stores every test result from CI over time, scores flakiness from flip patterns, and quarantines flaky tests automatically while keeping real regressions visible.

## Proof
Mutation testing is the honest version of coverage: change the code on purpose and see whether the tests notice. The instrument below shows all 90 mutants of the sample app, before and after CodePilot's tests.

## Misses
- Evaluated on a sample app, scenario set and simulated CI histories that I built, not on external codebases.
- Python only. The sandbox is process isolation, not a security boundary.
- PR Risk Analyzer rated only 6 of the 12 risky scenarios as high or critical, even though the expected rule fired every time.

## Next
Run all three on a real open-source repository with a long CI history, and compare TestLedger's quarantine decisions with what maintainers actually did.
