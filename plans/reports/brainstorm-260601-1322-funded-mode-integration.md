# Brainstorm — FUNDED Mode Integration

**Date:** 2026-06-01
**Branch:** `feat/funded-journey-preview`
**Reference:** `mune-frontend-orderly` (non-Orderly-specific funded flow)

## Problem statement

gmx-interface has scaffolded FUNDED preview UI (`pages/FundedStartJourneyPage`, `pages/FundedDashboardPage`, `domain/funded/`) behind `VITE_ENABLE_FUNDED`, but **no mode-switching mechanism**: only `/funded/journey-dashboard` (read-only GET) is wired. Need to integrate full FUNDED mode where, after connecting wallet, user can switch into a BE-issued operator-account context, and switch back. BE endpoints mirror Foxify (`/funded/authenticate`, `/funded/challenges`).

## Scout findings

**gmx-interface current state:**
- wagmi + ethers (`src/lib/wallets/useWallet.ts`)
- Existing **Subaccount** pattern: `domain/synthetics/subaccount/generateSubaccount.ts` — signs `SUBACCOUNT_MESSAGE` → derives PK → AES-encrypts with wallet address → `SubaccountContext` holds the active subaccount → Express-relayer signs trades with subaccount key
- FUNDED preview routes behind `FUNDED_ENABLED` flag; only `useFundedDashboard()` hits BE today

**mune-frontend-orderly relevant patterns (Orderly account internals ignored):**
- Axios w/ `x-foxify-frontend-id` + `x-foxify-broker-id` headers, base `https://api.foxify.trade`
- Two-step BE auth:
  1. `POST /funded/auth/login` → JWT (general auth, **OUT OF SCOPE this round**)
  2. `POST /funded/authenticate` → operator credentials (per controller)
- `fundedSwitcherStore` (Jotai persisted) holds `fundedAccount`, `fundedAccountInfo`, `connectedControllerAddress`, `originalWalletState`, `isSwitchingMode`
- Tab-scoped storage keys
- Sign message → personal_sign w/ `eth_signTypedData_v4` fallback for mobile wallets
- Endpoints in scope: `/funded/authenticate`, `/funded/challenges?traderAddress=`

## Decisions (confirmed via Q&A)

| Decision | Pick |
|---|---|
| Tx signer model | User wallet stays; **BE operator key REPLACES locally-generated subaccount PK** in SubaccountContext |
| BE state | Exists; mirrors Foxify funded endpoints |
| Subaccount approval | FE triggers user on-chain approval tx on first connect per controller |
| Persistence | localStorage + tab-scoped + multi-journey + read-only support |
| State location | New `src/context/FundedContext/` |
| UI entry | Header account dropdown |
| Scope this round | Mode switcher (state store + connect/disconnect) + Subaccount-level signer injection |

## Chosen architecture

Main wagmi wallet **stays connected throughout**. FUNDED mode = a `FundedContext` provider that:
1. Holds BE-issued operator credentials
2. Injects operator PK into existing `SubaccountContext` (funded-namespaced storage slot)
3. Trades execute via GMX's existing Express-relayer (no trade-path changes needed)

**Why this beats the alternatives:**
- vs. wagmi custom connector swap (Orderly-style): keeps `useAccount()` returning main wallet → zero blast radius across components that read address (positions, orders, balances all keep working). Only Subaccount layer learns "funded".
- vs. UI-only mode: BE operator key actually signs trades (real funded-account semantics), not just UI theming.

## Connect flow

```
1. Header dropdown → "Switch to Funded"
2. JourneySelectorModal: GET /funded/challenges?traderAddress={main}
3. User picks journey (controllerAddress)
4. Main wallet signs:
   { method:'POST', path:'/funded/authenticate', timestamp, nonce, controllerAddress }
   (personal_sign + eth_signTypedData_v4 fallback)
5. POST /funded/authenticate { publicKey, signature, message, signatureType }
   → { operatorPrivateKey, operatorWalletAddress, controllerAddress, readOnly? }
6. Check on-chain subaccount approval (main → operator)
   IF NOT approved → trigger GMX subaccount-approval tx (user signs)
7. AES-encrypt operatorPrivateKey with main address → write to funded-namespaced subaccount slot
8. Persist tab-scoped localStorage:
   {prefix}:{tabId}:fundedAccount         = operatorWalletAddress
   {prefix}:{tabId}:fundedAccountInfo     = full response
   {prefix}:{tabId}:connectedController   = controllerAddress
9. setIsFundedMode(true); setIsReadOnly(readOnly)
10. queryClient.invalidateQueries()
```

