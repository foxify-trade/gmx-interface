---
title: "NFT Feature Integration (Port from what-exchange)"
description: "Port Foxify NFT staking/merge/migrate/mint + eligibility feature into gmx-interface behind VITE_ENABLE_NFT."
status: completed
priority: P2
effort: 16h
branch: feat/funded-journey-preview
tags: [nft, web3, arbitrum, feature-flag, port]
created: 2026-06-05
---

# NFT Feature Integration

Port the full Foxify NFT feature from `mune-frontend-orderly@origin/what-exchange` (Next.js + Orderly + viem) into `gmx-interface` (Vite + React Router v5 + wagmi/viem + Tailwind + Lingui). Full functional parity: on-chain V2/V3 reads, stake/unstake, merge, V2→V3 migrate, merkle-proof mint, NFT metadata fallback chain, eligibility volume check.

Gated behind `VITE_ENABLE_NFT`. Off => routes render `PageNotFound`, nav hidden. Mirrors `src/config/funded.ts`.

## Architecture (target project conventions)
- Domain logic + hooks + types + ABIs + viem client → `src/domain/nft/` (mirrors `src/domain/funded/`)
- UI sections + dialogs → `src/components/Nft/` (mirrors `src/components/Funded/`)
- Pages → `src/pages/NftManagementPage/`, `src/pages/NftEligibilityPage/`
- Routes → `src/App/MainRoutes.tsx` (`<Route exact>` + lazy/Suspense)
- Nav → `src/components/SideNav/NftExpandableNavItem.tsx` (clone of `FundedExpandableNavItem.tsx`)
- Data fetching: `@tanstack/react-query` (already dep). Reads via self-contained viem `arbitrumPublicClient`. Writes via wagmi `walletClient` + chain switch to Arbitrum.

## Phases
| # | File | Status | Description |
|---|------|--------|-------------|
| 1 | [phase-01-foundation.md](phase-01-foundation.md) | done | config flag/routes, ABIs, contract consts, viem client, routes, nav item, icon |
| 2 | [phase-02-data-layer.md](phase-02-data-layer.md) | done | types, NftContext, useNftData (split), mutation hooks, eligibility, merkle/opensea env |
| 3 | [phase-03-nft-management-page.md](phase-03-nft-management-page.md) | done | Management page + sections + 6 dialogs |
| 4 | [phase-04-nft-eligibility-page.md](phase-04-nft-eligibility-page.md) | done | Eligibility page + hero/wallet input/wave cards/countdown/perks/reminder |
| 5 | [phase-05-i18n-build-verify.md](phase-05-i18n-build-verify.md) | done | Lingui extract+compile, tscheck, lint, build, QA + FUNDED regression |

## Implementation result (2026-06-06)
- 44 files created/modified across `src/config`, `src/domain/nft`, `src/components/Nft`, `src/components/SideNav`, `src/pages/Nft*`, `src/App/MainRoutes.tsx`.
- tscheck: 0 new (non-baseline) errors in NFT files. The repo's pre-existing repo-wide TS2786 React-Router-v5 JSX-types skew is unchanged.
- lint: 0 errors (fixed `no-bigint-negation`); remaining warnings are the codebase-baseline `react-perf/jsx-no-new-object` from dynamic inline styles (FUNDED pages carry the same).
- i18n: `yarn lingui:prepare` extracted + compiled all new `t`/`<Trans>` strings.
- code review: SHIP, 9/10, 0 critical / 0 high — contract calls verified end-to-end vs reference; FUNDED routes/nav purely additive, no regression.
- Known minors (parity-preserved vs what-exchange): stake picker lists Silver/Gold of either version (V2 selection caught by simulate before signing); merkle-proof upstream may require a CORS-enabled proxy before whitelist mint succeeds in prod.

## Dependencies
- Phase 1 blocks all. Phase 2 blocks 3 & 4 (shared context/hooks/types). Phase 3 & 4 parallelizable (disjoint files). Phase 5 after 3 & 4.

## UI Primitive Mapping (Orderly → gmx-interface)
| Reference (Orderly) | Target (gmx-interface) | Notes |
|---------------------|------------------------|-------|
| `Button` from `@orderly.network/ui` | `Button` from `components/Button/Button` | Needs `variant` prop (use `primary`/`secondary`/`ghost`). No `loading` prop → render spinner/disabled manually. No inline `style=` for color → use Tailwind classes. |
| `toast` from `@orderly.network/ui` | `helperToast` from `lib/helperToast` | `toast.success(x)`→`helperToast.success(x)`; `toast.error(x)`→`helperToast.error(x)`. |
| `SafeDialog`/`SafeDialogContent`/`SafeDialogTitle`/`SafeDialogBody` | `Modal` from `components/Modal/Modal` | `Modal` uses `isVisible`/`setIsVisible`/`label` props (not `open`/`onOpenChange`/`DialogTitle`). Wrap body as children. Build thin `NftDialog` adapter (Phase 3) to keep dialog ports faithful. |
| `useAccount()` (Orderly) `.state.address` | `useWallet()` from `lib/wallets/useWallet` → `account` | `account` is the address (`0x..`|undefined); `active` is connected bool. |
| `useMainAccount()` `.address` | `useWallet().account` | Drop funded-wallet duality; gmx single wallet. |
| `switchToArbitrumAndGetClient()` | new `domain/nft/contracts/arbitrum-wallet-client.ts` | Reimplement EIP-1193 chain switch + `createWalletClient`. KISS: keep reference logic (window.ethereum based). |
| `next/link` / `<a href>` | `Link` from `react-router-dom` | |
| `lucide-react` icons | keep `lucide-react` if dep present, else inline SVG / `src/img` | Verify dep in Phase 3. |
| `--color-foxify-primary` CSS var | Tailwind token (`bg-blue-400` / `text-blue-400`) | Map per `tailwind.config.ts`/`config/colors.ts`. Avoid raw CSS var. |

## Env vars to add (`.env`, `.env.example`)
- `VITE_ENABLE_NFT` — feature flag (true/false)
- `VITE_OPENSEA_API_KEY` — move hardcoded OpenSea key out of source
- `VITE_NFT_MERKLE_PROOF_URL` (optional) — defaults to `https://nft.foxify.trade/proof`

## Chosen nav icon
`img/ic_star_gradient.svg?react` (gem/gradient look, distinct from FUNDED's `ic_star.svg`). Fallback: `img/sparkle.svg`.

## Key risks (see phase files for mitigations)
- Merkle-proof & OpenSea CORS: Vite has no server routes → call upstream directly; mint section is hidden in reference (port but keep commented/flagged).
- `/funded/account-volume` API parity (eligibility). Verify endpoint reachable from gmx domain.
- Modal API divergence (Orderly Dialog vs gmx Modal) → adapter component.
