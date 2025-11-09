## 1. Setup & Data Fetching

- [ ] 1.1 Create utility module `src/lib/moonbirds.ts` with types: `MoonbirdItem = { url: string, traits: Record<string, string> }`
- [ ] 1.2 Implement traits fetching with TanStack Query: `useTraitsQuery()` hook with 1-year cache
- [ ] 1.3 Implement image blob-to-data-URI conversion function `blobToDataUri(blob: Blob): string`
- [ ] 1.4 Create image fetching hook `useImageDataUri(id: number)` with 1-year cache
- [ ] 1.5 Combine traits + image URL into item model: return `MoonbirdItem[]` from query

## 2. Hashing & Verification

- [ ] 2.1 Create utility `src/lib/hash.ts` with `sha256(data: string): Promise<string>` using SubtleCrypto
- [ ] 2.2 Create hash memoization cache: `const hashCache = new Map<string, string>()` to store `dataUri -> hexHash` mappings
- [ ] 2.3 Implement `cachedSha256(dataUri: string): Promise<string>` wrapper that checks cache before computing
- [ ] 2.4 Implement batch hashing function `hashItemsDataUri(items: MoonbirdItem[]): Promise<string[]>` using `cachedSha256()` for each item (returns 0x-prefixed hashes)
- [ ] 2.5 Create verification result memoization cache: `const verificationCache = new Map<string, 0xTxHash | null>()` to store `0xHash -> status` mappings
- [ ] 2.6 Implement `useEthscriptionsVerify(hashes: string[]): { claimed: Set<string>, status: 'pending' | 'success' | 'error' }` hook that:
  - [ ] Filters hashes to only those not in `verificationCache`
  - [ ] POSTs only uncached hashes to the ethscriptions API
  - [ ] Merges uncached results with cached results before returning
  - [ ] Updates `verificationCache` with new results for future use
- [ ] 2.7 Add error handling and 3-retry logic with exponential backoff to verification hook
- [ ] 2.8 Map verified hashes back to items; store claimed status on each `MoonbirdItem`

## 3. Gallery Component

- [ ] 3.1 Create component `src/components/MoonbirdsGallery.tsx` with virtualized grid
- [ ] 3.2 Define `PAGE_SIZE = 50` constant for items per page (200 pages total for 10k items)
- [ ] 3.3 Implement flexbox layout: `w-full flex items-center justify-center flex-wrap gap-4`
- [ ] 3.4 Each item renders `<div className="w-[150px] h-[150px] border border-gray-300/dashed">` with conditional red dashed border for claimed items
- [ ] 3.5 Inside container, render `<img src={item.url} alt={`Moonbird ${id}`} className="w-full h-full object-cover" />`
- [ ] 3.6 Integrate TanStack React Query and React Virtual (or similar) for virtualization
- [ ] 3.7 Fetch and display items in 50-item pages; batch verification into single API call per page

## 4. Route & Integration

- [ ] 4.1 Create route file `src/routes/moonbirds.tsx`
- [ ] 4.2 Import `MoonbirdsGallery` component and render full-page
- [ ] 4.3 Add link to `/moonbirds` in navigation (Header or root layout)
- [ ] 4.4 Verify route loads without errors; check browser dev tools for network and memory

## 5. Performance & Polish

- [ ] 5.1 Measure initial load time for traits (target: <2s)
- [ ] 5.2 Profile memory usage with DevTools (target: <500MB with 2-3 pages visible)
- [ ] 5.3 Test scroll performance: confirm smooth 60fps scrolling; measure page load time (~25ms per 50-item page hash computation)
- [ ] 5.4 Test error recovery: manually block CDN/traits URL and verify graceful fallback
- [ ] 5.5 Add loading skeleton or spinner during per-page verification (optional but recommended)
- [ ] 5.6 Test claimed item styling: verify red dashed border renders correctly
- [ ] 5.7 Verify page boundaries: confirm each page is exactly 50 items and pagination is seamless

## 6. Testing & QA

- [ ] 6.1 Write unit tests for `blobToDataUri()` with sample image blobs
- [ ] 6.2 Write unit tests for `sha256()` with known test vectors (e.g., SHA256("hello") = 0x2cf24...)
- [ ] 6.3 Write unit tests for hash cache: verify `cachedSha256()` returns cached value on second call without recomputing
- [ ] 6.4 Write unit tests for verification cache: verify `useEthscriptionsVerify()` returns cached results without API calls
- [ ] 6.5 Write integration test for `useTraitsQuery()` and `useImageDataUri()` mocking network
- [ ] 6.6 Write integration test for `useEthscriptionsVerify()` with mock API response, verifying:
  - [ ] First call fetches from API
  - [ ] Second call with same hashes returns cached results without API call
  - [ ] Mixed call (some hashes cached, some new) only POSTs new hashes
- [ ] 6.7 Test virtualization: render 10k items and confirm only visible subset in DOM
- [ ] 6.8 Test infinite scroll: scroll to end and confirm next batch loads and caches are used
- [ ] 6.9 Test claimed vs. available styling: verify red dashed border renders correctly
- [ ] 6.10 Performance test: measure time savings from caching on re-scroll or pagination

## 7. Documentation & Handoff

- [ ] 7.1 Add JSDoc comments to all exported functions in `src/lib/moonbirds.ts` and `src/lib/hash.ts`
- [ ] 7.2 Document hash cache strategy and lifecycle in `src/lib/hash.ts` comments
- [ ] 7.3 Document verification cache strategy and lifecycle in `src/lib/moonbirds.ts` or verification hook comments
- [ ] 7.4 Document cache strategy and ethscriptions API batch limits in code comments and README
- [ ] 7.5 Add README section in project docs explaining the Moonbirds gallery feature, including cache behavior
- [ ] 7.6 Document open questions from design.md (e.g., batch size limits) with findings
- [ ] 7.7 Create Storybook stories or demo page for gallery component (optional)

## 8. Deployment & Monitoring

- [ ] 8.1 Test production build: `bun run build` and `bun run serve`
- [ ] 8.2 Verify cache headers are correct (1-year expiration via HTTP headers or TanStack Query)
- [ ] 8.3 Monitor ethscriptions API rate limits in production
- [ ] 8.4 Set up error logging for failed image/traits fetches
- [ ] 8.5 Track user engagement metrics: time spent on gallery, scroll depth, claimed items viewed
