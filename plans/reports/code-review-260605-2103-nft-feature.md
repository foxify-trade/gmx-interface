# Code Review — NFT Feature Port (staking/merge/migrate/mint + eligibility)

Date: 2026-06-06 | Reviewer: code-reviewer (adversarial, read-only)
Scope: new `src/domain/nft/*`, `src/components/Nft/*`, NFT pages, nav item, config; shared `MainRoutes.tsx`, `SideNav.tsx`, `.env`.
Reference parity: `mune-frontend-orderly@origin/what-exchange`.

## Verdict: SHIP — Score 9/10

Port is faithful to the reference. Contract calls (function names, arg order, ABI, address, chain-switch, simulate→write→receipt) all match. FUNDED routes/nav untouched. No security regressions, no hardcoded key, no `next/clsx/lucide/@orderly` leakage, JSON ABIs export `.abi` (verified arrays len 66/73), no TS errors in NFT files. Findings below are LOW (parity-preserved pre-existing behaviors) + INFO.

---

## CRITICAL
None.

## HIGH
None.

## MEDIUM
None.

## LOW

### L1 — Stake select dialog does not filter V2 (parity-preserved, not a regression)
`src/components/Nft/NftStakingSection.tsx:44` `hasUnstakedNfts = nfts.some(n => !n.isStaked)` and `src/components/Nft/NftSelectDialog.tsx:37` `availableNfts` filter out staked + Bronze but NOT V2.
Issue: `nfts` is V2∪V3. A user holding only un-migrated V2 Silver/Gold sees "Stake Now" enabled and the V2 token in the select list. Selecting it calls `updateUserActiveID` against the V3 contract (`use-nft-staking-mutations.ts:31`) → `simulateContract` reverts → toast "Transaction failed". Only V3 is stakeable.
Parity: IDENTICAL to reference (`NftSelectDialog.tsx:33-34`, staking section `:154`). Not introduced by the port. Flagging because locked-decision #5 says "only V3 stakeable".
Fix (optional, also fix upstream): add `.filter(n => n.version === NftVersion.V3)` to `availableNfts` in NftSelectDialog and to `hasUnstakedNfts` in NftStakingSection.

### L2 — `useHasClaimed` disabled when wave id === 0
`src/domain/nft/use-nft-merge-config.ts:96` `enabled: !!account && waveId > BigInt(0)`. If contract's `currentWave` legitimately has id 0, `hasClaimed` stays `undefined` and mint gating treats it as not-claimed.
Parity: IDENTICAL to reference (`useNftData.ts:548`). Mint disabled-guard uses `!!hasClaimed` so undefined → falsy → does not wrongly block; worst case a re-mint attempt reverts on-chain via simulate. Acceptable, preserve.

### L3 — Wallet client created without `account` binding
`src/domain/nft/contracts/arbitrum-wallet-client.ts` returns `createWalletClient({ chain, transport: custom })` with no `account`. All `writeContract` calls pass `account` explicitly (verified in both mutation files), so this is correct. No action — noting because it relies on every caller passing `account`; both current callers do.

## INFO / Verified-good (no action)

- **FUNDED regression: NONE.** `MainRoutes.tsx` diff purely additive: 5 lazy wrappers + 5 `<Route exact>` (3 funded already present + `/nft`, `/nft/eligibility`) inserted before catch-all `<Route path="*">`. Both NFT routes `exact` → `/nft` does not shadow `/nft/eligibility`. Both gate on `NFT_ENABLED ? <Page/> : <PageNotFound/>`. SideNav slimming (removed Earn/Pools/Stats/Referrals/Ecosystem) is from prior commit `05356fb07`, not this port; NFT change is the additive `{NFT_ENABLED && <NftExpandableNavItem/>}` after the FUNDED line. Nav item correctly gated.
- **Contract calls verified vs reference:** stake/unstake `updateUserActiveID([tokenId])` / `([0])`; merge `merge([tokenIds, mergeLevel])` mergeLevel=Bronze; approve `setApprovalForAll([V3addr, true])` on V2 (no simulate — matches ref); migrate `migrate([versions(=1n), tokenIds])`; mint `mintRequest([proof])`. All do switchToArbitrum → simulate (except approve, per ref) → writeContract → waitForTransactionReceipt with status check. ABI = `FOXIFY_V3_NFT_ABI` (`.abi`), addresses V3 vs V2 correct.
- **Reads:** query keys stable & include `account`; `enabled: !!account`; bigint via `=== BigInt(0)` (no `!bigint`); V2 uses `usersIDsList`/`data`, V3 uses `usersIDsLength`/`usersIDsList`/`usersActiveID`/`data`. `allNfts` key `[...,v2.length,v3.length]` matches ref.
- **Eligibility:** result shape byte-for-byte equals ref `EligibilityResult`; `isValidAddress` regex gate before fetch; `frontendId = FUNDED_FRONTEND_ID = "gmx-funded"` (verified `config/funded.ts:24`); targets 125k/250k; `qualifiedMints` 0/1/2 ladder matches ref; waves verbatim (Jul 2/3 2026).
- **Parity effects preserved:** merge snapshot+effect (MergeWarningDialog), migrate & mint snapshot+effect (MigrateAndMintSection) all ported including pre-refetch tokenId snapshot to detect newly minted NFT. Merge enforces exactly 5 same-level Bronze→Silver. Context `canMerge` (≥2 same-level, no Gold) matches ref.
- **Security:** `grep 1080fc62 = 0` (no hardcoded OpenSea key); `.env` `VITE_OPENSEA_API_KEY=` empty (no secret committed); OpenSea key read from env, sent as `x-api-key` only when present; writes re-simulate on Arbitrum public client; email regex + address regex validated; merkle proof failures degrade to null (not whitelisted), retry:false on CORS.
- **NftDialog adapter:** maps `open→isVisible`, `onOpenChange→setIsVisible`, `title→label` — open/close both directions OK.
- **Bundler-safety:** JSON ABI via `.abi`; svg?react imports resolve (`ic_chevron_down/right`, `ic_star_gradient` exist); no `clsx/lucide-react/next/*/@orderly` imports remain; `tsc --noEmit` clean for NFT files (excluding accepted repo-wide TS2786).
- **Newsletter context:** `getNftMintNewsletterContext()` → "gmx_funded" → returns `"gmx_nft_mint"` (locked decision). Subscribe URL + body `{email, context}` match ref.
- **Metadata fallback:** onchain `tokenURI` → OpenSea → `api.foxify.trade/funded/nfts` → null (placeholder). Matches locked decision.
- **Countdown:** `Date.UTC(2026, 6, 1, 20,0,0)` = Jul 1 2026 20:00 UTC (month 0-indexed, correct).

## Unresolved questions
1. L1: should V2 be filtered from stake list in the gmx port (deviating from ref) or kept parity-identical? Recommend filter — current ref behavior lets a V2-only user hit a confusing on-chain revert.
2. Merkle proof endpoint (`nft.foxify.trade/proof`) CORS in production — hook degrades gracefully but mint will be unreachable for whitelisted users if CORS blocks. Confirm a proxy is planned (noted in code comment).
