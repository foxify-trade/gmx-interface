# Phase 02 — Data Layer (types, context, hooks, mutations, eligibility)

## Context Links
- Plan: [plan.md](plan.md) | Depends on: Phase 01
- Reference: `git show origin/what-exchange:src/clients/pages/Nft/types.ts`, `.../hooks/useNftData.ts`, `.../contexts/NftContext.tsx`, `.../NftEligibility/hooks/useEligibility.ts`, `.../hooks/useVolumeSnapshotCountdown.ts`, `.../config/waves.ts`, `src/app/api/merkle-proof/route.ts`
- Mutation logic source (currently embedded in components): `.../Nft/components/NftStakingSection.tsx` (stake/unstake), `.../MergeWarningDialog.tsx` (merge), `.../MigrateAndMintSection.tsx` (approve/migrate/mint).

## Overview
- Priority: P1 (blocks Phase 3 & 4)
- Status: pending
- Port all NFT business logic + on-chain reads/writes + eligibility into `src/domain/nft/`. Split the ~400-line `useNftData.ts` into focused < 200-line modules (DRY/KISS). Extract embedded mutations from reference components into reusable hooks so Phase 3 dialogs stay thin.

## Key Insights
- Reference uses `useMainAccount().address` (funded-wallet duality). gmx has single wallet → replace with `useWallet().account` (`src/lib/wallets/useWallet.ts:15`, returns `account`).
- All reads use `arbitrumPublicClient.readContract` (created Phase 1). All writes: `switchToArbitrumAndGetClient()` → `walletClient.writeContract`, with `arbitrumPublicClient.simulateContract` before + `waitForTransactionReceipt` after.
- React Query keys are namespaced `['nft', ...]`; global `refetch` invalidates `queryKey: ['nft']` — preserve so external subscribers (future FUNDED bonus widget) refresh.
- Metadata fallback chain: onchain `tokenURI` → OpenSea (`x-api-key`) → `api.foxify.trade/funded/nfts/{id}`. OpenSea key MUST move to `import.meta.env.VITE_OPENSEA_API_KEY` (was hardcoded `1080fc62...`).
- Merkle proof: Next.js had same-origin proxy `/api/merkle-proof` → upstream `https://nft.foxify.trade/proof`. Vite has NO server routes → call upstream `VITE_NFT_MERKLE_PROOF_URL` (default `https://nft.foxify.trade/proof`) directly. If upstream lacks CORS headers, browser call fails → see Risk (mint section is hidden in reference; treat as best-effort).
- Eligibility uses Orderly `AXIOS` to `/funded/account-volume?walletAddress&frontendId`. gmx → use `FUNDED_PUBLIC_API_URL` (`https://api.foxify.trade`, verified `config/funded.ts:38`) + plain `fetch`/existing axios. `frontendId` = `FUNDED_FRONTEND_ID` (`"gmx-funded"`, `funded.ts:24`) — NOTE: reference used `mune`; gmx must use its own frontend id (confirm with user, see Unresolved).
- `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*` everywhere.
- `'use client'` directives: remove (Vite has no RSC).

## Requirements
Functional: V2 + V3 reads; staked id; merge rates/permissions; current wave; hasClaimed; metadata w/ fallback + deterministic trait gen; stake/unstake/merge/migrate/approve/mint mutations; eligibility result builder; snapshot countdown; waves config.
Non-functional: each file < 200 lines; pure functions unit-testable; query keys stable.

