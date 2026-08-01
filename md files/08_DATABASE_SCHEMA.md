# Database Schema

## Is a Database Required?
No. The official PS does not require persistence. A database is optional and should support experiment tracking, not become the center of the project.

## Minimal Recommended Schema

### runs
- `id`
- `created_at`
- `model`
- `mode`
- `task`
- `original_context` (optional; consider privacy)
- `compressed_context`
- `original_tokens`
- `compressed_tokens`
- `compression_ratio`
- `preprocess_ms`
- `baseline_latency_ms`
- `compressed_latency_ms`
- `baseline_cost`
- `compressed_cost`
- `baseline_score`
- `compressed_score`
- `retention_ratio`
- `status`

### segment_decisions (optional)
- `id`
- `run_id`
- `segment_index`
- `action` (`keep`, `remove`, `condense`, `deduplicate`)
- `importance_score`
- `original_text` (optional)
- `compressed_text` (optional)
- `reason`

## Privacy
Long prompts may contain sensitive data. For a public hackathon deployment:
- default to not persisting raw context;
- allow an explicit 'save experiment' option;
- redact secrets where feasible;
- document retention behavior.
