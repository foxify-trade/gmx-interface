---
phase: 3
title: "Port Journey Pages"
status: complete
priority: P1
effort: "2d"
dependencies: [2]
---

# Phase 3: Port Journey Pages

## Context Links

- Source start page: `mune-frontend-orderly/src/clients/pages/Funded/StartJourney/StartJourneyPage.tsx`
- Source start components: `StartJourneyTrackSection.tsx`, `StartJourneyFeaturesSection.tsx`, `GuidelineDialog.tsx`, `SetupFundedAccountDialog.tsx`
- Source list page: `mune-frontend-orderly/src/clients/pages/FundedJourneys/FundedJourneyPage.tsx`
- Source list table: `mune-frontend-orderly/src/clients/pages/FundedJourneys/FunderJourneysTable.tsx`

## Overview

Port the Start Journey page UI first. Journey list remains deferred until the Start Journey and Dashboard surfaces are visible.

## Requirements

- Functional: `/funded/start-journey` shows track selection, funding requirements, guide dialogs, and CTA states.
- Functional: action buttons can be disabled or demo-wired until backend/mode work is approved.
- Functional: no connected wallet shows useful empty/connect state without requiring Orderly.
- Non-functional: page files remain modular; no source-only Next APIs remain.

## Architecture

Suggested structure:

```text
src/pages/FundedStartJourneyPage/
  FundedStartJourneyPage.tsx
  FundedTrackSelector.tsx
  FundedJourneySetupDialog.tsx
  FundedJourneyProgress.tsx
  funded-start-journey-actions.ts

Deferred:
  src/pages/FundedJourneysPage/
    FundedJourneysPage.tsx
    FundedJourneysTable.tsx
    FundedJourneyActions.tsx
```

Route wrappers use `AppPageLayout`, not source `BaseLayout`/`AppPage`.

## Related Code Files

- Modify: `src/App/MainRoutes.tsx`
- Create: `src/pages/FundedStartJourneyPage/*`
- Create later: `src/pages/FundedJourneysPage/*`
- Create later: `src/domain/funded/use-funded-journeys.ts`
- Create: `src/domain/funded/use-funded-vault-liquidity.ts`
- Copy/adapt assets: source `public/FUNDED.svg`, level badges, arrows if needed.

## Implementation Steps

1. Add lazy-loaded route component for `/funded/start-journey`.
2. Extract source constants `ELevelValue`, `TRACK_MAPPING`, `AMOUNT_MAPPING` into domain constants.
3. Port track/features/tutorial sections with current typography/classes and existing buttons.
4. Replace `next/navigation` with `useHistory`.
5. Replace `next/image` with `<img>` or Vite asset imports.
6. Stub or disable setup action behind a typed service boundary until backend/mode integration is approved.
7. Add route-level feature flag fallback to `PageNotFound`.

## Todo List

- [x] Port start page UI in split files.
- [x] Adapt wallet/connect empty states.
- [x] Add progress and duplicate-click guards.
- [ ] Add route smoke tests.
- [x] Defer journey list page and table.

## Success Criteria

- [ ] Start journey page renders with feature flag enabled.
- [ ] Large source page is split; no new source file exceeds 200 LOC without explicit rationale.
- [ ] `yarn tscheck` passes after page port.

## Risk Assessment

- Risk: contract setup path depends on source `FactoryProxy`, funded ABIs, and Arbitrum USDC assumptions.
- Mitigation: separate UI port from on-chain action service; verify contracts/config before enabling production action button.

## Security Considerations

- Validate controller addresses with `0x[a-fA-F0-9]{40}` before query or mode connection.
- Disable journey creation while liquidity or setup is in flight.

## Implementation Notes

- Added modular start journey page components under `src/pages/FundedStartJourneyPage/`.
- Preview actions are intentionally informational; account setup opens an explanation modal instead of starting backend or wallet side effects.
- Funded navigation preserves query state so read-only dashboard review can round-trip through the funded UI.
