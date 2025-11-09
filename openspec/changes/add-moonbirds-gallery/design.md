## Context

Building a 10k-item gallery requires careful attention to performance, memory, and network efficiency. Key constraints:
- 10,000 PNG images to fetch and display
- Traits metadata is a single 1.5MB JSON file
- SHA256 hashing must occur client-side for verification
- Ethscriptions API batch endpoint has practical limits (~100 items per request, estimated)
- User experience must remain snappy with infinite scroll

## Goals / Non-Goals

**Goals:**
- Load and display 10k items without blocking the UI
- Verify ethscription status in batches to minimize API calls
- Cache aggressively (1 year) to avoid re-fetching
- Provide instant visual feedback for claimed vs. available items
- Support responsive layout (full-width, flex-based)

**Non-Goals:**
- Do not implement advanced filtering/search in this proposal (future enhancement)
- Do not persist ethscription verification cache (re-verify on each session)
- Do not implement sorting or reordering (items fixed by collection ID)

## Decisions

### 1. Virtualization Strategy
**Decision**: Use TanStack React Query with React Virtual (or similar) for efficient virtualization.
- **Why**: TanStack already integrated; React Virtual is lightweight and battle-tested
- **Alternative**: Manual scroll event listeners (too error-prone)
- **Alternative**: Window virtualization (overkill for 10k items with 150px height)

### 2. Hash Computation Timing
**Decision**: Compute hashes per batch/page of visible items, not upfront for all 10k items.
- **Why**: Avoids blocking the UI on startup; spreads computational load across user interactions
- **Alternative**: Compute all hashes upfront (would freeze browser for ~2-3 seconds on initial load)
- **Alternative**: Compute on-demand per item (excessive API calls; request batching efficiency lost)

### 2.5. Hash & Verification Caching
**Decision**: Maintain in-memory caches for both SHA256 hashes and ethscription verification results, keyed by data URI and hash respectively.
- **Hash Cache**: `Map<dataUri, hexHash>` memoizes SHA256 computations; eliminates redundant hashing if same data URI appears multiple times
- **Verification Cache**: `Map<0xHash, null | 0xTxHash>` memoizes ethscriptions API responses; eliminates duplicate API calls for same hashes across batches
- **Why**: Reduces CPU load from repeated hashing and API load from re-verifying same items; improves perceived performance on re-scroll
- **Cache Lifecycle**: Session-only (cleared on page refresh); ethscription status can change, so no persistent caching
- **Alternative**: No caching (worst case: 10k hashes computed on every page navigation; unnecessary CPU)
- **Alternative**: Persistent cache (risk of stale ethscription status; undermines real-time verification goal)

### 3. Data URI Hashing
**Decision**: Hash the full `data:image/png;base64,...` string, not just the base64 payload.
- **Why**: Per user spec; matches ethscriptions verification requirements
- **Alternative**: Hash image content only (simpler, but not spec-compliant)

### 4. Page Size & Ethscriptions Batch Size
**Decision**: Display pages of exactly 50 items per page. Each page shall undergo verification as a single batch.
- **Why**: 50 items balances virtualization efficiency, hash computation time (~25ms per page), and API request volume (200 pages total for 10k items); ethscriptions API optimized for batches of this size
- **Alternative**: 100 items (fewer API calls but larger UI batches; slower perceived interactivity)
- **Alternative**: Single item verification (10k API calls; unscalable)
- **Alternative**: All 10k at once (likely exceeds API limits; huge response)

### 5. Cache Expiration
**Decision**: Use 1-year cache expiration (31536000000 ms) for all TanStack Query requests.
- **Why**: Per spec; Moonbirds collection is immutable, so stale data is acceptable
- **Alternative**: Shorter expiration (increases bandwidth and latency)
- **Alternative**: No expiration (cache grows indefinitely; memory leak risk)

### 6. Image Hosting & CDN
**Decision**: Fetch images from `raw.githack.com` (ProofXYZ CDN); convert to data URIs for hashing.
- **Why**: Authoritative source; supports range requests for future optimization
- **Alternative**: Host images locally (massive storage and bandwidth burden)

### 7. Ethscription Verification Scope
**Decision**: Verify on each gallery session; do not persist verification cache to disk.
- **Why**: Ethscription status can change; re-verification ensures accuracy
- **Alternative**: Cache verification in localStorage (risk of stale status; complicates state management)

### 8. Layout Strategy
**Decision**: Use flexbox with `w-full flex items-center justify-center flex-wrap` and `gap-2` or `gap-4`.
- **Why**: Per spec; responsive, simple, supports dynamic rewrap on resize
- **Alternative**: CSS Grid (inflexible for 10k items; harder to virtualize)
- **Alternative**: Canvas-based rendering (complexity not justified; virtualization sufficient)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Large batch hashing blocks UI** | 50 items per page = ~25ms compute on modern CPU; stagger via `requestIdleCallback`; hash cache prevents redundant computation |
| **Ethscriptions API rate limits** | Implement exponential backoff; respect 3-retry limit before graceful degradation; verification cache prevents re-queries for same hashes |
| **Browser memory pressure (10k items + traits)** | Virtualization + selective state retention; hash/verification caches bounded by session (cleared on refresh); monitor memory in dev tools |
| **CDN failures on image fetch** | Fallback to placeholder; user can retry; don't block gallery; hash computation skipped if image unavailable |
| **Data URI size in hash computation** | ~40-50KB per image × 50 items/page = ~2-2.5MB per batch; manageable with modern browsers; hash cache avoids storing full data URIs, only hashes |
| **Cache invalidation on data changes** | Session-only cache acceptable since Moonbirds collection is immutable; ethscription status re-verified on each session (risk mitigated) |

## Migration Plan

1. **Phase 1**: Implement gallery skeleton and traits fetching (verify no errors, measure load time)
2. **Phase 2**: Add image fetching and data URI conversion (profile memory usage)
3. **Phase 3**: Integrate hashing and ethscriptions verification (verify batch size limits)
4. **Phase 4**: Performance tuning and edge case handling (error recovery, retry logic)
5. **Phase 5**: Launch and monitor (production metrics)

## Open Questions

1. What is the exact batch size limit for the ethscriptions `exists_multi` endpoint? (Assume 50 items per page is within limits; adjust if documented)
2. Should verification cache be persisted to localStorage for instant second visits? (Recommend no; gamble on accuracy)
3. Is a loading skeleton or spinner preferred during per-page batch fetch? (Recommend minimal; rely on virtualization efficiency)
4. Should a "Moonbirds not found" error page exist if traits or images are permanently unavailable? (Recommend graceful degradation)
