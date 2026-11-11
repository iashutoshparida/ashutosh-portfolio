---
slug: growth-agents
tier: flagship
number: "02"
title: Growth agents
subtitle: GrowthPilot · CreativeLab
question: Can an agent spend a budget carefully?
lenses: [engineering, growth]
year: 2026
role: Solo · design, implementation, evaluation
team: null
stack: [Python, LangGraph, LightGBM, XGBoost, DuckDB, scipy]
data_note: Simulated players, ad channels and ad market. No real ad spend, users or revenue.
primary_evidence: simulation
repos:
  - { label: GrowthPilot, url: "https://github.com/iashutoshparida/growthpilot" }
  - { label: CreativeLab, url: "https://github.com/iashutoshparida/creativelab" }
summary:
  question: Letting an agent move money is a trust problem. Can it reallocate a game's ad budget, and choose which ads to test, without doing anything reckless?
  approach: GrowthPilot splits a daily budget across four channels with three LangGraph agents, a pLTV model, hard guardrails and human approval for large moves. CreativeLab plans 40 ad variants, rejects policy breaks, scores them with a CTR model and tests the top 8 with a bandit.
  outcome: In simulation, GrowthPilot beat a fixed budget split on D30 ROAS by 19.3% and won all 20 runs.
metrics:
  - id: roas-lift
    label: D30 ROAS lift vs a fixed equal split
    value: "+19.3%"
    detail: 95% CI +16.2% to +22.5% · won 20 of 20 seeds
    evidence: simulation
    method: 20 simulated 30-day runs at $3,000/day across four channels, same random seed in both arms. ROAS = true 30-day revenue ÷ spend.
    source: https://github.com/iashutoshparida/growthpilot#results
  - id: pltv-error
    label: pLTV error on cohort revenue
    value: "18.6% vs 27.8%"
    detail: LightGBM vs day-3 × multiplier baseline
    evidence: simulation
    method: Trained on 200,000 simulated players, tested on a 50,000-player holdout, 750-player cohorts.
    source: https://github.com/iashutoshparida/growthpilot#results
  - id: eval-gate
    label: Eval suite that gates every change
    value: "60/60 cases"
    detail: gate at 90%
    evidence: verified
    method: Scripted cases that check guardrails, approvals and planner behaviour; CI fails below 90%.
    source: https://github.com/iashutoshparida/growthpilot
  - id: top8-ctr
    label: True CTR of CreativeLab's top 8 vs all 40 variants
    value: "+33%"
    evidence: simulation
    method: Simulated ad market with known true click-through rates, 3 games.
    source: https://github.com/iashutoshparida/creativelab#results
  - id: rank-corr
    label: Predicted vs true CTR rank correlation
    value: "0.88"
    evidence: simulation
    method: Spearman correlation across the 40 variants.
    source: https://github.com/iashutoshparida/creativelab#results
  - id: impressions
    label: Impressions to pick a winner, bandit vs uniform split
    value: "59,000 vs 88,500"
    detail: −33%
    evidence: simulation
    method: Median over 100 simulated tests; both stop when one creative has a 95% posterior chance of being best.
    source: https://github.com/iashutoshparida/creativelab#results
instrument: { id: growthpilot-agent-trace, data: data/growthpilot-trace.json, release: v1 }
build_note: Built with AI coding agents. Architecture, evaluation design and decisions are mine; every number reproduces from the repositories.
---

## Question
An agent that reallocates ad spend can lose real money quickly. I wanted to know what it takes to let one do it carefully: what it may change, how far, and when a human has to say yes.

## Stakes
For a mobile game studio, user acquisition is usually the biggest cost line. Return on ad spend and creative fatigue decide whether a game grows. Adoption depends on trust as much as on accuracy.

## System
- **Analyst** turns cohorts with three days of play into predicted 30-day revenue per channel, using a LightGBM pLTV model.
- **Planner** proposes tomorrow's split with Thompson sampling and writes a one-line rationale.
- **Critic** applies hard guardrails: a daily budget ceiling, at most ±20% change per channel per day, at least 5% per channel, and human approval for any day that moves more than 8% of the budget.
- **CreativeLab** applies the same discipline to ads: plan 40 variants, write copy, reject policy breaks, score with an XGBoost CTR model, test the top 8 with a bandit.

## Proof
The replay below steps through one recorded simulated month. On day 7 the planner tries to move most of the budget to one channel; every channel hits its ±20% cap, the critic pulls the proposal back inside the limits, and because the remaining move is still above 8% it goes to a human.

## Misses
- Simulation only: no real ad-network connectors, spend or users.
- In the simulator the human reviewer is a stub that always approves.
- CreativeLab's CTR model scores creative attributes, not the copy text itself.

## Next
Connect to one real channel in read-only mode and compare the agent's proposals with what a UA manager actually did, before letting it touch a budget.
