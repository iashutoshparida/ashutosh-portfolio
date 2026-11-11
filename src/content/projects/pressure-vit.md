---
slug: pressure-vit
tier: flagship
number: "03"
title: Pressure-ViT
subtitle: Reading sleeping position from a pressure mat
question: How much would a leaky split have lied?
lenses: [research, engineering]
year: 2026
role: Model and evaluation [COLLABORATION DETAILS PENDING CONFIRMATION]
team: null
stack: [PyTorch, scikit-learn, matplotlib]
data_note: PhysioNet in-bed pressure maps (public), 13 held-out subjects, 17 positions.
primary_evidence: public-data
repos:
  - { label: pressure-vit, url: "https://github.com/iashutoshparida/pressure-vit" }
summary:
  question: Can a small transformer read sleeping position from a bed's pressure map, for people it has never seen?
  approach: A vision transformer written from scratch (141,457 parameters), tested by leaving whole people out, with bootstrap confidence intervals.
  outcome: 90.7% on 17 positions for unseen people. A careless random split would have reported 98.3%.
metrics:
  - id: loso-accuracy
    label: 17-position accuracy on people the model never saw
    value: "90.7%"
    detail: 95% CI 87.2–94.0 · macro-F1 0.906
    evidence: public-data
    method: Leave-one-subject-out over 13 people; confidence interval from a person-level bootstrap.
    source: https://github.com/iashutoshparida/pressure-vit/blob/main/results/results.json
  - id: leak-inflation
    label: Inflation from a leaky random-frame split
    value: "+7.6 pts"
    detail: 98.3% vs 90.7%
    evidence: public-data
    method: Same model and training; frames shuffled across people instead of holding people out.
    source: https://github.com/iashutoshparida/pressure-vit/blob/main/results/results.json
  - id: posture-accuracy
    label: 3-posture accuracy, unseen people
    value: "95.6%"
    evidence: public-data
    method: Leave-one-subject-out, 3 classes (supine, left, right).
    source: https://github.com/iashutoshparida/pressure-vit/blob/main/results/results.json
  - id: params
    label: Model size
    value: "141,457 parameters"
    evidence: verified
    method: Parameter count recomputed from the model definition.
    source: https://github.com/iashutoshparida/pressure-vit
instrument: { id: pressure-vit-leakage-toggle, data: data/pressure-vit-leakage.json, release: v1 }
build_note: Built with an AI coding agent. Every reported number reproduces from the committed results file; 9 tests pass.
---

## Question
A pressure mat under a mattress could tell a carer whether someone has turned, without a camera. The question is not whether a model can learn this, but whether it still works for a body it has never seen.

## Stakes
Health-adjacent models fail in deployment when evaluation leaks. A score measured on frames from people the model already knows tells you almost nothing about a new patient.

## System
Pressure map → patch embedding with positional information → transformer encoder → 17 positions. A CNN and a logistic regression serve as baselines; attention rollout shows where the model looks.

## Proof
Switch the split strategy below. Shuffling frames lets the same person appear in training and test, so the model partly learns to recognise people rather than positions. Holding whole people out gives the honest number.

## Misses
- One public dataset, 13 subjects.
- No clinical validation; results are on position labels, not sleep outcomes.

## Next
Test on a second pressure-mat dataset with different hardware before claiming the model transfers.
