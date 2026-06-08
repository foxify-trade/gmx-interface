# Phase 01 — Foundation

**Status:** pending
**Priority:** P0 (blocks all)
**Est. LOC:** ~250

## Context

Brainstorm: `../reports/brainstorm-260601-1322-funded-mode-integration.md`
Reference patterns:
- `mune-frontend-orderly/src/clients/configs/axios.ts` — axios w/ x-foxify-* headers
- `mune-frontend-orderly/src/lib/getTabId.ts` — tab-scoped storage keys
- `mune-frontend-orderly/src/providers/FundedWalletProvider.tsx` lines 524–588 — sign w/ typed-data fallback
- `gmx-interface/src/domain/synthetics/subaccount/generateSubaccount.ts` — AES encrypt pattern

## Key insights

- gmx-interface has no project-wide axios client; HTTP today uses `fetch` directly. Keep funded axios isolated under `lib/funded/`.
- Tab-scoping needs a tab ID. Reuse pattern from mune: store `tabId` in `sessionStorage` (per-tab), key all funded localStorage entries with it.
- Personal_sign must fallback to `eth_signTypedData_v4` for WalletConnect mobile wallets.
- AES helper from `generateSubaccount.ts` is reusable — extract to a shared util so funded path can encrypt BE-issued PK identically.

## Requirements

- Axios instance pointed at `FUNDED_API_URL`, adds `x-foxify-frontend-id=gmx-funded` + `x-foxify-broker-id` headers
- `getFundedStorageKey(name)` returns `{prefix}:{tabId}:{name}` (tab-scoped)
- `signFundedMessage(walletClient, address, message)` → returns `{ signature, signatureType }`, handles fallback
- Type definitions for `FundedAuthResponse`, `Challenge`, `FundedChallengesResponse`

## Files

**Create:**
- `src/lib/funded/funded-axios.ts`
- `src/lib/funded/funded-storage.ts`
- `src/lib/funded/funded-signer.ts`
- `src/lib/funded/aes-encrypt-pk.ts` (extracted helper)

**Modify:**
- `src/domain/funded/funded-types.ts` — add `FundedAuthResponse`, `Challenge`, `FundedChallengesResponse`
- `src/domain/synthetics/subaccount/generateSubaccount.ts` — refactor AES step to use `aes-encrypt-pk.ts`
- `src/config/funded.ts` — add endpoint path constants + `FUNDED_BROKER_ID`

## Implementation steps

1. Create `src/lib/funded/funded-storage.ts`:
   - `getFundedTabId()` — read/write `funded:tabId` in sessionStorage
   - `getFundedStorageKey(name)` — `${VITE_FUNDED_STORAGE_PREFIX || "gmx-funded"}:${tabId}:${name}`
   - `readFundedStorage<T>(name)`, `writeFundedStorage<T>(name, value)`, `clearFundedStorage(name)`
2. Create `src/lib/funded/funded-axios.ts`:
   - Export default `axios.create({ baseURL: FUNDED_API_URL })` instance
   - Interceptor: set `x-foxify-frontend-id` + `x-foxify-broker-id` from `config/funded.ts`
   - Throw if `FUNDED_API_URL` missing when called
3. Create `src/lib/funded/funded-signer.ts`:
   - `signFundedMessage({ walletClient, address, message, chainId })` returns `{ signature, signatureType: 'personal_sign' | 'eth_signTypedData_v4' }`
   - Try `personal_sign` first; on errors matching mune's heuristic (codes 4200, -32601, msg "personal_sign"/"not supported"), retry typed-data
4. Create `src/lib/funded/aes-encrypt-pk.ts`:
   - `encryptPk(pk: string, secret: string): string` — AES encrypt
   - `decryptPk(ciphertext: string, secret: string): string`
5. Refactor `src/domain/synthetics/subaccount/generateSubaccount.ts` to call `encryptPk`
6. Extend `src/domain/funded/funded-types.ts`:
   ```ts
   export interface FundedAuthResponse {
     operatorPrivateKey: string
     operatorWalletAddress: Address
     controllerAddress: Address
     readOnly?: boolean
   }
   export interface Challenge {
     journeyId: number
     controllerAddress: Address
     challengeName: string
     trackName: string
     level: number
     status: string
     readOnly?: boolean
   }
   export interface FundedChallengesResponse { challenges: Challenge[]; count: number }
   ```
7. Update `src/config/funded.ts`:
   - `FUNDED_BROKER_ID = "gmx-funded"`
   - `FUNDED_ENDPOINTS = { authenticate: "/funded/authenticate", challenges: "/funded/challenges" }`

## Todo

- [ ] funded-storage.ts (tab-scoped)
- [ ] funded-axios.ts (headers + base)
- [ ] funded-signer.ts (sig + fallback)
- [ ] aes-encrypt-pk.ts (extracted)
- [ ] refactor generateSubaccount.ts to use shared AES helper
- [ ] extend funded-types.ts
- [ ] config/funded.ts constants
- [ ] `yarn tscheck` green

## Success criteria

- All new files compile
- `generateSubaccount.ts` still produces identical output (unit test if exists, else manual verify)
- `signFundedMessage` covered by a unit test for personal_sign happy path and typed-data fallback path

## Risks

- AES refactor of `generateSubaccount.ts` could change subaccount address for existing users. Verify byte-identical output.

## Next

→ Phase 02 (BE integration uses funded-axios + funded-signer + types)
