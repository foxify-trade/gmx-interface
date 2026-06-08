# Phase 03 — NFT Management Page (sections + dialogs)

## Context Links
- Plan: [plan.md](plan.md) | Depends on: Phase 01, 02 | Parallel with: Phase 04
- Reference page: `git show origin/what-exchange:src/clients/pages/Nft/NftPage.tsx`
- Reference components: `.../components/{NftStakingSection,MigrateAndMintSection,YourNftsSection,NftCard,NftSelectDialog,NftDetailDialog,NftMergeSelectionDialog,MergeWarningDialog,NftSuccessDialog}.tsx`
- UI primitive mapping table: see plan.md.

## Overview
- Priority: P1
- Status: pending
- Build the `/nft` management page: header copy, staking section (preview + stake/unstake/merge/buy), migrate+mint section, your-NFTs grid w/ sort, and all 6 dialogs. Wire reference's embedded mutations to Phase-2 hooks; keep snapshot+effect "new NFT detection" in the section components (migration/mint/merge success).

## Key Insights
- gmx deps: `classnames` (use `cx`), NO `clsx` (swap), NO `lucide-react` → inline the ~5 used icons (`ArrowRight`,`Sparkles`,`Lock`) as small SVGs or reuse `src/img` assets (YAGNI: avoid adding dep). NO `next/image`/`next/link` → use `<img>` + `Link`.
- Orderly `Button` → `components/Button/Button` (needs `variant`; no `loading`/inline color `style`). Map `<Button loading={x}>` → `<Button disabled={x}>{x ? <Spinner/> : label}</Button>` (use existing spinner if any; else disabled state). Map `style={{background:'rgb(var(--color-foxify-primary))'}}` → Tailwind `bg-blue-400` (per `tailwind.config.ts`).
- Orderly `SafeDialog*` → gmx `Modal` (`isVisible`/`setIsVisible`/`label`). Build one adapter `src/components/Nft/NftDialog.tsx` exposing `{open,onOpenChange,title,children}` mapped onto `Modal` → keeps the 6 reference dialogs portable with minimal edits (DRY).
- `toast` → `helperToast` (`lib/helperToast`).
- `NftDetailDialog` (247) and `NftMergeSelectionDialog` (256) exceed 200 lines → split (extract presentational subcomponents).
- Mint section in reference is commented-out/hidden (JSX block commented). Port it but keep gated behind `isMintActive && isWhitelisted` (effectively off until merkle/CORS resolved — see Phase 2 risk).
- `PathEnum.Nft` references → `NFT_ROUTES.management`.

## Requirements
Functional parity: stake/unstake (V3), merge (5 Bronze→Silver per `MergeWarningDialog` logic), migrate V2→V3 (approve→migrate), mint (gated), NFT grid w/ sort + selection, detail view, success popups, buy-on-OpenSea link.
Non-functional: every file < 200 lines (split where needed); all strings via Lingui; responsive grid preserved.

## Architecture
Data flow: `NftManagementPage` calls Phase-2 `useUserV2Nfts`+`useUserV3Nfts`+`useUserStakedNft` → merges → `nftsWithStakedStatus` → `<NftProvider>` (Phase-2 context). Sections read context (`useNftContext`) for nfts/stakedNft/selection. Mutations via Phase-2 hooks; on success → `refetch()` (invalidate `['nft']`) + snapshot/effect detects new token → success dialog.

