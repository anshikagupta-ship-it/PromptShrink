# Backend Specification

## Responsibilities
- Validate requests.
- Tokenize input.
- Execute compression pipeline.
- Call target LLM.
- Run baseline/compressed comparison.
- Calculate metrics.
- Optionally persist experiment results.

## Modules
```text
backend/
  api/
  compression/
    parser
    cleanup
    dedupe
    importance
    condenser
    optimizer
    validator
  llm/
    adapter
    pricing
    tokenizer
  evaluation/
    scoring
    latency
    reports
  storage/
```

## Run Lifecycle
1. Validate input.
2. Count original tokens.
3. Compress.
4. Count compressed tokens.
5. Validate preservation.
6. If compare mode:
   - call target model with original;
   - call same model with compressed;
   - score outputs.
7. Calculate cost/latency metrics.
8. Return complete result.

## Determinism
Where possible, deterministic preprocessing should be preferred because it makes evaluation reproducible. If an LLM is used inside compression, record its model, settings, tokens, latency, and cost separately.

## Observability
Log:
- stage timings;
- token counts;
- compression actions;
- model failures;
- validation warnings.

Do not log secrets or sensitive raw prompts by default.
