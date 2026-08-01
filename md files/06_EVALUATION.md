# Evaluation Plan

## Why This File Is Critical
The problem statement is metric-driven. A convincing demo must prove the compression/quality tradeoff, not just show shorter text.

## Official Metrics
1. Compression ratio.
2. Cost reduction.
3. Reasoning retention.
4. Inference latency speedup.

## Metric 1 - Compression Ratio
Use tokenizer counts, not character counts.

`compression_ratio = 1 - (compressed_tokens / original_tokens)`

Official target: >70% prompt-size reduction.

## Metric 2 - Cost Reduction
If provider pricing is known:
`input_cost = input_tokens * price_per_input_token`

Compare baseline and compressed input cost. Clearly label pricing assumptions.

## Metric 3 - Downstream Accuracy / Reasoning Retention
Official target: retain 95%+ of original downstream answer accuracy.

Because the source does not prescribe one scoring method, the team must define a defensible benchmark.

Recommended benchmark design:
- Build tasks with reference answers or deterministic expected facts.
- Run baseline with original context.
- Run compressed context with identical model/settings.
- Score both against the same reference.
- Calculate retention:
`retention = compressed_score / baseline_score`

Possible scoring:
- Exact match for deterministic QA.
- F1 for extracted facts.
- Unit tests for code tasks.
- Structured key-value correctness.
- LLM-as-judge only as a secondary metric, because it introduces evaluator variability.

## Metric 4 - Latency Speedup
Measure end-to-end and inference separately.

Record:
- compression preprocessing time;
- baseline model latency;
- compressed model latency;
- total compressed-path latency.

A compressor that saves model time but adds more preprocessing time than it saves should not claim end-to-end speedup.

## Test Categories
- Repetitive logs.
- Long chat histories.
- Verbose technical documentation/text.
- Repetitive code/configuration.
- Mixed relevant and irrelevant context.
- Adversarial cases with critical numbers/negations hidden in boilerplate.

## Experimental Controls
- Same target model.
- Same temperature and decoding parameters.
- Same task/question.
- Multiple runs if the model is nondeterministic.
- Record exact token counts and timings.

## Required Demo Table
For each case record:
- original tokens
- compressed tokens
- compression %
- baseline score
- compressed score
- retention %
- baseline cost
- compressed cost
- cost reduction %
- preprocessing latency
- baseline inference latency
- compressed inference latency
- total latency change

## Acceptance Gate
The headline demo should only claim compliance when:
- compression >70%;
- measured retention >=95%;
- cost reduction is positive;
- latency measurement is reported accurately.
