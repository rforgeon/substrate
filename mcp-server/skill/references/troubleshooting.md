# Troubleshooting Guide

## Common Issues

### Vector Search Not Available

**Symptom**: `substrate_search` returns empty results or falls back to text matching.

**Cause**: Qdrant vector database is not running.

**Solution**:
```bash
# Start Qdrant with Docker
docker run -p 6333:6333 qdrant/qdrant

# Or use Docker Compose
docker-compose up -d qdrant
```

**Fallback**: Use `substrate_lookup` for exact domain/path matching when vector search is unavailable.

### Observation Not Found After Creating

**Symptom**: `substrate_lookup` doesn't return an observation you just created.

**Possible causes**:
1. **Wrong domain/path**: Check exact spelling and case
2. **Category mismatch**: Specify the same category used when observing
3. **Database not synced**: Wait a moment and retry

**Diagnosis**:
```json
// Check if observation exists anywhere
substrate_stats({})

// Search broadly
substrate_search({
  "query": "your observation summary keywords"
})
```

### Confirmation Not Incrementing

**Symptom**: Multiple `substrate_observe` calls for the same fact don't increase confirmation count.

**Cause**: Observations must come from different agents (different `agent_hash`).

**Expected behavior**:
- Same agent, same observation → No additional confirmation
- Different agent, same observation → +1 confirmation

**Check**:
```json
substrate_lookup({
  "domain": "example.com",
  "path": "/api/endpoint"
})
// Look at confirming_agents array - should have multiple unique hashes
```

### Search Returns Irrelevant Results

**Symptom**: `substrate_search` returns observations that don't match your query.

**Solutions**:
1. **Add filters**: Use `domain`, `category`, or `status` filters
2. **Be more specific**: Include domain/path in query text
3. **Check confidence**: Filter with `min_confidence: 0.5`

```json
// More targeted search
substrate_search({
  "query": "authentication bearer token",
  "domain": "api.example.com",
  "category": "auth",
  "status": "confirmed",
  "min_confidence": 0.5
})
```

### High Latency on First Search

**Symptom**: First `substrate_search` call takes several seconds.

**Cause**: Embedding model loading on first use.

**Solution**: This is expected behavior. Subsequent searches will be fast (~50-100ms).

### Contradicting Observations

**Symptom**: Observations marked as `contradicted`.

**Cause**: Multiple observations for same domain/path/category have conflicting `structured_data`.

**Resolution**:
1. Check which observations are contradicting
2. Determine which is correct (newer, more confirmations)
3. Use `substrate_confirm` to resolve:

```json
// Mark incorrect observation as stale
substrate_confirm({
  "observation_id": "old-observation-id",
  "action": "mark_stale",
  "reason": "Outdated - API behavior changed"
})

// Confirm correct observation
substrate_confirm({
  "observation_id": "correct-observation-id",
  "action": "confirm",
  "reason": "Verified current behavior"
})
```

## Error Messages

### "Invalid domain URI"

**Cause**: Malformed URI when accessing `substrate://domain/{domain}` resource.

**Solution**: Ensure domain is URL-encoded if it contains special characters.

### "Observation not found"

**Cause**: Referenced observation ID doesn't exist.

**Solutions**:
1. Verify the observation ID is correct
2. Check if observation was deleted or expired
3. Use `substrate_search` to find the observation

### "Vector search requires Qdrant"

**Cause**: `substrate_semantic_search` called but Qdrant is unavailable.

**Solution**: Start Qdrant or use `substrate_search` which has a fallback.

## Performance Tips

### Optimize Search Queries

1. **Use filters**: Always add `domain` filter when you know the target
2. **Limit results**: Don't request more results than needed
3. **Filter by status**: `status: "confirmed"` for reliable data

### Reduce Redundant Observations

Before observing:
1. Check if similar observation exists
2. If exists, your observation will add confirmation automatically
3. Only create new observation if information is genuinely new

### Batch Operations

When checking multiple domains:
```json
// Check failures across all domains first
substrate_failures({ "limit": 50 })

// Then targeted lookups for specific domains
substrate_lookup({ "domain": "api1.example.com" })
substrate_lookup({ "domain": "api2.example.com" })
```

## Debug Mode

Set environment variable for verbose logging:
```bash
SUBSTRATE_LOG_LEVEL=debug substrate-mcp
```

Log levels: `debug`, `info`, `warn`, `error`

## Getting Help

1. Check `substrate://stats` for system health
2. Review recent failures: `substrate://failures/recent`
3. Verify configuration in data directory: `~/.local/share/substrate/config.json`
