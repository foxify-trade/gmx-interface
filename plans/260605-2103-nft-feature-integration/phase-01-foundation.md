# Phase 01 — Foundation (config, routes, nav, viem client, ABIs)

## Context Links
- Plan: [plan.md](plan.md)
- Scout (target): `plans/reports/scout-current-conventions-260605-2104.md`
- Reference viem client: `git show origin/what-exchange:src/clients/configs/viem.ts`
- Target conventions: `src/config/funded.ts`, `src/components/SideNav/FundedExpandableNavItem.tsx`, `src/App/MainRoutes.tsx`

## Overview
- Priority: P1 (blocks all phases)
- Status: pending
- Scaffolds the feature shell: flag/routes config, copied ABIs, contract address constants, a self-contained Arbitrum viem public client + wallet-client helper, the two routes (rendering empty pages behind the flag), the expandable nav item, and the chosen icon.

## Key Insights
- gmx-interface conventions (verified): domain logic in `src/domain/{feature}/` (kebab-case files), UI in `src/components/{Feature}/` (PascalCase), pages in `src/pages/{Feature}Page/`.
- Routes are JSX in `src/App/MainRoutes.tsx` (`src/App/MainRoutes.tsx:196-204` funded block verified). Lazy pattern at `MainRoutes.tsx:85-93`.
- Nav registered in `SideNav.tsx:205` (`{FUNDED_ENABLED && <FundedExpandableNavItem .../>}`), inside `MenuSection` (`SideNav.tsx:159`).
- Flag pattern: `src/config/funded.ts:1-22` (`parseFundedFlag`, `viteEnv = import.meta.env`).
- NFT contracts live on Arbitrum ONLY, independent of app's selected chain → a dedicated read client (not the app multicall) is correct (KISS, matches reference).
- viem `2.39.0`, wagmi `2.19.3`, `@tanstack/react-query 5.25.0` already deps (verified `package.json`).
- Chosen icon: `img/ic_star_gradient.svg?react` (verified exists in `src/img`). Fallback `img/sparkle.svg`.

## Requirements
Functional:
- `NFT_ENABLED` flag + `NFT_ROUTES` constants.
- `/nft` and `/nft/eligibility` routes; render `PageNotFound` when flag off.
- Nav item "NFT" with two sub-items; hidden when flag off; collapsed-sidebar fallback to single NavItem.
- Arbitrum read client + chain-switch wallet-client helper.
- ABIs copied verbatim from reference.

Non-functional: files < 200 lines; tscheck passes; no impact when flag off.

## Architecture
Data flow (this phase only): flag (`import.meta.env.VITE_ENABLE_NFT`) → `NFT_ENABLED` → gate routes + nav. viem client: static `http()` transport pinned to `arbitrum` chain (read-only). Wallet client: built on demand from `window.ethereum` after switching to Arbitrum (write path, used in Phase 2/3).

## Related Code Files

Create:
- `src/config/nft.ts` — flag + routes (mirror `funded.ts`).
- `src/domain/nft/abis/FoxifyTradingNFT.json` — copy of `git show origin/what-exchange:src/clients/abis/common/FoxifyTradingNFT.json`.
- `src/domain/nft/abis/FoxifyAffiliation.json` — copy of `...:src/clients/abis/common/FoxifyAffiliation.json`.
- `src/domain/nft/contracts/nft-contracts.ts` — address constants (`FOXIFY_V3_NFT_ADDRESS`, `FOXIFY_V2_NFT_ADDRESS`) + `getNftContractAddress()`/`getV2NftContractAddress()`.
- `src/domain/nft/contracts/arbitrum-public-client.ts` — `arbitrumPublicClient` (`createPublicClient({ chain: arbitrum, transport: http() })`).
- `src/domain/nft/contracts/arbitrum-wallet-client.ts` — `switchToArbitrumAndGetClient()` (port of reference; EIP-1193 `wallet_switchEthereumChain`/`wallet_addEthereumChain`, returns `createWalletClient({ chain: arbitrum, transport: custom(provider) })`).
- `src/components/SideNav/NftExpandableNavItem.tsx` — clone of `FundedExpandableNavItem.tsx`, icon `ic_star_gradient`, sub-items from `NFT_ROUTES`.
- `src/pages/NftManagementPage/NftManagementPage.tsx` — empty shell (`<AppPageLayout title="NFTs" header={<ChainContentHeader/>}>` + `<Trans>NFTs</Trans>`); filled Phase 3.
- `src/pages/NftEligibilityPage/NftEligibilityPage.tsx` — empty shell; filled Phase 4.

