---
phase: 5
title: "Deferred Mode Switching Integration"
status: deferred
priority: P3
effort: "2d"
dependencies: [2, 3, 4]
---

# Phase 5: Deferred Mode Switching Integration

## Context Links

- Source mode provider: `mune-frontend-orderly/src/providers/FundedWalletProvider.tsx`
- Source switcher UI: `mune-frontend-orderly/src/components/FundedChallenges/SwitchFundedAccountPopover.tsx`
- Source Orderly wrapper: `mune-frontend-orderly/src/components/OrderlyClientProviders.tsx`
- Current wallet provider: `src/lib/wallets/WalletProvider.tsx`
- Current header user area: `src/components/AppHeader/AppHeaderUser.tsx`

## Overview

Implement normal/FUNDED mode switching after Start Journey and Dashboard UI are accepted. This is deferred because first priority is visible UI, and source mode behavior patches Orderly internals while current app runs GMX wallet/account flows.

## Requirements

- Functional: user can switch from normal account to a funded journey account.
- Functional: user can disconnect FUNDED mode and return to normal wallet without clearing unrelated GMX state.
- Functional: active mode is visible in header/banner and route guards.
- Functional: read-only funded mode is clearly labeled and blocks trading/withdraw actions.
- Non-functional: mode transitions must not trigger render loops or stale query cache.

## Architecture

Use a narrow adapter boundary:

```text
FundedModeProvider
  -> funded credentials store
  -> optional Orderly adapter
  -> header/banner
  -> trade/dashboard route guards
```

Two implementation options must be evaluated before coding:

| Option | Use when | Trade-off |
|--------|----------|-----------|
| UI/read-first adapter | Need start journey/dashboard visible quickly | No funded trading until Orderly integration is complete |
| Full Orderly adapter | Need funded trading mode immediately | Higher dependency and wallet conflict risk in React 18 current app |

Current decision: use UI/read-first surfaces now, then enable full Orderly trading only after compile/runtime spike proves compatibility.

## Related Code Files

- Modify: `src/App/App.tsx`
- Modify: `src/components/AppHeader/AppHeaderUser.tsx`
- Modify: `src/components/TradeBox/*` only if trading must respect FUNDED mode.
- Create: `src/context/FundedModeContext/FundedModeContextProvider.tsx`
- Create: `src/domain/funded/funded-mode-storage.ts`
- Create: `src/components/FundedChallenges/SwitchFundedAccountPopover.tsx`
- Create: `src/components/FundedModeBanner/FundedModeBanner.tsx`

## Implementation Steps

1. Port source switcher behavior into current context, removing source console diagnostics and Next-only code.
2. Add query cache invalidation boundaries when entering/exiting funded mode.
3. Add account switcher UI into `AppHeaderUser` or adjacent header action area.
4. Gate unsupported actions while funded mode is active: withdrawals, subaccounts, normal wallet-only actions, and trade actions if full Orderly adapter is not implemented.
5. If full Orderly is required, add spike work: install `@orderly.network/*`, mount providers, verify React 18 compatibility, isolate key storage and `_checkAccountExist` patch behavior.
6. Add robust disconnect/restore error handling.

## Todo List

- [ ] Revisit full Orderly adapter after UI review.
- [ ] Port switcher UI and mode state.
- [ ] Add header/banner mode indicator.
- [ ] Add route/action guards.
- [ ] Verify restore/disconnect flows.

## Success Criteria

- [ ] Normal mode remains unchanged after reload.
- [ ] FUNDED mode persists only intended state and can be cleared cleanly.
- [ ] Header clearly shows current mode and active funded controller.
- [ ] Unsupported actions are blocked with clear copy.

## Risk Assessment

- Risk: source mode code copies Orderly keys under MetaMask address and patches internal methods.
- Mitigation: do not port internal patch until Orderly integration is explicitly chosen and tested here.

## Security Considerations

- Secrets never stored longer than necessary.
- Disconnect clears funded account keys and does not clear unrelated user wallet/session keys.
- Read-only mode prevents trading and withdrawal operations.
