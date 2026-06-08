# NFT Feature — Phase 5 Verification Report

Date: 2026-06-06 | Branch: feat/funded-journey-preview | Feature: NFT (port from what-exchange)

## Scope verified
Full functional port of NFT staking/merge/migrate/mint + mint-eligibility into gmx-interface, gated behind `VITE_ENABLE_NFT`. Nav: "NFT" parent → "NFT Management" (/nft) + "Mint Eligibility" (/nft/eligibility).

## Results

### Type check (`yarn tscheck`)
- 0 new errors in NFT files (`src/config/nft.ts`, `src/domain/nft/**`, `src/components/Nft/**`, `src/pages/Nft*`, `src/components/SideNav/NftExpandableNavItem.tsx`).
- Pre-existing repo-wide `TS2786` ('X cannot be used as a JSX component', React-Router-v5 types skew, 125 instances) is unchanged — `NftExpandableNavItem` behaves identically to its `FundedExpandableNavItem` sibling. Not introduced by this work.

### Lint (`yarn eslint <nft paths>`)
- 0 errors. Fixed `local-rules/no-bigint-negation` in NftManagementPage (`!stakedNftId` → explicit `=== undefined`).
- Remaining warnings: `react-perf/jsx-no-new-object-as-prop` from dynamic inline styles (NFT level colors/glows, progress widths). Same warning class exists in committed FUNDED pages → codebase baseline, accepted.

### i18n (`yarn lingui:prepare`)
- Extract + compile succeeded; all new `t`/`<Trans>` strings registered (en source; other locales fall back to source until translated).

### Build (`vite build`)
- Default `yarn build` OOMs at the whole-app `transforming` stage (Node default heap too small for this app; `build` script does not set `--max-old-space-size`, unlike `test:ct`). Environmental, not NFT-specific.
- Rebuild with `NODE_OPTIONS=--max-old-space-size=8192`: **SUCCESS** — 27,665 modules transformed, built in 1m 38s, NFT route chunks emitted (`NftManagementPage-*.js`, `NftEligibilityPage-*.js`), zero errors. Confirms all NFT module/asset resolution (lazy routes, JSON ABI `.abi` imports, `svg?react`, `nft-placeholder.png`).

### Code review (adversarial)
- Verdict SHIP, 9/10, 0 critical / 0 high.
- Contract writes verified end-to-end vs reference: switchToArbitrum → simulate → write → waitForReceipt; correct ABI (`.abi` array), correct V2/V3 addresses, correct fn names/args (`updateUserActiveID`, merge, `setApprovalForAll`, migrate, mint).
- FUNDED regression: MainRoutes + SideNav edits purely additive; `/nft` + `/nft/eligibility` exact-matched, gated on `NFT_ENABLED`; FUNDED routes/nav unchanged.

## Known minors (parity-preserved vs what-exchange)
1. Stake picker lists Silver/Gold of either NFT version; a V2 selection is caught by `simulateContract` before signing (error toast, no funds at risk). Matches reference.
2. Merkle-proof upstream (`nft.foxify.trade/proof`) may need a CORS-enabled proxy before whitelist mint succeeds from the gmx origin in prod; degrades gracefully to "not whitelisted".

## Unresolved questions (runtime/backend — not blocking compile)
1. Does `/funded/account-volume` accept `frontendId=gmx-funded` from the gmx domain? (eligibility volume source)
2. Backend must register `"gmx_nft_mint"` as a valid newsletter context string.
3. Confirm wave dates/snapshot/targets (Jul 2026, 125k/250k) are correct for the gmx launch (currently verbatim from reference, centralized in `domain/nft/nft-waves.ts`).
4. Populate `VITE_OPENSEA_API_KEY` (optional; metadata works via on-chain + Foxify fallback without it).