**Disconnect:** clear funded storage keys + funded subaccount slot + `isFundedMode=false` + invalidate queries.

## Module map

```
NEW
src/lib/funded/funded-axios.ts                  ~50  axios + x-foxify-* headers
src/lib/funded/funded-storage.ts                ~40  tab-scoped localStorage helpers
src/lib/funded/funded-signer.ts                 ~80  sign message (personal_sign + typed-data fallback)
src/domain/funded/funded-auth.ts                ~80  POST /funded/authenticate
src/domain/funded/funded-journeys.ts            ~50  useFundedJourneys → GET /funded/challenges
src/domain/funded/funded-types.ts               (extend) FundedAuthResponse, Challenge
src/context/FundedContext/
  FundedContextProvider.tsx                     ~150
  useFundedContext.ts                           ~30
  index.ts
src/components/Funded/FundedSwitcherButton.tsx  ~80  header dropdown entry
src/components/Funded/JourneySelectorModal.tsx  ~120

TOUCHED
src/context/SubaccountContext/                  branch on isFundedMode → use funded slot
src/domain/synthetics/subaccount/generateSubaccount.ts  extract AES-encrypt helper
src/App/App.tsx                                 wrap <FundedContextProvider>
src/components/Header/AppHeaderUser*            mount <FundedSwitcherButton>
src/config/funded.ts                            add endpoint paths
```

## State shape (FundedContext)

```ts
{
  isFundedMode: boolean
  isSwitchingMode: boolean              // suppresses flicker
  fundedAccount: Address | null         // operator address
  fundedAccountInfo: FundedAuthResponse | null
  connectedControllerAddress: Address | null
  isReadOnly: boolean
  availableJourneys: Challenge[]

  connectFunded(controllerAddress): Promise<void>
  disconnectFunded(): void
  refreshJourneys(): void
}
```

## Out of scope (this round)

- JWT auth (`/funded/auth/login`, `AuthContext`, `/funded/auth/roles`) — defer until admin/affiliate endpoints needed
- Journey creation flow (`/funded/track-availability`, NFT, payment)
- Dashboard polling improvements (`/funded/order-panel`)
- Affiliate / withdrawal flows
- Read-only **UI gating** across trade surfaces — flag exposed only; gating in later round
- Multi-tab broadcast (each tab independent per current decision)

## Risks

1. **localStorage of operator PK** — Orderly-parity but extraction risk. AES-encrypt with main address is deterministic-from-public (weak). Acceptable for parity; flag for security review later.
2. **First-connect gas cost** — subaccount-approval tx. BE cannot pre-approve (lacks main-wallet sig). Accept user-signed approval on first connect per controller.
3. **Tab-scoped storage** — opening trading in a new tab won't inherit funded mode. Matches Orderly; product confirmation needed.
4. **SUBACCOUNT_MESSAGE compatibility** — Express-relayer verifies signatures against subaccount address regardless of key origin. Should work; verify during phase-3 integration.
5. **Read-only mode UI leak** — exposing the flag without UI gating means read-only users still see trade controls. UI gating deferred; document as known limitation until next round.

## Unresolved questions

- Q1: Exact response shape of GMX's `/funded/authenticate`. Assumed `{ operatorPrivateKey, operatorWalletAddress, controllerAddress, readOnly? }`. If BE returns Orderly-shaped (`orderlyKey/orderlySecret`), an adapter is needed.
- Q2: Is the existing GMX subaccount-approval UI/tx reusable as-is, or does funded need its own approval modal copy?
- Q3: Read-only enforcement — at SubaccountContext (return null operator → disable Express-relayer hard) or only UI? Decision needed before later round.
- Q4: Any extra BE headers beyond `x-foxify-frontend-id` / `x-foxify-broker-id`? `FUNDED_FRONTEND_ID = "gmx-funded"` already set.
- Q5: Auto-reconnect behavior on page reload — restore funded mode silently if storage present, or require user re-confirm?

## Success criteria

- User on `/trade` can click "Switch to Funded" in header → see journey list → pick one → enter funded mode
- After connect, Express-relayer trades sign as operator address (verifiable in tx explorer)
- Reload preserves funded mode in same tab
- Other tabs remain in normal mode
- `disconnectFunded()` cleanly restores normal subaccount path
- All TS compiles; no regressions in non-funded trade flow
