## ADDED Requirements

### Requirement: SHA256 Data URI Hashing
The system SHALL compute a SHA256 hash of each item's full data URI (the complete `data:image/png;base64,...` string, not just the image content). Hashing SHALL be performed per batch/page of visible items to balance computational load and user feedback timing. Computed hashes SHALL be cached and memoized to avoid redundant computation for the same data URI.

#### Scenario: Hash computed for each item
- **WHEN** a batch of items enters the viewport
- **THEN** for each item, fetch its blob, convert to data URI, and compute SHA256 of the full data URI string
- **AND** store hashes temporarily until batch verification completes
- **AND** cache hashes by data URI in memory for the session

#### Scenario: Hash format
- **WHEN** hashes are computed
- **THEN** hashes are 64-character hex strings (SHA256 standard output)
- **AND** hashes are converted to 0x-prefixed format for ethscriptions API (e.g., `0x1234...abcd`)

#### Scenario: Hash cache hit
- **WHEN** a hash is requested for a data URI that already exists in the hash cache
- **THEN** return the cached hash immediately without recomputing
- **AND** no SHA256 computation occurs

### Requirement: Batch Ethscription Verification
The system SHALL POST a batch of SHA256 hashes to the ethscriptions API endpoint at `https://api.ethscriptions.com/api/ethscriptions/exists_multi` with body `{ "shas": [0xsha1, 0xsha2, ...] }`. The response is an object `{ result: { [0xsha]: 0xTxHash | null } }`, where `null` indicates the item is already claimed/taken, and a valid `0xTxHash` indicates availability. Verification results SHALL be cached and memoized in memory for the session to avoid duplicate API requests for the same hashes.

#### Scenario: Batch verification on page load
- **WHEN** a page of items has all hashes computed
- **THEN** check the verification cache for cached results
- **AND** only POST hashes to the ethscriptions API that are not already cached
- **AND** await the response containing ethscription status for each item

#### Scenario: Handle verification response
- **WHEN** the ethscriptions API returns a response
- **THEN** for each item, update its `claimed` status:
  - `result[0xsha] === null` → item is claimed (display red dashed border)
  - `result[0xsha] !== null` → item is available (display standard border)
- **AND** cache the verification result by hash for future lookups

#### Scenario: Verification cache hit
- **WHEN** verification status is requested for hashes that are already in the verification cache
- **THEN** return cached results immediately without making a new API request
- **AND** no ethscriptions API request occurs for those hashes

#### Scenario: Verification error handling
- **WHEN** the ethscriptions API request fails (network error, timeout)
- **THEN** retry up to 3 times with exponential backoff
- **AND** if all retries fail, log error and render items with neutral status (do not block gallery)

### Requirement: Visual Indication of Claimed Items
Items SHALL be visually distinguished by border style based on ethscription status. Available items SHALL display a standard 1px solid border. Claimed items SHALL display a 2px red dashed border (`border-2 border-dashed border-red-500` in Tailwind).

#### Scenario: Claimed item rendering
- **WHEN** an item's ethscription status is null (claimed)
- **THEN** render the image container with `border-2 border-dashed border-red-500`
- **AND** tooltip or aria-label MAY indicate "Claimed" status (optional)

#### Scenario: Available item rendering
- **WHEN** an item's ethscription status is a valid hash
- **THEN** render the image container with `border border-gray-300` or similar neutral border
- **AND** no special indication required
