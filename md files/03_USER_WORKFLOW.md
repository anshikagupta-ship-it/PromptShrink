# User Workflow and UX

## Primary User
A developer, AI engineer, or evaluator who wants to reduce the context sent to an LLM without materially degrading the answer.

## Main Demo Workflow
1. User opens the web application.
2. User selects a target LLM/model.
3. User enters:
   - task/question/instruction;
   - long context.
4. UI shows original token count.
5. User selects compression mode or target reduction.
6. User clicks **Compress & Run**.
7. Backend compresses the context.
8. UI shows the compressed context and token count.
9. The same target LLM is run on:
   - original context for baseline;
   - compressed context for comparison.
10. Results screen shows both answers and evaluation metrics.
11. User can inspect removed/reduced sections and run another test.

## Main Screen
Inputs:
- Task/question
- Long context
- Target model
- Compression mode
- Optional target token budget

Outputs:
- Original tokens
- Compressed tokens
- Compression ratio
- Original answer
- Compressed-context answer
- Retention/quality score
- Baseline latency
- Compressed latency
- Estimated/actual cost
- Cost saving

## UX Rules
- Never hide the compressed prompt; judges should be able to inspect it.
- Clearly separate measured metrics from estimates.
- Show warnings if the compressor detects high-risk loss.
- Keep the demo path short: paste -> compress -> compare.
- Provide sample contexts for a fast judge demo.

## Error States
- Empty task/context.
- Context too short to meaningfully compress.
- Target model API failure.
- Tokenizer/model mismatch.
- Compression fails retention checks.
- Rate limit or timeout.

## Success State
A successful run clearly demonstrates >70% token reduction and >=95% quality retention on the selected evaluation method.
