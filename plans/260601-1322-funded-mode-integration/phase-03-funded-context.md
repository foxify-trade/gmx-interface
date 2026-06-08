# Phase 03 — FundedContext: State Store + Connect/Disconnect

**Status:** pending
**Priority:** P0
**Est. LOC:** ~200
**Depends on:** Phase 01, 02

## Context

Reference:
- `mune-frontend-orderly/src/clients/stores/fundedSwitcherStore.ts` — atom store API
- `mune-frontend-orderly/src/providers/FundedWalletProvider.tsx` — connect/disconnect orchestration
- gmx-interface existing context style: `src/context/GmxAccountContext/`

## Key insights

- gmx-interface uses React context + `use-context-selector`. Mirror that pattern (not Jotai).
- Persistence: read on mount, write on every state change. Use `funded-storage.ts` helpers from phase 01.
- `isSwitchingMode` is critical — UI must hide funded badges during transition or it flickers.
- On mount: rehydrate from localStorage. If `fundedAccountInfo` present, set `isFundedMode=true` silently.

## Requirements

Provider state:
- `isFundedMode: boolean`
- `isSwitchingMode: boolean`
- `fundedAccount: Address | null`
- `fundedAccountInfo: FundedAuthResponse | null`
- `connectedControllerAddress: Address | null`
- `isReadOnly: boolean`

Actions:
- `connectFunded(controllerAddress: Address): Promise<void>`
- `disconnectFunded(): void`

Hook: `useFundedContext()` (selector-based)

## Files

**Create:**
- `src/context/FundedContext/funded-context.ts` (createContext + types)
- `src/context/FundedContext/FundedContextProvider.tsx`
- `src/context/FundedContext/use-funded-context.ts`
- `src/context/FundedContext/index.ts`

## Implementation steps

1. `funded-context.ts`: `createContext<FundedContextValue | null>(null)` using `use-context-selector`.
2. `FundedContextProvider.tsx`:
   - `useState` for each field; hydrate from `readFundedStorage` on mount
   - `useEffect` writes each field to storage on change
   - `connectFunded(controllerAddress)`:
     1. `setIsSwitchingMode(true)`
     2. `const auth = await authenticateFunded({ walletClient, address, chainId, controllerAddress })`
     3. Write `aes-encrypt-pk(auth.operatorPrivateKey, mainAddress)` to a new storage slot `funded:subaccountPk` (consumed in phase 04 by SubaccountContext)
     4. `setFundedAccount(auth.operatorWalletAddress)`, `setFundedAccountInfo(auth)`, `setConnectedControllerAddress(controllerAddress)`, `setIsReadOnly(!!auth.readOnly)`
     5. `setIsFundedMode(true)`; `setIsSwitchingMode(false)`
     6. `queryClient.invalidateQueries()`
     7. On error: clear all funded state + rethrow
   - `disconnectFunded()`:
     1. Clear funded storage keys (operator, info, controller, subaccountPk)
     2. Reset all state to null/false
     3. `queryClient.invalidateQueries()`
3. `use-funded-context.ts`: `useFundedContext<T>(selector)` wrapper — selector-based to avoid re-renders.
4. `index.ts`: barrel.

**Subaccount approval check (deferred to phase 04):**
Phase 03 stops at writing the PK. The on-chain approval check happens in Phase 04 where SubaccountContext knows about subaccount approvals.

## Todo

- [ ] funded-context.ts
- [ ] FundedContextProvider.tsx
- [ ] use-funded-context.ts
- [ ] localStorage hydration on mount
- [ ] connectFunded happy path
- [ ] disconnectFunded clean clear
- [ ] error handling resets state
- [ ] `yarn tscheck` green

## Success criteria

- Calling `connectFunded(controller)` w/ valid wallet → state populated, storage written
- Calling `disconnectFunded()` → all state cleared, storage cleared
- Reload after connect → state rehydrated from storage, `isFundedMode=true`
- Error during `authenticateFunded` → state remains clean, error propagated to UI

## Risks

- Race condition between rehydrate and queryClient invalidation. Defer invalidation to next tick (`setTimeout(..., 0)`) — pattern from mune line 472.

## Next

→ Phase 04 (SubaccountContext reads from FundedContext)
