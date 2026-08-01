# Ultra-Low Resource LLM Context Compression Engine

## What It Does
A preprocessing layer that reduces redundant LLM context before inference while attempting to preserve downstream answer quality.

## Official Targets
- >70% prompt/context reduction.
- 95%+ downstream answer-accuracy retention.
- Demonstrable cost reduction.
- Demonstrable reasoning retention.
- Measured inference-latency impact.

## Architecture
`User -> Compressor -> Target LLM -> Response + Metrics`

## Core Features
- Structural cleanup.
- Duplicate/near-duplicate removal.
- Task-aware relevance.
- Critical-information protection.
- Semantic condensation.
- Token-budget optimization.
- Baseline vs compressed comparison.
- Benchmark dashboard.

## Quick Demo
1. Select a sample.
2. Enter a task.
3. Click `Compress & Compare`.
4. Inspect compressed context.
5. Compare baseline and compressed answers.
6. Review token, cost, quality, and latency metrics.

## Documentation
Read in this order:
1. `01_PROBLEM_STATEMENT.md`
2. `02_SOLUTION.md`
3. `03_USER_WORKFLOW.md`
4. `04_COMPRESSION_ALGORITHM.md`
5. `05_SYSTEM_ARCHITECTURE.md`
6. `06_EVALUATION.md`
7. `07_API_SPEC.md`
8. `08_DATABASE_SCHEMA.md`
9. `09_FRONTEND_SPEC.md`
10. `10_BACKEND_SPEC.md`
11. `11_TESTING.md`
12. `12_DEPLOYMENT.md`

## Important Scope Note
Document ingestion/RAG is not an official requirement of Gen AI PS-2. The core deliverable is the context compression engine.
