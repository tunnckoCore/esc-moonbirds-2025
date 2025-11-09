## Why

Enable users to browse the complete Moonbirds NFT collection (10k items) with virtualized rendering for performance, fetch asset metadata and images from authoritative sources, and verify ethscription status for each item against the ethscriptions blockchain registry. This combines visual discovery with on-chain verification in a single, responsive interface.

## What Changes

- **NEW**: Virtualized grid gallery component displaying 10,000 Moonbirds NFT images (150px × 150px) with infinite scroll
- **NEW**: TanStack Query integration to fetch Moonbirds PNG collection from `https://raw.githack.com/proofxyz/moonbirds-assets/main/collection/png/{0-9999}.png`
- **NEW**: Traits metadata fetching from `https://raw.githubusercontent.com/proofxyz/moonbirds-assets/refs/heads/main/traits.json` with index-to-ID mapping
- **NEW**: SHA256 hashing of data URIs for each item to verify ethscription existence
- **NEW**: Batch ethscription status verification via POST to `https://api.ethscriptions.com/api/ethscriptions/exists_multi`
- **NEW**: Visual indicator (red dashed border) for claimed ethscriptions; available items display normally
- **NEW**: Long-lived cache (1 year) for all remote assets to minimize bandwidth
- **NEW**: Route `/moonbirds` with full-width flex-based grid layout
- **NEW**: Item data model: `{ url: string, traits: Record<string, string> }` with lowercased trait keys

## Impact

- **New specs**: `gallery`, `ethscriptions`
- **Affected code**: New route file (`src/routes/moonbirds.tsx`), data fetching utilities (`src/lib/moonbirds.ts`), gallery component (`src/components/MoonbirdsGallery.tsx`), hash utility (`src/lib/hash.ts`)
- **Breaking changes**: None
- **Dependencies**: No new packages required (use built-in crypto module via TanStack/Node compatibility)
- **Performance**: ~1.5MB initial metadata load (traits), images loaded on-demand via virtualization, cache lifecycle 1 year

## Approval Gate

This proposal must be reviewed and approved before implementation begins. Implementation checklist available in `tasks.md`.