## Related Code Files
Create under `src/pages/NftManagementPage/`:
- `NftManagementPage.tsx` — fill Phase-1 shell: `AppPageLayout` + header copy + `<NftProvider>` + 3 sections. Port `NftPage.tsx` merge/staked/refetch logic (drop `'use client'`, swap `useQueryClient` stays).
Create under `src/components/Nft/`:
- `NftDialog.tsx` — Modal adapter (`open`/`onOpenChange`/`title`/`size`→Modal props).
- `NftStakingSection.tsx` — port; swap Button/toast/Dialog/wallet; extract `ExtraFundingTiers` (only used in `startJourney` variant — keep variant for future FUNDED reuse, but default page doesn't render it; YAGNI: keep minimal). Use `useStakeNft`/`useUnstakeNft`.
- `MigrateAndMintSection.tsx` — port; use `useApproveV2`/`useMigrateNfts`/`useMintNft`/`useCurrentMintWave`/`useHasClaimed`/`useMerkleProof`; keep migration/mint snapshot+effect detection here; map error dialog to `NftDialog`.
- `YourNftsSection.tsx` — port (grid + sort dropdown); uses context selection.
- `NftCard.tsx` — port (93 lines, level badge + staked indicator).
- `NftSelectDialog.tsx` — port (stake picker).
- `NftDetailDialog.tsx` — port + SPLIT into `NftDetailDialog.tsx` + `NftDetailAttributes.tsx` (<200 each).
- `NftMergeSelectionDialog.tsx` — port + SPLIT into `NftMergeSelectionDialog.tsx` + `NftMergeSelectionGrid.tsx`.
- `MergeWarningDialog.tsx` — port (merge mutation via `useMergeNfts`; keep snapshot+effect new-NFT detection).
- `NftSuccessDialog.tsx` — port + SPLIT if > 200 (extract old/new NFT preview row).

## Implementation Steps
1. Build `NftDialog.tsx` adapter first (all dialogs depend on it). Map `open→isVisible`, `onOpenChange→setIsVisible`, `title→label`, children→Modal body.
2. Port `NftCard.tsx` (simplest), then `NftSuccessDialog`, `NftSelectDialog`.
3. Port `YourNftsSection.tsx` (grid + sort) using context.
4. Port `NftDetailDialog` + split attributes subcomponent.
5. Port `NftMergeSelectionDialog` + split grid subcomponent; `MergeWarningDialog` with `useMergeNfts` + success detection effect.
6. Port `NftStakingSection.tsx`: replace Buttons, wire `useStakeNft`/`useUnstakeNft({onSuccess: ()=>{helperToast.success(...); refetch()}})`, dialogs via `NftDialog`/`NftSelectDialog`/`NftMergeSelectionDialog`/`MergeWarningDialog`.
7. Port `MigrateAndMintSection.tsx`: wire approve/migrate/mint hooks; keep both `useEffect` detection blocks; mint JSX stays gated (port the commented block as a flag-gated render, default hidden).
8. Fill `NftManagementPage.tsx`: header `<Trans>` copy (10% Silver / 25% Gold / EXCEPT app.foxify.trade), `<NftProvider nfts stakedNft isLoading refetch>`, render 3 sections inside `AppPageLayout title="NFTs"`.
9. Replace every `clsx`→`cx` (classnames), inline lucide icons, `PathEnum.Nft`→`NFT_ROUTES.management`.
10. Replace `--color-foxify-primary` usages with Tailwind token; verify against `tailwind.config.ts`/`config/colors.ts`.
11. tscheck + visual smoke (flag on).

## Todo List
- [ ] `NftDialog.tsx` adapter
- [ ] `NftCard.tsx`, `NftSuccessDialog.tsx`, `NftSelectDialog.tsx`
- [ ] `YourNftsSection.tsx`
- [ ] `NftDetailDialog.tsx` (+ attributes split)
- [ ] `NftMergeSelectionDialog.tsx` (+ grid split), `MergeWarningDialog.tsx`
- [ ] `NftStakingSection.tsx`
- [ ] `MigrateAndMintSection.tsx`
- [ ] `NftManagementPage.tsx` (header + provider + sections)
- [ ] icon/dep/CSS-var mappings applied
- [ ] tscheck passes

## Success Criteria
- `/nft` (flag on) renders header, staking preview (staked NFT glow), grid of user NFTs, migrate section.
- Stake/unstake/merge/migrate execute on Arbitrum (chain switch prompt), show success dialog, list refreshes.
- Buy button opens OpenSea collection. All dialogs open/close via Modal.
- No file > ~200 lines. No `clsx`/`lucide-react`/`next/*` imports remain.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Button lacks `loading`/inline color → visual regressions | Med×Low | Adapter pattern: disabled+spinner; Tailwind classes for color. Review against reference screenshots in QA. |
| Modal adapter behavior differs (focus/scroll) | Med×Med | gmx Modal handles ESC/scroll-lock already; adapter just maps props. Test each dialog open/close. |
| Mint path broken (merkle CORS) | High×Low | Keep mint gated/hidden by default; document enabling requirement. |
| Snapshot/effect detection lost in port | Med×High | Port the two `useEffect` blocks verbatim into `MigrateAndMintSection`; merge effect into `MergeWarningDialog`. Don't move into hooks. |

## Security Considerations
- All writes re-simulate on Arbitrum (Phase-2 hooks) → no wrong-chain signing.
- OpenSea buy link is static external URL (`opensea.io/collection/foxify-funded-bonus-nft-1`).
- No user input reaches contract except own token IDs (read from chain).

## Next Steps
- Phase 5 i18n extract picks up all new `t`/`<Trans>` strings; QA validates flows.