## Architecture
Module split for `useNftData.ts` (port into `src/domain/nft/`):
- `nft-types.ts` — `NftLevel`, `NftVersion`, `NftData`, `MergeLevelRates/Permissions`, `NftSortOption` + pure helpers (`getLevelName/Color/Glow/Gradient/getFundingBonus/getNftImage/getNftPlaceholderImage`). (port `types.ts` verbatim, swap placeholder path to a `src/img` asset — see step 2.)
- `nft-metadata.ts` — `fetchOpenSeaMetadata` (env key), `triggerOpenSeaMetadataRefresh`, `fetchOnchainMetadata`, `fetchNftMetadata`, `parseLevelFromAttributes`. (~120 lines)
- `nft-traits.ts` — `generateTraitsFromOnchainData` (deterministic seed). (~60 lines)
- `use-user-nfts.ts` — `useUserV2Nfts`, `useUserV3Nfts`, `useUserStakedNft`, `useUserNfts`. (~150 lines)
- `use-nft-merge-config.ts` — `useMergeLevelRates`, `useMergeLevelPermissions`, `useCurrentMintWave`, `useHasClaimed`.
- `use-nft-mutations.ts` — `useStakeNft`, `useUnstakeNft` (extract from `NftStakingSection`), `useMergeNfts` (from `MergeWarningDialog`), `useApproveV2`, `useMigrateNfts`, `useMintNft` (from `MigrateAndMintSection`). Each accepts `{ onSuccess }`; encapsulates switch→simulate→write→wait. (~180 lines; split into `use-nft-staking-mutations.ts` + `use-nft-migrate-mint-mutations.ts` if > 200.)
- `use-merkle-proof.ts` — query `VITE_NFT_MERKLE_PROOF_URL?address=`.

Context (`src/domain/nft/nft-context.tsx`): port `NftContext.tsx` verbatim (selection Set, sort, canMerge/mergeLevel/selectionError memo, MAX_SELECTION=5). No wallet coupling — pure UI state.

Eligibility (`src/domain/nft/`):
- `nft-waves.ts` — port `waves.ts` verbatim (MINT_WAVES, ONE/TWO_MINT_VOLUME_TARGET).
- `use-nft-eligibility.ts` — port `useEligibility.ts`; swap `useAccount().state.address`→`useWallet().account`; swap AXIOS→fetch to `${FUNDED_PUBLIC_API_URL}/funded/account-volume`; `FRONTEND_ID = FUNDED_FRONTEND_ID`.
- `use-volume-snapshot-countdown.ts` — port verbatim (hardcoded Jul 1 2026 20:00 UTC).

## Related Code Files
Create (all under `src/domain/nft/`): `nft-types.ts`, `nft-metadata.ts`, `nft-traits.ts`, `use-user-nfts.ts`, `use-nft-merge-config.ts`, `use-nft-staking-mutations.ts`, `use-nft-migrate-mint-mutations.ts`, `use-merkle-proof.ts`, `nft-context.tsx`, `nft-waves.ts`, `use-nft-eligibility.ts`, `use-volume-snapshot-countdown.ts`.
Modify: `.env`, `.env.example` — add `VITE_OPENSEA_API_KEY`, `VITE_NFT_MERKLE_PROOF_URL`.
Reuse (Phase 1): `arbitrum-public-client.ts`, `arbitrum-wallet-client.ts`, `nft-contracts.ts`, ABIs.

