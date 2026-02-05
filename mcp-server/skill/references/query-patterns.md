# Query Patterns Reference

## Common Query Scenarios

### 1. First Contact with a Domain

When encountering a new domain for the first time:

```json
// Step 1: Broad search for any known issues
substrate_search({
  "query": "problems issues errors",
  "domain": "api.newservice.com",
  "limit": 20
})

// Step 2: Check for authentication requirements
substrate_lookup({
  "domain": "api.newservice.com",
  "category": "auth"
})

// Step 3: Check for rate limits
substrate_lookup({
  "domain": "api.newservice.com",
  "category": "rate_limit"
})
```

### 2. Before Form Submission

```json
// Search for format requirements
substrate_search({
  "query": "form validation format required fields",
  "domain": "forms.example.com",
  "limit": 10
})

// Get specific path observations
substrate_lookup({
  "domain": "forms.example.com",
  "path": "/signup"
})
```

### 3. After Encountering an Error

```json
// Check if others have seen this error
substrate_search({
  "query": "error 429 too many requests",
  "domain": "api.example.com",
  "limit": 5
})

// Then observe your experience
substrate_observe({
  "domain": "api.example.com",
  "path": "/users",
  "category": "error",
  "summary": "Returns 429 after 50 requests in quick succession",
  "structured_data": {
    "error_code": "429",
    "error_message": "Too Many Requests",
    "trigger": "50+ requests within 1 minute"
  },
  "urgency": "high"
})
```

### 4. Checking Service Health

```json
// Get recent failures
substrate_failures({
  "domain": "api.example.com",
  "limit": 10
})

// Check overall stats
substrate_stats({
  "domain": "api.example.com"
})
```

### 5. API Integration Setup

```json
// Comprehensive pre-integration check
// Step 1: Authentication
substrate_lookup({
  "domain": "api.partner.com",
  "category": "auth"
})

// Step 2: Rate limits
substrate_lookup({
  "domain": "api.partner.com",
  "category": "rate_limit"
})

// Step 3: Known behaviors
substrate_search({
  "query": "pagination cursor offset batch",
  "domain": "api.partner.com"
})

// Step 4: Known errors
substrate_lookup({
  "domain": "api.partner.com",
  "category": "error"
})
```

## Search Query Tips

### Effective Queries

**Good queries:**
- "date format validation" - specific topic
- "checkout payment fails" - action + outcome
- "401 unauthorized token" - error + context
- "rate limit exceeded retry" - problem + solution

**Less effective queries:**
- "problem" - too vague
- "api" - too broad
- "error" - no context

### Using Filters

**Filter by status for reliable information:**
```json
substrate_search({
  "query": "authentication setup",
  "domain": "api.example.com",
  "status": "confirmed",       // Only confirmed observations
  "min_confidence": 0.5        // At least 50% confidence
})
```

**Filter by category for specific types:**
```json
substrate_lookup({
  "domain": "api.example.com",
  "category": "rate_limit",
  "status": "confirmed"
})
```

### Combining Tools

**Pattern: Search → Lookup → Observe**

```json
// 1. Broad search to understand the landscape
substrate_search({
  "query": "issues problems",
  "domain": "checkout.shop.com"
})
// Result: Several observations about checkout flow

// 2. Specific lookup for the path you're working with
substrate_lookup({
  "domain": "checkout.shop.com",
  "path": "/api/cart"
})
// Result: Specific cart API observations

// 3. After interaction, observe new findings
substrate_observe({
  "domain": "checkout.shop.com",
  "path": "/api/cart",
  "category": "behavior",
  "summary": "Cart expires after 30 minutes of inactivity"
})
```

## Observation Patterns

### When to Use High Urgency

```json
// Service degradation
substrate_observe({
  "urgency": "high",
  "category": "error",
  "summary": "Intermittent 503 errors, ~20% of requests failing"
})

// Security-relevant finding
substrate_observe({
  "urgency": "high",
  "category": "auth",
  "summary": "Token refresh endpoint requires re-authentication"
})
```

### When to Use Critical Urgency

```json
// Complete service outage
substrate_observe({
  "urgency": "critical",
  "category": "error",
  "summary": "Service returning 503 for all requests"
})

// Auth completely broken
substrate_observe({
  "urgency": "critical",
  "category": "auth",
  "summary": "OAuth token endpoint returning invalid_client for all requests"
})
```

### Documenting Workarounds

Always include workarounds when you find them:

```json
substrate_observe({
  "domain": "legacy.example.com",
  "path": "/api/export",
  "category": "behavior",
  "summary": "Export times out for >1000 records, must paginate",
  "structured_data": {
    "workaround": "Use page_size=500 and iterate",
    "max_records": 1000,
    "recommended_page_size": 500
  }
})
```

## Resource Usage

### Getting Domain Overview
```
Read: substrate://domain/api.example.com
```

Returns all observations for the domain with statistics.

### Monitoring Recent Issues
```
Read: substrate://failures/recent
```

Returns failures from the last 24 hours across all domains.

### Network-Wide Statistics
```
Read: substrate://stats
```

Returns overall Substrate statistics including confirmation rates.
