# ContextZero — Backend API Endpoint Specification

This document defines the REST API endpoints required by the **ContextZero** frontend to connect seamlessly with the backend compression engine and LLM pipeline.

---

## 🌐 Base URL Configuration
- **Development**: `http://localhost:8000/api/v1` (or `http://localhost:5000/api/v1`)
- **Production**: `https://api.contextzero.ai/api/v1`

---

## 🔒 Headers
All API requests sent by the frontend include standard JSON headers:
```http
Content-Type: application/json
Accept: application/json
```

---

## 📡 Endpoints Summary

| Method | Endpoint | Description | Status |
| ------ | -------- | ----------- | ------ |
| `POST` | `/api/v1/compress` | Primary compression & LLM response execution | **P0 (Required)** |
| `POST` | `/api/v1/tokenize` | Real-time prompt token estimation | **P0 (Required)** |
| `GET`  | `/api/v1/benchmarks` | Fetch evaluation dataset benchmark results | **P1** |
| `GET`  | `/api/v1/analytics` | Fetch telemetry analytics & KPI metrics | **P2** |
| `GET`  | `/api/v1/presets` | Fetch onboarding preset prompt samples | **P2** |

---

## 📖 Endpoint Details

### 1. `POST /api/v1/compress`
**Description**: Primary endpoint. Takes raw prompt context, runs the ContextZero pre-processor engine, reduces tokens by 70%+, and forwards the compressed prompt to the selected LLM (`GPT-4o`, `Claude 3.5 Sonnet`, `Llama 3 70B`).

#### Request Payload
```json
{
  "prompt": "Analyze these server logs:\n[2026-08-01 10:14:07] ERROR [payment-gateway] HTTP 429 Too Many Requests...",
  "model": "gpt-4o",
  "mode": "balanced",
  "targetRatio": 70
}
```

#### Request Fields
- `prompt` (*string, required*): The raw input text/context to compress.
- `model` (*string, optional*): Target LLM identifier (`"gpt-4o"`, `"claude-3-5-sonnet"`, `"llama-3-70b"`). Default: `"gpt-4o"`.
- `mode` (*string, optional*): Compression mode (`"conservative"`, `"balanced"`, `"aggressive"`). Default: `"balanced"`.
- `targetRatio` (*number, optional*): Target reduction percentage (`50`, `70`, `85`). Default: `70`.

#### Response Payload (200 OK)
```json
{
  "status": "SUCCESS",
  "originalTokens": 1240,
  "compressedTokens": 340,
  "tokensSaved": 900,
  "reductionRatio": 72.6,
  "accuracyRetention": 98.2,
  "costSavedEst": "0.0180",
  "compressedPrompt": "[COMPRESSED CONTEXT - 72.6% Reduction]\n...",
  "generatedAnswer": "### Analysis & Solution\n1. Root Cause Identified...",
  "baselineAnswer": "Full uncompressed answer for comparison...",
  "protectedEntities": [
    "Intent & User Instruction",
    "Constraints & Negations",
    "Entities, IDs & Error Codes",
    "Format Requirements"
  ],
  "latencyMs": {
    "baseline": 3800,
    "compressedInference": 1100,
    "preprocessing": 140,
    "totalCompressedPath": 1240,
    "speedupFactor": "3.1x"
  }
}
```

---

### 2. `POST /api/v1/tokenize`
**Description**: Utility endpoint to calculate exact token count for input text before sending.

#### Request Payload
```json
{
  "text": "Analyze these server logs..."
}
```

#### Response Payload (200 OK)
```json
{
  "tokenCount": 1240
}
```

---

### 3. `GET /api/v1/benchmarks`
**Description**: Fetches benchmark dataset evaluation results for the Benchmarks Suite page.

#### Response Payload (200 OK)
```json
{
  "benchmarks": [
    {
      "id": "incident-logs",
      "datasetName": "Server Incident Logs",
      "originalTokens": 4820,
      "compressedTokens": 1310,
      "reductionRatio": 72.8,
      "accuracyRetention": 98.1,
      "status": "PASSED"
    },
    {
      "id": "support-history",
      "datasetName": "Support Conversation History",
      "originalTokens": 3240,
      "compressedTokens": 870,
      "reductionRatio": 73.1,
      "accuracyRetention": 97.8,
      "status": "PASSED"
    },
    {
      "id": "api-docs",
      "datasetName": "Microservices API Docs",
      "originalTokens": 7810,
      "compressedTokens": 2020,
      "reductionRatio": 74.1,
      "accuracyRetention": 97.4,
      "status": "PASSED"
    }
  ]
}
```

---

### 4. `GET /api/v1/analytics`
**Description**: Fetches aggregated telemetry statistics for the Analytics page.

#### Response Payload (200 OK)
```json
{
  "totalProcessedTokens": 148290,
  "totalTokensSaved": 108400,
  "averageReductionRatio": 73.1,
  "averageRetentionScore": 97.8,
  "totalCostSavedUSD": 2.16,
  "totalRequests": 142
}
```

---

### 5. `GET /api/v1/presets`
**Description**: Returns preset onboarding samples for empty-state suggestion cards.

#### Response Payload (200 OK)
```json
{
  "presets": [
    {
      "id": "incident-logs",
      "title": "Analyze server logs",
      "desc": "HTTP 429 & DB spike logs",
      "sampleText": "..."
    },
    {
      "id": "support-history",
      "title": "Summarize support history",
      "desc": "Multi-turn chat history",
      "sampleText": "..."
    },
    {
      "id": "api-docs",
      "title": "Compress API documentation",
      "desc": "Verbose microservices spec",
      "sampleText": "..."
    }
  ]
}
```

---

## 💻 Frontend Service Code (`frontend/src/services/api.js`)

To connect the frontend to a real backend server, update `processCompression` in `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function processCompression({ prompt, model = "gpt-4o", mode = "balanced", targetRatio = 70 }) {
  try {
    const response = await fetch(`${API_BASE_URL}/compress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, mode, targetRatio }),
    });

    if (!response.ok) {
      throw new Error(`Compression API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to connect to backend, falling back to local simulation:", error);
    // Local fallback mock logic...
  }
}
```