Modify:
- `src/App/MainRoutes.tsx` — add lazy wrappers + 2 `<Route exact>` entries after funded block (after line ~204).
- `src/components/SideNav/SideNav.tsx` — add `import { NftExpandableNavItem }` + `{NFT_ENABLED && <NftExpandableNavItem .../>}` after line 205.
- `.env`, `.env.example` — add `VITE_ENABLE_NFT`.

## Implementation Steps
1. Create `src/config/nft.ts`:
   ```ts
   const TRUE_VALUES = new Set(["1","true","yes","on"]);
   const viteEnv = import.meta.env;
   export function parseNftFlag(v?: string|null){ return v ? TRUE_VALUES.has(v.trim().toLowerCase()) : false; }
   export const NFT_ENABLED = parseNftFlag(viteEnv.VITE_ENABLE_NFT);
   export const NFT_ROUTES = { management: "/nft", eligibility: "/nft/eligibility" } as const;
   ```
2. Copy both ABI JSONs verbatim into `src/domain/nft/abis/`.
3. Create `nft-contracts.ts` with the two addresses (`0xE7594eF4...655cC` V3, `0x3e120638...82280` V2) `as const` + getters.
4. Create `arbitrum-public-client.ts`: `import { arbitrum } from "viem/chains"; export const arbitrumPublicClient = createPublicClient({ chain: arbitrum, transport: http() });`
5. Create `arbitrum-wallet-client.ts`: port `switchToArbitrumAndGetClient()` verbatim from reference viem.ts (drop the Orderly `createWalletClientFromOrderlyAccount`).
6. Create empty pages (shells) wrapped in `AppPageLayout` + `ChainContentHeader` (import `components/ChainContentHeader/ChainContentHeader`, verified path).
7. In `MainRoutes.tsx`: add lazy wrappers mirroring `LazyFundedStartJourneyPage` (lines 85-93); add routes:
   ```tsx
   <Route exact path="/nft">{NFT_ENABLED ? <NftManagementPage/> : <PageNotFound/>}</Route>
   <Route exact path="/nft/eligibility">{NFT_ENABLED ? <NftEligibilityPage/> : <PageNotFound/>}</Route>
   ```
   Import `NFT_ENABLED` from `config/nft`.
8. Create `NftExpandableNavItem.tsx` from `FundedExpandableNavItem.tsx`: replace `FUNDED_ROUTES`→`NFT_ROUTES`, `isFundedRoute = pathname.startsWith("/nft")`, label `t\`NFT\``, icon `StarGradientIcon`, sub-items `[{label: t\`NFT Management\`, to: NFT_ROUTES.management},{label: t\`Mint Eligibility\`, to: NFT_ROUTES.eligibility}]`. Collapsed fallback links to `NFT_ROUTES.management`.
9. Register in `SideNav.tsx` after the FUNDED line (205).
10. Add `VITE_ENABLE_NFT=false` to `.env` and `.env.example` (do NOT commit secrets; OpenSea key added Phase 2).
11. Run `yarn tsc --noEmit` (or project tscheck script) — fix type errors.

## Todo List
- [ ] `src/config/nft.ts`
- [ ] Copy 2 ABIs to `src/domain/nft/abis/`
- [ ] `nft-contracts.ts` (addresses + getters)
- [ ] `arbitrum-public-client.ts`
- [ ] `arbitrum-wallet-client.ts`
- [ ] Empty `NftManagementPage` + `NftEligibilityPage` shells
- [ ] Routes in `MainRoutes.tsx`
- [ ] `NftExpandableNavItem.tsx` + register in `SideNav.tsx`
- [ ] `.env` / `.env.example` flag
- [ ] tscheck passes

## Success Criteria
- With `VITE_ENABLE_NFT=true`: nav shows "NFT" w/ 2 sub-items; `/nft` & `/nft/eligibility` render empty pages.
- With flag off/unset: nav hidden; both routes render `PageNotFound`.
- `tsc --noEmit` clean. No changes to FUNDED nav/routes behavior.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Route collision `/nft` with existing path | Low×Med | Grep `MainRoutes.tsx` for `/nft` (scout confirmed zero NFT code) before adding. |
| `arbitrum` import from `viem/chains` missing | Low×Low | viem 2.39 ships `viem/chains`; verify import resolves in tscheck. |
| Nav icon import path wrong | Low×Low | Use `?react` suffix like `FundedExpandableNavItem` line 10. |

## Security Considerations
- No secrets in `src/config/nft.ts`. OpenSea key handled via env in Phase 2.
- Read client uses public RPC; no signing in this phase.

## Next Steps
- Phase 2 fills `src/domain/nft/` data layer consuming the client/ABIs/addresses created here.
