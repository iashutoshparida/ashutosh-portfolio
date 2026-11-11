---
slug: credit-risk
tier: supporting
title: Credit-risk PD scorecard
question: Does the model still hold up next year, and under stress?
lenses: [engineering]
year: 2026
role: Solo · modelling and validation
team: null
stack: [Python, scikit-learn, SQLite, reportlab]
data_note: Synthetic loan data generated for the project; dollar figures are illustrative.
primary_evidence: synthetic
repos:
  - { label: credit-risk-pd-scorecard, url: "https://github.com/iashutoshparida/credit-risk-pd-scorecard" }
summary:
  question: Build a probability-of-default model the way a model-risk team would review it.
  approach: Champion and challenger models, out-of-time testing, calibration, a points scorecard, stress scenarios and a validation report.
  outcome: The champion held up out of time; stress scenarios more than doubled expected loss.
metrics:
  - id: oot-auc
    label: Out-of-time AUC, champion vs challenger
    value: "0.763 vs 0.697"
    evidence: synthetic
    method: Trained on earlier years, tested on 2025 synthetic loans.
    source: https://github.com/iashutoshparida/credit-risk-pd-scorecard
  - id: ecl
    label: Expected credit loss, baseline → severe stress
    value: "$1.28M → $2.94M"
    evidence: synthetic
    method: Illustrative stress scenarios on synthetic balances; not a real portfolio.
    source: https://github.com/iashutoshparida/credit-risk-pd-scorecard
build_note: Built with an AI coding agent; the full pipeline reruns byte-for-byte.
---
Misses: synthetic data only; no deployment or monitoring.
