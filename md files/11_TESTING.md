# Testing Strategy

## Unit Tests
### Cleanup
- whitespace normalization
- duplicate headers
- repeated separators
- exact duplicate blocks

### Critical Information Protection
Verify retention of:
- numbers
- dates
- IDs
- negations
- requirements
- exceptions
- code signatures

### Token Budget
- output remains under requested budget when feasible.
- algorithm stops safely when further compression would violate protected content.

## Integration Tests
- `/compress` returns valid metrics.
- `/compare` uses the same target model/settings for both paths.
- tokenizer failures handled.
- provider timeout handled.
- database optional path handled.

## Regression Tests
Maintain fixed benchmark cases and fail CI if:
- average compression drops below target;
- retention drops below threshold;
- protected facts disappear.

## Adversarial Tests
- Repeated text with one changed number.
- Same sentence where one copy contains `not`.
- Long logs where only one error line matters.
- Code with repeated functions but one changed condition.
- Context containing prompt-injection-like text; compressor should treat it as context, not as its own instruction.

## Performance Tests
Measure preprocessing time across increasing input lengths.

## Demo Test Gate
Before submission:
- deployed URL works;
- sample cases load;
- model key configured;
- metrics calculate correctly;
- at least one >70% / >=95% case is reproducible;
- failure cases are honestly labeled.
