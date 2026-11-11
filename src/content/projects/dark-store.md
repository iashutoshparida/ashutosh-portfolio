---
slug: dark-store
tier: supporting
title: Dark-store supply chain
question: For perishables, is 95% service level actually the cheapest?
lenses: [growth, product]
year: 2026
role: Solo · analysis and modelling
team: null
stack: [Python, LightGBM, pandas, scipy]
data_note: Walmart M5 sales (public data) for demand; replenishment policies evaluated in simulation.
primary_evidence: simulation
repos:
  - { label: dark-store-scm-analytics, url: "https://github.com/iashutoshparida/dark-store-scm-analytics" }
summary:
  question: How should a quick-commerce dark store reorder perishable stock?
  approach: Flag likely stockouts in the sales history, forecast demand with LightGBM, then simulate replenishment policies and map the trade-off between fill rate and waste.
  outcome: At about the same fill rate (~98%), the forecast-driven policy cut simulated waste from 10.9% to 5.8%.
metrics:
  - id: wape
    label: 1-day forecast error (WAPE), LightGBM vs seasonal naive
    value: "50.6% vs 66.7%"
    evidence: public-data
    method: Rolling backtest on M5 sales; WAPE = total absolute error ÷ total demand.
    source: https://github.com/iashutoshparida/dark-store-scm-analytics
  - id: matched-fill
    label: At matched fill rate (~98%) — waste, days of cover, contribution
    value: "10.9% → 5.8% · 2.36 → 1.66 days · +17%"
    evidence: simulation
    method: Replenishment policies simulated over the backtest period with expiry and lead-time assumptions stated in the repo.
    source: https://github.com/iashutoshparida/dark-store-scm-analytics
build_note: Built with an AI coding agent; numbers reproduce from the committed reports.
---
Misses: simulated policy outcomes on public retail data, not a real dark store; no charts committed yet.
