# Phase 02 — NFT Data Layer — Completion Report

## Files Created

| File | Lines | Notes |
|------|-------|-------|
| `src/domain/nft/nft-types.ts` | 132 | Types + pure helpers. Placeholder bundled from `src/img/nft-placeholder.png` (587 KB PNG, valid). |
| `src/domain/nft/nft-traits.ts` | 47 | Deterministic trait gen from randomValue seed. |
| `src/domain/nft/nft-metadata.ts` | 141 | Fallback chain: onchain tokenURI → OpenSea (key from config/nft) → api.foxify.trade. |
| `src/domain/nft/nft-waves.ts` | 37 | MINT_WAVES, ONE/TWO_MINT_VOLUME_TARGET. Verbatim port. |
| `src/domain/nft/nft-context.tsx` | 132 | NftProvider + useNftContext. Dropped `'use client'`. |
| `src/domain/nft/use-user-nfts.ts` | 172 | useUserV2Nfts, useUserV3Nfts, useUserStakedNft, useUserNfts. `useMainAccount()` → `useWallet().account`. |
| `src/domain/nft/use-nft-merge-config.ts` | 91 | useMergeLevelRates, useMergeLevelPermissions, useCurrentMintWave, useHasClaimed. |
| `src/domain/nft/use-nft-staking-mutations.ts` | 148 | useStakeNft, useUnstakeNft, useMergeNfts extracted from NftStakingSection + MergeWarningDialog. |
| `src/domain/nft/use-nft-migrate-mint-mutations.ts` | 149 | useApproveV2Nfts, useMigrateNfts, useMintNft extracted from MigrateAndMintSection. |
| `src/domain/nft/use-merkle-proof.ts` | 45 | Fetches NFT_MERKLE_PROOF_URL directly. CORS-tolerant (returns null on failure). |
| `src/domain/nft/use-nft-eligibility.ts` | 156 | useNftEligibility: uses FUNDED_PUBLIC_API_URL + FUNDED_FRONTEND_ID ("gmx-funded"). |
| `src/domain/nft/use-volume-snapshot-countdown.ts` | 38 | Verbatim port. Hardcoded Jul 1 2026 20:00 UTC. |
| `src/img/nft-placeholder.png` | 588 KB binary | Copied via `git show origin/what-exchange:public/nft-placeholder.png` — valid 2250×2250 RGBA PNG. |

## Phase 1 File Modified (correction)
- `src/domain/nft/contracts/nft-contracts.ts`: changed `FOXIFY_V3_NFT_ABI = FoxifyTradingNftAbi` → `FOXIFY_V3_NFT_ABI = FoxifyTradingNftAbi.abi` (and same for V2). Phase 1 exported the whole JSON object; viem requires the `.abi` array — fixed to unblock all TS2322 errors in Phase 2 hooks.

## Env vars
`.env` already contained all three vars (`VITE_ENABLE_NFT=true`, `VITE_OPENSEA_API_KEY=`, `VITE_NFT_MERKLE_PROOF_URL=`). No change needed.

## Key Adaptations

1. **Wallet**: `useMainAccount().address` → `useWallet().account` throughout (account is `string|undefined`).
2. **Eligibility API**: AXIOS → plain `fetch`; `process.env.NEXT_PUBLIC_FUNDED_FRONTEND_ID` → `FUNDED_FRONTEND_ID` from `config/funded` ("gmx-funded").
3. **OpenSea key**: was hardcoded `1080fc62...` in reference — replaced with `NFT_OPENSEA_API_KEY` from `config/nft` (env-sourced). Key omitted from headers if empty string.
4. **Merkle proof**: reference used Next.js same-origin proxy `/api/merkle-proof`; Vite has no server routes → calls upstream `NFT_MERKLE_PROOF_URL` directly. Returns null on CORS/network failure; mint UI must handle gracefully.
5. **Mutations**: "new NFT detection" snapshot+effect logic left in reference components — hooks only run tx + `invalidateQueries(['nft'])`. onSuccess callback pattern preserved.
6. **`'use client'`**: removed from NftContext (only relevant file with that directive in reference).
7. **`process.env.NEXT_PUBLIC_*`**: all replaced with config/nft or config/funded values.

## tscheck result
```
yarn tscheck 2>&1 | grep -iE "domain/nft" | grep -v "TS2786"
(empty — zero errors)
```

## Grep 1080fc62 check
```
grep -r "1080fc62" src/  → (empty — zero results)
```

## All files < 200 lines: YES (max 172 lines in use-user-nfts.ts)

## Unresolved Questions
- Q1 (from phase spec): Is `frontendId="gmx-funded"` confirmed working against `/funded/account-volume`? Phase spec says use it; eligibility will return API error if backend rejects it.
- Q2: Upstream `https://nft.foxify.trade/proof` likely lacks CORS headers — mint will silently fail in browser until a proxy is added. Mint UI should display "not eligible" gracefully when `useMerkleProof()` returns null.
