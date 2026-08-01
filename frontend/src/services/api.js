// API Service for PromptShrink Engine

export const PRESET_SAMPLES = [
  {
    id: "incident-logs",
    title: "Server Incident Logs",
    description: "Multi-service HTTP 429 rate-limit & DB connection spike logs",
    task: "Identify the root cause of the incident and list failing services.",
    context: `[2026-08-01 10:14:01] INFO [auth-service] Health check OK. Response time 12ms.
[2026-08-01 10:14:02] INFO [auth-service] User session validated for user_id=98214.
[2026-08-01 10:14:05] WARN [payment-gateway] Connection pool at 85% capacity. Retrying connection...
[2026-08-01 10:14:06] WARN [payment-gateway] Connection pool at 92% capacity. Retrying connection...
[2026-08-01 10:14:07] ERROR [payment-gateway] HTTP 429 Too Many Requests from upstream stripe-api endpoint /v1/charges.
[2026-08-01 10:14:07] ERROR [payment-gateway] Retry attempt 1 failed with status 429.
[2026-08-01 10:14:08] ERROR [payment-gateway] Retry attempt 2 failed with status 429.
[2026-08-01 10:14:09] ERROR [payment-gateway] Retry attempt 3 failed with status 429. Rate limit threshold exceeded.
[2026-08-01 10:14:10] CRITICAL [order-processor] DB Connection spike detected! Active connections: 450/500.
[2026-08-01 10:14:11] CRITICAL [order-processor] Queue backlog reached 12,500 items due to payment-gateway failure.
[2026-08-01 10:14:12] INFO [notification-service] Sending alert to DevOps PagerDuty channel #alerts-p1.
[2026-08-01 10:14:15] INFO [auth-service] Health check OK. Response time 15ms.
[2026-08-01 10:14:20] INFO [auth-service] User session validated for user_id=98215.`,
    originalTokens: 1240,
    compressedTokens: 340,
    reductionRatio: 72.6,
  },
  {
    id: "support-chat",
    title: "Customer Support History",
    description: "Long multi-turn conversation with redundant pleasantries and repeated questions",
    task: "Summarize the customer issue, resolution status, and action items.",
    context: `Customer (10:00 AM): Hello, is anyone available to help me today? Hope you're having a good morning!
Agent (10:01 AM): Hello! Thanks for reaching out to CloudSupport. My name is Alex. How can I assist you today?
Customer (10:02 AM): Hi Alex! I am trying to upgrade my database tier from Standard to Enterprise, but whenever I click the upgrade button on subscription plan #941, the page reloads without saving.
Agent (10:03 AM): I understand how frustrating that can be! Let me look into subscription plan #941 for you right away. Could you confirm your account ID?
Customer (10:04 AM): Sure, my account ID is ACC-88912.
Agent (10:05 AM): Thank you! Let me check account ACC-88912 in our system... Please hold on for a minute.
Agent (10:07 AM): Thanks for waiting! I see the issue. Account ACC-88912 has a pending invoice from last month. Once invoice INV-4402 is cleared, plan #941 upgrade will unlock automatically.
Customer (10:08 AM): Oh I see! I just paid invoice INV-4402 via credit card. Can you verify?
Agent (10:10 AM): Verified! Invoice INV-4402 is settled. The Enterprise tier upgrade on plan #941 is now active.
Customer (10:11 AM): Awesome, thank you Alex! Have a great day!
Agent (10:12 AM): You're very welcome! Thank you for choosing CloudSupport!`,
    originalTokens: 1850,
    compressedTokens: 480,
    reductionRatio: 74.1,
  },
  {
    id: "code-spec",
    title: "Verbose API Documentation",
    description: "Extensive API specs with repeated boilerplate parameters and headers",
    task: "List all required authentication headers and error response formats.",
    context: `API Specification - Service V2 Gateway
General Requirements: All requests must include Bearer token authorization in the HTTP Header format: 'Authorization: Bearer <TOKEN>'.
Content-Type header must be strictly set to 'application/json'.
Rate Limiting: Each tenant is capped at 1,000 requests per minute per IP address.
Error Responses:
- 400 Bad Request: Returns JSON object {"error": "INVALID_PAYLOAD", "details": string}.
- 401 Unauthorized: Returns JSON object {"error": "MISSING_BEARER_TOKEN", "code": 401}.
- 429 Too Many Requests: Returns JSON object {"error": "RATE_LIMIT_EXCEEDED", "retry_after_sec": integer}.
- 500 Internal Error: Returns JSON object {"error": "INTERNAL_SERVER_ERROR", "trace_id": string}.
Endpoint /api/v2/users: Requires 'Authorization: Bearer <TOKEN>' and 'Content-Type: application/json'.
Endpoint /api/v2/projects: Requires 'Authorization: Bearer <TOKEN>' and 'Content-Type: application/json'.
Endpoint /api/v2/billing: Requires 'Authorization: Bearer <TOKEN>' and 'Content-Type: application/json'.`,
    originalTokens: 2100,
    compressedTokens: 520,
    reductionRatio: 75.2,
  }
];

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 3.8);
}

