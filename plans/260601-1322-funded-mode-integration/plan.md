---
status: pending
created: 2026-06-01
branch: feat/funded-journey-preview
---

# FUNDED Mode Integration — Implementation Plan

**Brainstorm:** [../reports/brainstorm-260601-1322-funded-mode-integration.md](../reports/brainstorm-260601-1322-funded-mode-integration.md)

## Goal

Integrate FUNDED mode switching: user connects wallet → picks a funded journey → enters funded mode where Express-relayer trades sign as BE-issued operator key. Mirrors `mune-frontend-orderly` flow, adapted to GMX's Subaccount/wagmi stack.

## Strategy (one-line)

Main wagmi wallet stays connected; FUNDED mode = `FundedContext` that injects BE-issued operator PK into existing `SubaccountContext`. No wagmi connector swap.

## Phases

| # | Phase | Status | LOC est. | Depends on |
|---|---|---|---|---|
| 01 | [Foundation: axios, storage, signer, types](phase-01-foundation.md) | pending | ~250 | — |
| 02 | [BE integration: auth + journeys](phase-02-be-integration.md) | pending | ~150 | 01 |
| 03 | [FundedContext: state store + connect/disconnect](phase-03-funded-context.md) | pending | ~200 | 01, 02 |
| 04 | [Subaccount integration: inject operator PK](phase-04-subaccount-integration.md) | pending | ~100 | 03 |
| 05 | [UI: header switcher + journey modal](phase-05-ui-switcher.md) | pending | ~250 | 03 |
| 06 | [Wiring + manual QA](phase-06-wiring-and-qa.md) | pending | ~50 | 04, 05 |

## Key dependencies

- Existing `SubaccountContext` (touched in phase 04)
- Existing `generateSubaccount.ts` AES helper (refactored in phase 01/04)
- Header user menu component (touched in phase 05)
- `VITE_FUNDED_API_URL` env var (already in `config/funded.ts`)
- BE endpoints assumed live: `POST /funded/authenticate`, `GET /funded/challenges`

## Out of scope (deferred rounds)

- JWT auth (`/funded/auth/login`)
- Journey creation / payment / NFT
- Dashboard polling improvements
- Affiliate / withdrawal flows
- Read-only UI gating across trade surfaces

## Acceptance

- Click "Switch to Funded" in header → journey list → pick → enter mode
- Trade tx on `/trade` signs as operator (verifiable on-chain)
- Reload preserves funded mode in same tab; other tabs unaffected
- "Exit Funded" cleanly restores normal subaccount path
- `tsc -p tsconfig.json --noEmit` green; no regression in non-funded trading
