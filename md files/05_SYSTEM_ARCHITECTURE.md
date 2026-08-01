# System Architecture

## High-Level Architecture
```text
Web UI
  |
  v
Backend API
  |
  +--> Tokenizer / Model Profile
  |
  +--> Compression Engine
  |      +--> Parser
  |      +--> Deduplicator
  |      +--> Importance Scorer
  |      +--> Condenser
  |      +--> Budget Optimizer
  |      +--> Validator
  |
  +--> LLM Adapter
  |      +--> Baseline request
  |      +--> Compressed request
  |
  +--> Evaluation Engine
  |      +--> token metrics
  |      +--> quality/retention
  |      +--> latency
  |      +--> cost
  |
  +--> Experiment Store (optional)
```

## Architectural Principle
The compression engine must be independent of the target LLM adapter so that the product can demonstrate model-agnostic preprocessing.

## Components
### Frontend
Responsible for input, configuration, visual comparison, and metrics.

### Backend API
Coordinates runs and prevents API keys from being exposed to the browser.

### Compression Engine
Core intellectual/technical component. Should be a standalone module callable without the UI.

### Tokenizer Layer
Uses the tokenizer appropriate to the target model when available. If an exact tokenizer is unavailable, label counts as estimates.

### LLM Adapter
Uniform interface for target models. For a hackathon, supporting one provider reliably is better than several incomplete integrations.

### Evaluation Engine
Runs baseline vs compressed experiments under the same model settings.

### Persistence
Optional for the core PS. Use a lightweight database only if experiment history is useful.

## Security
- API keys stored server-side in environment variables.
- Do not log secrets.
- Cap maximum input size.
- Rate-limit public demo endpoints.