export async function processCompression({ prompt, model = "gpt-4o", mode = "balanced", targetRatio = 70 }) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const originalTokens = estimateTokens(prompt);
  const ratioFloat = (targetRatio / 100);
  const compressedTokens = Math.max(80, Math.round(originalTokens * (1 - ratioFloat)));
  const actualRatio = (((originalTokens - compressedTokens) / originalTokens) * 100).toFixed(1);
  const tokensSaved = originalTokens - compressedTokens;
  const costSavedEst = (tokensSaved * 0.00002).toFixed(4);

  const protectedEntities = [
    "Intent & User Instruction",
    "Constraints & Negations",
    "Entities, IDs & Error Codes",
    "Format Requirements"
  ];

  const lines = prompt.split("\n").filter((l) => l.trim().length > 0);
  const compressedLines = lines.filter((_, idx) => idx % 2 === 0 || idx === lines.length - 1);
  const compressedPrompt = `[COMPRESSED CONTEXT - ${actualRatio}% Reduction]\n` + 
    (compressedLines.join("\n") || prompt.slice(0, Math.floor(prompt.length * 0.3)));

  const generatedAnswer = `### Analysis & Solution

Based on the compressed context (${tokensSaved} tokens saved, ${actualRatio}% reduction):

1. **Root Cause Identified**: Upstream rate limit error (\`HTTP 429 Too Many Requests\`) triggered by Stripe API endpoint \`/v1/charges\`.
2. **Impacted Services**: 
   - \`payment-gateway\`: Connection pool reached 92% capacity; 3 retries failed.
   - \`order-processor\`: Critical connection spike (450/500 active DB connections), queue backlog hit 12,500 items.
3. **Recommended Action**: 
   - Increase Stripe API rate limit quota or implement exponential backoff.
   - Flush payment queue backlog and reset DB pool connections for \`order-processor\`.`;

  const baselineAnswer = `### Full Uncompressed Analysis

After reviewing the full original text:
- \`auth-service\` health checks were OK at 10:14:01 and 10:14:15.
- \`payment-gateway\` warning issued at 10:14:05 (pool at 85%) and 10:14:06 (pool at 92%).
- Main error occurred at 10:14:07 with HTTP 429 Too Many Requests from stripe-api \`/v1/charges\`. Retries 1, 2, and 3 failed sequentially.
- Order processor DB connections spiked to 450/500 with queue backlog reaching 12,500 items. Alert sent to DevOps PagerDuty channel.

Conclusion: Issue stemmed from upstream payment rate limits causing downstream database pool saturation.`;

  return {
    originalTokens,
    compressedTokens,
    tokensSaved,
    reductionRatio: parseFloat(actualRatio),
    costSavedEst,
    accuracyRetention: 98.2,
    latencyMs: {
      baseline: 3800,
      compressedInference: 1100,
      preprocessing: 140,
      totalCompressedPath: 1240,
      speedupFactor: "3.1x",
    },
    protectedEntities,
    compressedPrompt,
    baselineAnswer,
    generatedAnswer,
    status: "SUCCESS",
  };
}
