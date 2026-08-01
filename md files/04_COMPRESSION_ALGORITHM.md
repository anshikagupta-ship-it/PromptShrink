# Compression Algorithm Specification

## Objective
Minimize input tokens while preserving the information required to produce substantially the same downstream answer.

## Important Constraint
The official problem statement specifies an **algorithmic token pre-processor**. Therefore the architecture should contain explicit preprocessing logic and measurable stages. A pure 'send the prompt to another LLM and ask it to summarize' implementation is a weak interpretation because it hides the compression mechanism and can add cost/latency.

## Inputs
- `task`: current user instruction/question.
- `context`: long text/context window.
- `model_profile`: tokenizer/context limits/pricing metadata.
- `mode`: conservative/balanced/aggressive.
- `target_ratio` or `token_budget`.

## Output
- `compressed_context`
- original/compressed token counts
- segment decisions
- warnings
- compression statistics

## Stage 1 - Parsing and Segmentation
Segment by semantic/structural boundaries:
- paragraphs
- headings
- code functions/classes
- log events
- chat turns
- JSON/YAML blocks

Avoid arbitrary fixed-size chopping when structure is available.

## Stage 2 - Lossless Cleanup
Remove or normalize:
- duplicate whitespace
- repeated separators
- duplicated headers/footers
- repeated log prefixes where reconstructable
- exact duplicate blocks
- redundant markup

This stage should be deterministic.

## Stage 3 - Near-Duplicate Detection
Represent segments using lightweight lexical fingerprints and/or embeddings.

Possible signals:
- normalized token shingles
- MinHash/SimHash
- cosine similarity over embeddings

If multiple segments carry the same fact, retain one canonical segment plus any unique differences.

## Stage 4 - Information Protection
Mark high-risk tokens/spans as protected:
- numbers and units
- dates/times
- names/IDs
- negation (`not`, `never`, etc.)
- requirements and constraints
- exceptions
- definitions
- code signatures
- error messages
- causal/conditional words
- user-provided examples that define expected behavior

Protected spans receive a high retention weight.

## Stage 5 - Task Relevance
Score each segment against the user's task.

Example conceptual score:
`importance = relevance + uniqueness + constraint_weight + entity_weight + dependency_weight`

Low-relevance, low-uniqueness content is the first candidate for removal.

## Stage 6 - Semantic Condensation
For content that cannot be removed but is verbose:
- convert prose to compact facts;
- merge repeated statements;
- shorten verbose descriptions;
- retain relationships and qualifiers.

Example:
`The service attempted the request five times. Each attempt returned HTTP 429 because the rate limit was exceeded.`
may become:
`5 attempts -> HTTP 429 (rate limit exceeded).`

## Stage 7 - Budget Optimization
Rank removable/compressible segments by expected token saving divided by information-risk.

Continue until:
- target compression is achieved; or
- no safe compression actions remain.

Do not blindly force 70% on every input. For the hackathon evaluation dataset, select/construct long redundant contexts where the official >70% target is realistically measurable. Report failures rather than silently deleting critical content.

## Stage 8 - Validation
Perform lightweight checks:
- protected entities/numbers still present;
- constraints preserved;
- no inverted negation;
- key task-relevant concepts retained.

Optional semantic similarity checks can compare original and compressed representations.

## Pseudocode
```text
compress(task, context, target):
    segments = parse(context)
    segments = lossless_cleanup(segments)
    groups = find_duplicates_and_near_duplicates(segments)
    segments = deduplicate(groups)
    protected = detect_critical_information(segments)
    scores = score_relevance_and_uniqueness(task, segments, protected)
    actions = propose_remove_or_condense_actions(segments, scores)
    compressed = optimize_under_token_budget(actions, target)
    validation = validate_critical_information(context, compressed, protected)
    return compressed, metrics, validation
```

## Algorithm Ablations
Measure the contribution of:
- cleanup only;
- + deduplication;
- + task relevance;
- + semantic condensation;
- full pipeline.

This makes the technical contribution easier to defend to judges.
