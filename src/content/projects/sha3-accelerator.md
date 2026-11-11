---
slug: sha3-accelerator
tier: supporting
title: SHA-3 hardware accelerator
question: Can a Keccak core plug into a small SoC over AXI4-Lite?
lenses: [engineering]
year: 2026
role: SHA-3 core RTL [ROLE DETAILS PENDING CONFIRMATION]
team: null
stack: [Verilog, AXI4-Lite, Icarus Verilog]
data_note: Verified in simulation against NIST test vectors. No FPGA board results are committed.
primary_evidence: verified
repos:
  - { label: SHA-3-Hardware-Accelerator-with-AXI4-Lite-SoC-Integration, url: "https://github.com/iashutoshparida/SHA-3-Hardware-Accelerator-with-AXI4-Lite-SoC-Integration" }
summary:
  question: Hash in hardware, driven by a processor through a standard bus.
  approach: A SHA3-256 core with an AXI4-Lite wrapper, three integration options and self-checking testbenches.
  outcome: All testbenches pass the NIST SHA3-256 vectors in simulation.
metrics:
  - id: nist
    label: NIST SHA3-256 test vectors
    value: "All pass"
    evidence: verified
    method: Self-checking Icarus Verilog testbenches compare digests with the NIST reference values.
    source: https://github.com/iashutoshparida/SHA-3-Hardware-Accelerator-with-AXI4-Lite-SoC-Integration
build_note: "The SHA-3 core RTL is my project work; credit for the integration wrappers and testbenches is pending confirmation. Resource and timing figures are not shown until synthesis reports are committed."
---
Misses: simulation only; single-block messages (up to 1088 bits) only; no committed synthesis or timing reports.
