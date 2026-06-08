# Phase 04 — NFT Eligibility Page

## Context Links
- Plan: [plan.md](plan.md) | Depends on: Phase 01, 02 | Parallel with: Phase 03
- Reference page: `git show origin/what-exchange:src/clients/pages/NftEligibility/NftEligibilityPage.tsx` (162 lines)
- Components: `.../components/{NftEligibilityHero(71),NftEligibilityPerks(47),EligibilityWalletInput(88),WaveCard(73),VolumeProgress(75),SnapshotCountdownBanner(21),NftMintReminderButton(29),NftMintReminderDialog(131),NftMintEmailReminder(140)}.tsx`
- `.../getNftMintNewsletterContext.ts`
- Hooks/config (Phase 2): `use-nft-eligibility.ts`, `use-volume-snapshot-countdown.ts`, `nft-waves.ts`.

## Overview
- Priority: P1
- Status: pending
- Build `/nft/eligibility`: hero, check-eligibility card (wallet input → volume fetch → status banner + 2 wave cards + snapshot countdown + volume progress), email mint-reminder, and perks grid. All display logic; minimal web3 (eligibility is API-driven, mint waves come from Phase-2 hooks/config).

## Key Insights
- Eligibility data comes from Phase-2 `use-nft-eligibility.ts` (volume via `${FUNDED_PUBLIC_API_URL}/funded/account-volume`). No new web3 here.
- Newsletter subscribe: `POST https://api.foxify.trade/newsletter/subscribe` body `{email, context}`. `context` from `getNftMintNewsletterContext()` — port but map gmx frontend id (`gmx-funded` → add a `gmx`/`gmx_funded` case returning e.g. `gmx_nft_mint`; confirm value w/ user, Unresolved Q2). Replace `process.env.NEXT_PUBLIC_FUNDED_FRONTEND_ID` → `FUNDED_FRONTEND_ID` (config/funded).
- Same UI mappings as Phase 3: Orderly `Button`→`components/Button`, `SafeDialog`→`NftDialog` adapter (built Phase 3 — Phase 4 depends on it for reminder dialog), `toast`→`helperToast`, `clsx`→`cx`, lucide icons inline, `next/link`→`Link`.
- All component sizes < 200 lines → no splitting needed.
- `useAccount().state.address` (connected wallet prefill) → `useWallet().account`.

## Requirements
Functional: address validation + "use connected wallet"; volume fetch + status (0/1/2 mints); 2 wave cards; live snapshot countdown; volume progress bar vs 250k; email reminder w/ validation + subscribe POST; perks grid.
Non-functional: strings via Lingui; responsive; countdown timer cleans up interval.

## Architecture
Data flow: `EligibilityWalletInput` → `use-nft-eligibility.check()` sets checkedAddress → react-query fetch volume → `result` object → drives StatusBanner/WaveCards/VolumeProgress. `use-volume-snapshot-countdown` ticks 1s for `SnapshotCountdownBanner`. Email reminder is independent POST.

## Related Code Files
Create under `src/pages/NftEligibilityPage/`:
- `NftEligibilityPage.tsx` — fill Phase-1 shell; `AppPageLayout title="NFT Eligibility"`; compose hero + check section + reminder + perks; use `useEligibility` + `useVolumeSnapshotCountdown`.
Create under `src/components/Nft/eligibility/`:
- `NftEligibilityHero.tsx`, `NftEligibilityPerks.tsx`, `EligibilityWalletInput.tsx`, `WaveCard.tsx`, `VolumeProgress.tsx`, `SnapshotCountdownBanner.tsx`, `NftMintReminderButton.tsx`, `NftMintReminderDialog.tsx`, `NftMintEmailReminder.tsx`.
Create under `src/domain/nft/`:
- `nft-mint-newsletter-context.ts` — port `getNftMintNewsletterContext.ts` (add gmx case).

## Implementation Steps
1. Port `nft-mint-newsletter-context.ts` (Phase-2 dir); swap env source + add gmx mapping.
2. Port leaf display components: `SnapshotCountdownBanner`, `VolumeProgress`, `WaveCard`, `NftEligibilityHero`, `NftEligibilityPerks` (mostly markup; swap `clsx`→`cx`, inline icons).
3. Port `EligibilityWalletInput.tsx`: input + "Use connected wallet" (`useWallet().account`) + Clear; map Buttons.
4. Port `NftMintEmailReminder.tsx`: keep `SUBSCRIBE_URL`, email regex, success/error states; `context = getNftMintNewsletterContext()`.
5. Port `NftMintReminderDialog.tsx` (uses `NftDialog` adapter) + `NftMintReminderButton.tsx` (opens dialog).
6. Port `NftEligibilityPage.tsx`: wire `useEligibility` (inputAddress/setInputAddress/check/useConnectedWallet/reset/result) + `useVolumeSnapshotCountdown`; render error banner, status banner, wave grid, countdown, volume progress, divider + reminder button, perks.
7. Apply Lingui to all strings.
8. tscheck + visual smoke (flag on).

## Todo List
- [ ] `nft-mint-newsletter-context.ts` (gmx mapping)
- [ ] `SnapshotCountdownBanner`, `VolumeProgress`, `WaveCard`, `NftEligibilityHero`, `NftEligibilityPerks`
- [ ] `EligibilityWalletInput`
- [ ] `NftMintEmailReminder`
- [ ] `NftMintReminderDialog` + `NftMintReminderButton`
- [ ] `NftEligibilityPage` (compose + wire hooks)
- [ ] Lingui strings
- [ ] tscheck passes

## Success Criteria
- `/nft/eligibility` (flag on) renders hero + check card + perks.
- Entering a valid address (or "use connected wallet") fetches volume → shows qualified mints (0/1/2), 2 wave cards, live countdown, progress bar.
- Invalid address → inline error; API failure → error banner.
- Email reminder validates + POSTs subscribe, shows success state.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| `/funded/account-volume` rejects gmx frontendId | Med×Med | Confirm id (Unresolved Q1). Page degrades to error banner. |
| Newsletter subscribe CORS/context mismatch | Med×Low | `api.foxify.trade` already used by FUNDED (`funded.ts:38`). Confirm gmx context string (Q2). |
| Countdown interval leak | Low×Low | Port `clearInterval` cleanup verbatim. |
| Hardcoded snapshot date (Jul 1 2026) wrong for gmx | Med×Med | Date is presentational/config; confirm dates w/ user (Q3). Centralized in `nft-waves.ts`/countdown hook. |

## Security Considerations
- Email input validated client-side before POST; no PII stored locally.
- Wallet address input validated by regex before any fetch.
- No signing on this page.

## Next Steps
- Phase 5: i18n extract/compile, build, QA both pages + FUNDED regression.
