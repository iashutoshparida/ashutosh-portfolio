---
slug: vqe
kind: research
title: Variational quantum eigensolvers, two semesters
question: Can a VQE find ground states of a topological lattice model, and then locate exceptional points in its non-Hermitian version?
course: "INSTR F376/F377 Design Project (Dec 2025) and INSTR F367 Laboratory Project (Apr 2026), BITS Pilani Hyderabad"
supervisor: "Prof. Nitish Kumar Gupta"
team: "Semester 1 within Team Beta, with Prahlad M. V.; the symmetry-adapted ansatz came out of our joint work."
evidence: course-research
metrics:
  - id: ground-state
    label: Ground-state energy error, 8-site SSH chain on 8 qubits
    value: "0.03%"
    evidence: course-research
    method: Symmetry-adapted Givens-rotation ansatz, compared with exact diagonalisation; statevector simulation.
  - id: ep
    label: Exceptional point, non-Hermitian SSH chain
    value: "Found at γ = 0.5"
    detail: matches the analytic value; relative error < 0.62% vs exact diagonalisation
    evidence: course-research
    method: Energy-variance cost on a 4-site chain; statevector simulation.
documents:
  - { label: Semester 1 report (PDF), url: "https://drive.google.com/file/d/1m1R9bjk2Q5lWuIHhxY1qCTVg9oCE10sW/view" }
  - { label: Semester 2 report (PDF), url: "https://drive.google.com/file/d/11LDip57KpLpUQx9aignIqakJ830Oq58Q/view" }
---
The lesson carried from semester 1: a hardware-efficient circuit plateaued at large error regardless of depth, while an 8-parameter circuit that respected the model's symmetry was within 0.03%. The right structure beat more layers. Limits: small systems, exact statevector simulation, no quantum hardware runs.