## Implementation Steps
1. Port `types.ts` → `nft-types.ts` verbatim (all enums + pure getters). Keep level color/glow/gradient hex (presentational, not Orderly-specific).
2. Replace `NFT_PLACEHOLDER_IMAGE='/nft-placeholder.png'` with a bundled asset: add `src/img/nft-placeholder.png` (copy from reference `public/nft-placeholder.png` via `git show origin/what-exchange:public/nft-placeholder.png > src/img/nft-placeholder.png`) and import it, OR keep a remote URL. (KISS: bundle it.)
3. Port `nft-traits.ts` (`generateTraitsFromOnchainData`) verbatim.
4. Port `nft-metadata.ts`: replace `OPENSEA_API_KEY` const with `import.meta.env.VITE_OPENSEA_API_KEY`. Keep onchain→OpenSea→foxify fallback order. Use Phase-1 `arbitrumPublicClient`.
5. Port `use-user-nfts.ts`: swap `useMainAccount()`→`useWallet()`, `address`→`account`. Keep `['nft','v2Nfts',address]` etc. query keys. `enabled: !!account`.
6. Port `use-nft-merge-config.ts` (rates/permissions/currentWave/hasClaimed).
7. Extract mutations into `use-nft-staking-mutations.ts` (`useStakeNft`,`useUnstakeNft`) and `use-nft-migrate-mint-mutations.ts` (`useApproveV2`,`useMigrateNfts`,`useMintNft`,`useMergeNfts` — or put merge in staking file; keep each file <200). Signature e.g. `useStakeNft({ onSuccess }: { onSuccess?: ()=>void })` returning the react-query `useMutation` result. Use `useWallet().account` for the `account` arg; `helperToast` for errors (or surface error to caller for dialog). Preserve simulate→write→wait + error message mapping (rejected/insufficient/proof).
8. Port `nft-context.tsx` verbatim (drop `'use client'`).
9. Port eligibility: `nft-waves.ts`, `use-nft-eligibility.ts` (swap wallet + axios + frontendId), `use-volume-snapshot-countdown.ts`.
10. Port `use-merkle-proof.ts`: `const url = import.meta.env.VITE_NFT_MERKLE_PROOF_URL ?? "https://nft.foxify.trade/proof"; fetch(\`${url}?address=${account}\`)`. Returns `{address,proof,merkleRoot}|null`.
11. Add `VITE_OPENSEA_API_KEY` + `VITE_NFT_MERKLE_PROOF_URL` to `.env`/`.env.example` (placeholder values; real key set by deployer, not committed).
12. tscheck.

## Todo List
- [ ] `nft-types.ts` (+ placeholder asset)
- [ ] `nft-traits.ts`
- [ ] `nft-metadata.ts` (env OpenSea key)
- [ ] `use-user-nfts.ts` (wallet swap)
- [ ] `use-nft-merge-config.ts`
- [ ] `use-nft-staking-mutations.ts`
- [ ] `use-nft-migrate-mint-mutations.ts`
- [ ] `use-merkle-proof.ts`
- [ ] `nft-context.tsx`
- [ ] `nft-waves.ts`, `use-nft-eligibility.ts`, `use-volume-snapshot-countdown.ts`
- [ ] env vars added
- [ ] tscheck passes

## Success Criteria
- Hooks compile + return typed data; reads work against Arbitrum when wallet connected (manual smoke in Phase 5).
- No hardcoded OpenSea key in source (grep `1080fc62` returns 0).
- All files < 200 lines.
- Eligibility result object matches reference shape.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| OpenSea/foxify metadata CORS in browser | Med×Low | Fallback chain already tolerates failures (returns null → placeholder). Onchain `tokenURI` is primary. |
| Merkle upstream lacks CORS (no Vite proxy) | High×Med | Mint UI is hidden in reference (commented). Port mint behind `isMintActive` gate; document that mint needs a backend proxy or CORS-enabled upstream before enabling. Add optional Vite dev proxy entry in `vite.config` for local testing (note, not required). |
| `/funded/account-volume` rejects `gmx-funded` frontendId | Med×Med | Confirm frontendId with user (Unresolved Q1). Eligibility degrades to error banner if API 4xx. |
| Splitting mutations changes behavior | Med×High | Trace each ported mutation against reference (simulate→write→wait + onSuccess refetch/snapshot). Keep snapshot+effect "new NFT detection" in the *component* (Phase 3), not the hook — hook only does the tx. |

## Security Considerations
- OpenSea key in `import.meta.env` is still client-exposed (Vite inlines `VITE_*`). Acceptable parity w/ reference, but prefer a low-scope key. Document in `.env.example`.
- Writes always re-simulate on Arbitrum before signing → prevents wrong-chain submission.
- Validate wallet address format before eligibility fetch (`isValidAddress` regex ported).

## Next Steps
- Phase 3 consumes context + hooks for the management UI; Phase 4 consumes eligibility hooks.
