# Phase 04 — Subaccount Integration: Inject Operator PK

**Status:** pending
**Priority:** P0
**Est. LOC:** ~100
**Depends on:** Phase 03

## Context

This is the **only** invasive change to existing GMX code. Modify SubaccountContext + its derivation logic so that when `isFundedMode=true`, the active subaccount comes from FundedContext's stored operator PK instead of being generated locally.

Reference:
- `src/context/SubaccountContext/` (existing)
- `src/domain/synthetics/subaccount/generateSubaccount.ts` (existing)

## Key insights

- GMX subaccount object shape: `{ address, privateKey (AES-encrypted), isNew }`. Same shape works for funded — operator PK is just encrypted differently in our phase-01 helper.
- Decryption uses `await signer.getAddress()` as secret. Same for funded — main wallet is still the wagmi signer.
- On-chain approval: GMX has existing subaccount-approval flow. Reuse the existing `approveSubaccount` action — funded operator looks like any other subaccount to the contract.
- First-connect approval: check `useIsSubaccountApproved(operatorAddress)` (or equivalent existing hook). If false → call existing approval UI/tx. Block `setIsFundedMode(true)` until approval confirmed.

## Requirements

- SubaccountContext returns funded operator subaccount when `isFundedMode=true`
- Approval check runs during `connectFunded` flow (move part of flow here from phase 03)
- Disconnecting funded mode restores normal subaccount path

## Files

**Modify:**
- `src/context/SubaccountContext/SubaccountContextProvider.tsx` (or equivalent — verify exact path)
- `src/context/FundedContext/FundedContextProvider.tsx` — call subaccount-approval helper inside `connectFunded`

**Possibly create:**
- `src/domain/funded/funded-subaccount-bridge.ts` — small helper that converts `FundedAuthResponse → Subaccount` shape

## Implementation steps

1. Read existing SubaccountContext implementation. Identify where the "active subaccount" is computed (likely a `useMemo` from encrypted storage).
2. Inject `useFundedContext` selector for `{ isFundedMode, fundedAccountInfo }` into SubaccountContext.
3. Branch in the active-subaccount memo:
   - `isFundedMode && fundedAccountInfo` → build subaccount object from funded slot: `{ address: fundedAccountInfo.operatorWalletAddress, privateKey: aes-encrypted-pk-from-funded-storage, isNew: false }`
   - else → existing behavior
4. In `FundedContextProvider.connectFunded`, BEFORE setting `isFundedMode=true`:
   - Look up if `auth.operatorWalletAddress` is already approved as subaccount on-chain (use existing GMX hook/query)
   - If not approved → call existing `approveSubaccount(operatorWalletAddress)` action; wait for tx confirmation
   - Then set `isFundedMode=true`
5. Verify Express-relayer code path picks up the funded subaccount automatically (it should — it reads from SubaccountContext).

## Todo

- [ ] Read SubaccountContext to map exact integration point
- [ ] Add `useFundedContext` selector
- [ ] Branch active-subaccount memo on `isFundedMode`
- [ ] Wire approval check + tx into `connectFunded`
- [ ] Manually verify Express-relayer signs with operator address
- [ ] `yarn tscheck` green

## Success criteria

- After `connectFunded`, `useSubaccount()` (or equivalent) returns operator-derived subaccount
- After `disconnectFunded`, returns normal locally-derived subaccount (or null if user never enabled)
- First connect to new controller triggers on-chain approval tx; second connect skips it
- A test trade on `/trade` in funded mode produces tx with operator as `from` (or relayer w/ operator signature, depending on Express-relayer mechanics)

## Risks

- **High blast radius:** SubaccountContext is consumed by Trade panel, positions, orders. Subtle bugs cascade. Mitigate w/ branch isolated to `isFundedMode` true path.
- Approval-tx UX: if user cancels approval, funded mode must not partially activate. Wrap in try/catch, rollback to switching=false.
- Existing subaccount approval flow may have main-wallet checks that block operator-address approval. Investigate during implementation; may need a parallel "funded-approve" path if blocked.

## Next

→ Phase 05 (UI exposes connect/disconnect)
