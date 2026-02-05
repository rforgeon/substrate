# Observation Schema Reference

## Core Observation Structure

```typescript
interface Observation {
  // Identity
  id: string;                    // UUID v4
  agent_hash: string;            // SHA-256 hash of agent identifier

  // Location
  domain: string;                // e.g., "api.example.com"
  path?: string;                 // e.g., "/v2/users"

  // Content
  category: ObservationCategory;
  summary: string;               // Human-readable description (max 2000 chars)
  structured_data?: object;      // Category-specific structured data

  // Confirmation tracking
  status: ObservationStatus;     // pending | confirmed | contradicted | stale
  confirmations: number;         // Number of confirming observations
  confirming_agents: string[];   // Agent hashes that confirmed
  confidence: number;            // 0-1 confidence score

  // Metadata
  urgency: UrgencyLevel;         // normal | high | critical
  tags: string[];                // Filtering tags

  // Timestamps
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
  expires_at?: string;           // Optional expiration
}
```

## Structured Data by Category

### behavior
```typescript
{
  element?: string;           // UI element identifier
  action?: string;            // User action
  expected_result?: string;   // What should happen
  actual_result?: string;     // What actually happens
  workaround?: string;        // How to work around it
}
```

### error
```typescript
{
  error_code?: string;        // HTTP status or error code
  error_message?: string;     // Error message text
  trigger?: string;           // What triggers the error
  resolution?: string;        // How to resolve
  recoverable?: boolean;      // Can recover from error?
}
```

### auth
```typescript
{
  method?: string;            // oauth, api_key, session, basic
  header?: string;            // Authorization, X-Api-Key, etc.
  token_location?: string;    // header, cookie, query
  session_duration?: string;  // "24h", "7d", etc.
  refresh_mechanism?: string; // How tokens are refreshed
}
```

### rate_limit
```typescript
{
  limit?: number;             // Requests per window
  window?: string;            // "1m", "1h", "1d"
  header_remaining?: string;  // Response header for remaining
  header_reset?: string;      // Response header for reset time
  retry_after?: string;       // Retry-After header format
}
```

### format
```typescript
{
  field?: string;             // Field name
  format?: string;            // "DD/MM/YYYY", "ISO8601", etc.
  validation_regex?: string;  // Regex pattern
  encoding?: string;          // utf-8, base64, etc.
  max_length?: number;        // Maximum length
  required?: boolean;         // Is field required?
}
```

## Status Lifecycle

```
pending ──┬── (3+ confirmations) ──→ confirmed
          │
          └── (conflicting data) ──→ contradicted
                                         │
                                         └── (resolved) ──→ stale

Any status ── (outdated) ──→ stale
```

## Confidence Calculation

```
confidence = min(1.0, confirmations / 6)

0 confirmations → 0.00
1 confirmation  → 0.17
2 confirmations → 0.33
3 confirmations → 0.50 (promoted to confirmed)
4 confirmations → 0.67
5 confirmations → 0.83
6+ confirmations → 1.00
```

## Content Hash

Observations are deduplicated by content hash, computed from:
- domain (lowercase)
- path (lowercase)
- category
- structured_data (canonicalized JSON)

Same content hash = same observation = additional confirmation.

## Examples

### Rate Limit Observation
```json
{
  "domain": "api.github.com",
  "path": "/repos",
  "category": "rate_limit",
  "summary": "Authenticated requests limited to 5000/hour, unauthenticated to 60/hour",
  "structured_data": {
    "limit": 5000,
    "window": "1h",
    "header_remaining": "X-RateLimit-Remaining",
    "header_reset": "X-RateLimit-Reset"
  },
  "urgency": "normal"
}
```

### Authentication Observation
```json
{
  "domain": "api.stripe.com",
  "path": "/v1/charges",
  "category": "auth",
  "summary": "Requires Bearer token with sk_ prefix in Authorization header",
  "structured_data": {
    "method": "api_key",
    "header": "Authorization",
    "token_location": "header"
  },
  "urgency": "normal"
}
```

### Error Observation
```json
{
  "domain": "checkout.example.com",
  "path": "/api/payment",
  "category": "error",
  "summary": "Returns 400 'Invalid card' for test cards in production mode",
  "structured_data": {
    "error_code": "400",
    "error_message": "Invalid card number",
    "trigger": "Using test card numbers (4242...)",
    "resolution": "Use real card or switch to test mode",
    "recoverable": true
  },
  "urgency": "high"
}
```

### Format Observation
```json
{
  "domain": "forms.gov.uk",
  "path": "/passport/apply",
  "category": "format",
  "summary": "Date of birth field requires DD/MM/YYYY, common US format MM/DD/YYYY rejected",
  "structured_data": {
    "field": "date_of_birth",
    "format": "DD/MM/YYYY",
    "validation_regex": "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\\d{4}$",
    "required": true
  },
  "urgency": "normal"
}
```
