## ADDED Requirements

### Requirement: Virtualized Moonbirds Gallery
The system SHALL display 10,000 Moonbirds NFT images in a responsive, virtualized grid with infinite scroll capability. Each grid item SHALL be exactly 150px × 150px, displayed using flexbox layout with equal gaps on all sides. Items SHALL be rendered only when visible in the viewport to minimize DOM nodes and maximize performance. Gallery SHALL be paginated into pages of exactly 50 items per page.

#### Scenario: Gallery loads with initial page
- **WHEN** user navigates to `/moonbirds`
- **THEN** the first page (items 0-49) renders in a full-width flex grid with gap-2 or gap-4 spacing
- **AND** only visible items are in the DOM; off-screen items are virtualized

#### Scenario: Scrolling triggers next page
- **WHEN** user scrolls near the end of the current page
- **THEN** the next page of 50 items is fetched and rendered asynchronously
- **AND** no interruption or loading state blocks the current view

#### Scenario: Item display
- **WHEN** an item is in the viewport
- **THEN** a single `<img src={item.url} />` is rendered inside a 150px × 150px container
- **AND** the container is bordered with a standard 1px border
- **AND** claimed items (verified on ethscriptions) have a red dashed border instead

### Requirement: Image URL Generation
The system SHALL construct image URLs for each Moonbirds item by fetching from the ProofXYZ CDN at `https://raw.githack.com/proofxyz/moonbirds-assets/main/collection/png/{id}.png`, where `id` is zero-padded to 4 digits (e.g., `0001.png`). Fetched images SHALL be converted to valid data URIs and cached.

#### Scenario: Image fetch and convert
- **WHEN** an item is visible and no URL cache exists
- **THEN** fetch the PNG blob from the CDN and convert to data URI
- **AND** cache the data URI in local storage or memory with 1-year expiration

#### Scenario: Image fetch failure
- **WHEN** an image fetch fails (network error, 404)
- **THEN** display a placeholder image or error state
- **AND** do not block rendering of other items

### Requirement: Traits Metadata Integration
The system SHALL fetch a single traits JSON file from `https://raw.githubusercontent.com/proofxyz/moonbirds-assets/refs/heads/main/traits.json` once on startup. Each item in the array corresponds to the Moonbirds ID by index, and traits keys SHALL be normalized to lowercase. Each item data model SHALL be `{ url: string, traits: Record<string, string> }`.

#### Scenario: Traits load on startup
- **WHEN** the gallery route initializes
- **THEN** fetch traits.json once and cache for 1 year
- **AND** parse the array and map indices to Moonbirds IDs

#### Scenario: Traits available in item model
- **WHEN** an item is rendered
- **THEN** traits are available on the item object with lowercased keys (e.g., `specie`, `eyes`, `eyewear`)
- **AND** traits are not displayed in the UI by default (reserved for future use or inspection tools)

### Requirement: Cache Strategy
All external resource fetches (images, traits) SHALL be cached with a 1-year expiration. Cache policy SHALL use TanStack Query's built-in caching with `staleTime: 31536000000` (milliseconds in 1 year) and `cacheTime: 31536000000`.

#### Scenario: Query cache on first load
- **WHEN** traits or an image is fetched for the first time
- **THEN** store in TanStack Query cache with 1-year stale and cache times
- **AND** subsequent requests return cached data without network calls

#### Scenario: Cache persists across browser restarts
- **WHEN** the browser is closed and reopened
- **THEN** TanStack Query persists cache to IndexedDB or localStorage (optional persistence layer)
- **AND** data is available without re-fetching
