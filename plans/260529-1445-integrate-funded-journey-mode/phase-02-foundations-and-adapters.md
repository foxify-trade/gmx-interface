---
phase: 2
title: "Foundations And Adapters"
status: complete
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Foundations And Adapters

## Context Links

- Current providers: `src/App/App.tsx`, `src/lib/wallets/WalletProvider.tsx`
- Source providers: `mune-frontend-orderly/src/components/OrderlyClientProviders.tsx`
- Source store: `mune-frontend-orderly/src/clients/stores/fundedSwitcherStore.ts`
- Source env: `mune-frontend-orderly/src/clients/configs/env/client.ts`

## Overview

Add minimum foundations needed for the first UI pass: feature flag/env, typed data boundaries, route constants, and lightweight UI adapters. Full mode switching and Orderly credentials are deferred.

## Requirements

- Functional: centralize FUNDED config using temporary app/frontend display identity `GMX`.
- Functional: expose typed demo/read data boundaries for start journey and funded dashboard UI.
- Functional: keep route feature flags simple and independent from trading mode.
- Non-functional: no credential logging; localStorage keys must be app-prefixed and tab-safe where needed.

## Architecture

Create a current-app-native FUNDED UI layer:

```text
config/funded -> domain/funded typed data -> pages
```

For first UI pass, avoid `FundedModeProvider` unless the page needs a small read-only context. Do not import source `FundedWalletProvider.tsx` wholesale. It is 800+ LOC and tightly coupled to Orderly SDK internals.

## Related Code Files

- Modify: `package.json` only after dependency decision.
- Modify: `src/App/App.tsx`
- Modify: `src/App/MainRoutes.tsx`
- Create: `src/config/funded.ts`
- Create: `src/domain/funded/funded-api.ts`
- Create: `src/domain/funded/funded-types.ts`
- Create: `src/domain/funded/funded-demo-data.ts`
- Create later: `src/domain/funded/use-funded-mode.tsx`
- Create later: `src/components/FundedModeBanner/FundedModeBanner.tsx`
- Create later: `src/components/FundedModeSwitcher/FundedModeSwitcher.tsx`

## Implementation Steps

1. Add `VITE_ENABLE_FUNDED` and temporary GMX identity config in `src/config/funded.ts`.
2. Port only types needed for Start Journey and Challenge Dashboard from `FundedDashboard.ts` and start journey constants.
3. Add typed read/data functions that can return demo data until backend details are confirmed.
4. Add route guards that hide FUNDED UI when feature flag is off.
5. Defer mode provider, switcher, and Orderly SDK package changes.

## Todo List

- [x] Add temporary GMX identity config.
- [x] Add typed env/config.
- [x] Add typed UI data boundaries.
- [x] Add feature-gated route helpers.
- [x] Defer mode context with normal/funded/readonly states.

## Success Criteria

- [ ] App compiles with foundations and feature-gated FUNDED UI routes.
- [ ] Normal GMX wallet behavior is unchanged when `VITE_ENABLE_FUNDED` is not true.
- [ ] UI data boundaries can be tested without live wallet or backend.

## Risk Assessment

- Risk: full Orderly SDK import may conflict with React 18/current wallet stack.
- Mitigation: isolate mode state and read-only API pages first; integrate Orderly trading credentials only after dependency compile check.

## Security Considerations

- Do not log `orderlySecret`, signatures, auth responses, or controller private data.
- Keep localStorage key names prefixed by frontend ID.
- Clear funded keys on disconnect and failed restore.

## Implementation Notes

- Added `src/config/funded.ts` for `VITE_ENABLE_FUNDED`, optional `VITE_FUNDED_API_URL`, route constants, and preview copy.
- Added `src/domain/funded/*` for typed track data, dashboard adapters, controller sanitization, and live/demo source selection.
- Deferred funded mode provider and Orderly wallet integration remain untouched.
