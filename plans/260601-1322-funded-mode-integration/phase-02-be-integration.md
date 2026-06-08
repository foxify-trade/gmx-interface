# Phase 02 — BE Integration: Auth + Journeys

**Status:** pending
**Priority:** P0
**Est. LOC:** ~150
**Depends on:** Phase 01

## Context

Brainstorm: `../reports/brainstorm-260601-1322-funded-mode-integration.md`
Reference:
- `mune-frontend-orderly/src/providers/FundedWalletProvider.tsx` lines 509–700 (connectFundedAccount)
- `mune-frontend-orderly/src/hooks/query/fundedSwitcher/useFetchFundedChallenges.ts`

## Key insights

- `/funded/authenticate` requires fresh signature each connect (timestamp + nonce in signed payload prevent replay)
- `/funded/challenges` is polled (3s when active, 10s default in mune). For initial scope, use react-query w/ 10s refetch.
- Auth payload includes `controllerAddress` — must match the journey user picked

## Requirements

- `authenticateFunded({ walletClient, address, chainId, controllerAddress }) → FundedAuthResponse`
- `useFundedJourneys({ traderAddress })` — react-query, returns `Challenge[]`, polls every 10s when traderAddress present

## Files

**Create:**
- `src/domain/funded/funded-auth.ts`
- `src/domain/funded/funded-journeys.ts`

## Implementation steps

1. `src/domain/funded/funded-auth.ts`:
   ```ts
   export async function authenticateFunded(params: {
     walletClient: WalletClient
     address: Address
     chainId: number
     controllerAddress: Address
   }): Promise<FundedAuthResponse>
   ```
   - Build payload `{ method:'POST', path:'/funded/authenticate', timestamp: Date.now(), nonce: random, controllerAddress }`
   - Call `signFundedMessage` (phase 01)
   - POST via funded-axios with body `{ publicKey: address, signature, message, signatureType }`
   - Return typed response; throw on non-2xx or unexpected shape
2. `src/domain/funded/funded-journeys.ts`:
   ```ts
   export function useFundedJourneys(traderAddress: Address | undefined)
   ```
   - `useQuery({ queryKey: ['funded-journeys', traderAddress], queryFn: () => axios.get('/funded/challenges', { params: { traderAddress } }).then(r => r.data), enabled: !!traderAddress, refetchInterval: 10_000, refetchIntervalInBackground: true, staleTime: 0 })`
3. Add lightweight tests for `authenticateFunded`:
   - Mock axios — verify request body shape (publicKey, signature, message, signatureType)
   - Verify timestamp/nonce present and unique across calls

## Todo

- [ ] funded-auth.ts
- [ ] funded-journeys.ts
- [ ] unit test for authenticateFunded payload shape
- [ ] `yarn tscheck` green

## Success criteria

- `authenticateFunded` returns parsed `FundedAuthResponse` for happy path
- Hook re-fetches every 10s when traderAddress present, disabled otherwise
- Signature payload format matches mune's `/funded/authenticate` exactly

## Risks

- BE response shape may diverge from assumption — keep parsing strict (throw on missing operatorPrivateKey). Adapter layer can be added if BE returns Orderly shape.

## Next

→ Phase 03 (FundedContext consumes these two functions)
