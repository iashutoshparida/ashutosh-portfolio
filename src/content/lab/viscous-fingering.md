---
slug: viscous-fingering
kind: research
title: Reading fluid physics from a photograph
question: Given a photo of a viscous-fingering pattern, can a model infer the flow conditions and map them onto the Ising model?
course: "PHY F376 Physics Design Oriented Project, BITS Pilani Hyderabad · April 2026"
supervisor: "Prof. Swastik Bhattacharya"
team: null
evidence: course-research
metrics:
  - id: regime-cv
    label: Flow-regime classifier, 5-fold cross-validation
    value: "87.4% ± 3.1%"
    evidence: course-research
    method: Random Forest on 28 morphological features; trained on patterns from a pore-network simulator (simulated data).
  - id: param-r2
    label: Recovering capillary number and viscosity ratio
    value: "R² > 0.89"
    evidence: course-research
    method: Gradient Boosting regressors on the same simulated patterns.
  - id: photo-fit
    label: Fitted values for the one experimental photograph
    value: "Ca = 2.31 × 10⁻⁴, M = 2.63 × 10⁻²"
    detail: capillary fingering, 67.2% confidence
    evidence: course-research
    method: Pipeline applied to one experimental Hele-Shaw cell photograph.
document: { label: Project report (PDF), url: "https://drive.google.com/file/d/1xsV46RjhfVFeqWelx3rd_mc3qAr7GyK_/view" }
instrument: { id: fingering-sketch, data: null, release: v1.1, caption: "Illustrative approximation, not the simulator used in the report." }
---
Image segmentation and 28 shape features (fractal dimension, skeleton, Fourier modes) feed a regime classifier and parameter regressors trained on simulated patterns. The inferred parameters are mapped onto an effective inverse temperature (β_eff) and reduced temperature (T/Tc) in the 2D Ising model. Limits: simulated training data, and validation on a single experimental photograph.
