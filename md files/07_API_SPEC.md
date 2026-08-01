# API Specification

## POST /api/compress
Compress context without calling the target LLM.

Request:
```json
{
  "task": "Find the root cause of the incident.",
  "context": "...long context...",
  "mode": "balanced",
  "target_ratio": 0.70,
  "model": "configured-model"
}
```

Response:
```json
{
  "compressed_context": "...",
  "original_tokens": 10000,
  "compressed_tokens": 2800,
  "compression_ratio": 0.72,
  "warnings": [],
  "processing_ms": 180
}
```

## POST /api/compare
Run baseline and compressed paths.

Request contains task, context, model, and compression settings.

Response:
- compression result;
- baseline answer;
- compressed answer;
- token counts;
- timings;
- cost metrics;
- quality/retention score if reference answer is supplied.

## POST /api/evaluate
Evaluate a stored or submitted benchmark case.

Optional fields:
- reference answer
- expected facts
- scoring method

## GET /api/runs/:id
Optional. Retrieve experiment history if persistence is implemented.

## Error Contract
Use structured errors:
```json
{
  "error": {
    "code": "MODEL_TIMEOUT",
    "message": "Target model request timed out."
  }
}
```

## API Rules
- Never accept provider API secrets from normal browser payloads in production/demo deployment.
- Validate input size.
- Return whether token/cost values are measured or estimated.
