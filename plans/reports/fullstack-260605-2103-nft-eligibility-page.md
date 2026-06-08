# Phase 04 Implementation Report — NFT Eligibility Page

## Phase
- Phase: phase-04-nft-eligibility-page
- Plan: plans/260605-2103-nft-feature-integration/
- Status: completed

## Files Created / Modified

| File | Lines | Action |
|------|-------|--------|
| `src/domain/nft/nft-mint-newsletter-context.ts` | 24 | created |
| `src/components/Nft/eligibility/NftEligibilityHero.tsx` | 60 | created |
| `src/components/Nft/eligibility/NftEligibilityPerks.tsx` | 46 | created |
| `src/components/Nft/eligibility/SnapshotCountdownBanner.tsx` | 30 | created |
| `src/components/Nft/eligibility/VolumeProgress.tsx` | 72 | created |
| `src/components/Nft/eligibility/WaveCard.tsx` | 77 | created |
| `src/components/Nft/eligibility/EligibilityWalletInput.tsx` | 88 | created |
| `src/components/Nft/eligibility/NftMintEmailReminder.tsx` | 98 | created |
| `src/components/Nft/eligibility/NftMintReminderDialog.tsx` | 24 | created |
| `src/components/Nft/eligibility/NftMintReminderButton.tsx` | 44 | created |
| `src/pages/NftEligibilityPage/NftEligibilityPage.tsx` | 112 | replaced placeholder shell |

All files < 200 lines. No Phase 3 or other files modified.

## Tasks Completed

- [x] `nft-mint-newsletter-context.ts` — ported + added `gmx_funded`/`gmx` case → returns `"gmx_nft_mint"`
- [x] `SnapshotCountdownBanner`, `VolumeProgress`, `WaveCard`, `NftEligibilityHero`, `NftEligibilityPerks`
- [x] `EligibilityWalletInput` — inline wallet icon SVG, `useWallet().account`, Button primitive
- [x] `NftMintEmailReminder` — `SUBSCRIBE_URL`, email regex, success/error states, `getNftMintNewsletterContext()`
- [x] `NftMintReminderDialog` (NftDialog adapter) + `NftMintReminderButton`
- [x] `NftEligibilityPage` — wired `useNftEligibility` + all sub-components; `EligibilityStatusBanner` inline
- [x] Lingui `t`/`<Trans>` on all visible strings
- [x] tscheck passes (excl. pre-existing TS2786)

## Key Mappings Applied

| Reference | Target |
|-----------|--------|
| `Button` (@orderly) | `Button` from `components/Button/Button` (variant="primary"\|"secondary") |
| `Dialog`/`DialogContent` | `NftDialog` adapter (already existed from Phase 3) |
| `toast` | `helperToast` (not needed on this page) |
| `clsx`/`cn` | `cx` from `classnames` |
| `next/image` | `<div>` placeholder (no Next.js) |
| `useAccount().state.address` | `useWallet().account` from `lib/wallets/useWallet` |
| `process.env.NEXT_PUBLIC_FUNDED_FRONTEND_ID` | `FUNDED_FRONTEND_ID` from `config/funded` |
| `--color-foxify-primary` CSS var | Tailwind `text-blue-400` / `bg-blue-400` |
| lucide icons | Inline SVG (X, Wallet, Bell) |

## Newsletter Context Value

`FUNDED_FRONTEND_ID = "gmx-funded"` → normalized to `"gmx_funded"` → returns `"gmx_nft_mint"`.

## tscheck (excl. TS2786)

```
yarn tscheck 2>&1 | grep -iE "components/Nft/eligibility|NftEligibilityPage|nft-mint-newsletter" | grep -v "TS2786"
(no output — clean)

yarn tscheck 2>&1 | grep -v "TS2786" | grep -iE "error TS" | wc -l
0
```

## Issues Encountered

None. `EligibilityWalletInput` receives `useWallet` internally (avoids prop-drilling `hasConnectedWallet`), matching the hook pattern used in Phase 2.

## Unresolved Questions

- Q1: Does `/funded/account-volume` accept `frontendId=gmx-funded`? (API parity — runtime concern, not a compile issue)
- Q2: Newsletter context `"gmx_nft_mint"` confirmed per spec instruction; backend must register this string.
- Q3: Snapshot date Jul 1 2026 / wave dates Jul 2–3 hardcoded in Phase-2 `nft-waves.ts` / countdown — presentational; confirm with team.
