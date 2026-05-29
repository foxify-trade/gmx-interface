---
phase: 1
title: "Research Source And Destination"
status: complete
priority: P1
effort: "0.5d"
dependencies: []
---

# Phase 1: Research Source And Destination

## Context Links

- Current README: `README.md`
- Current rules: `CLAUDE.md`, `.claude/rules/development-rules.md`
- Source FUNDED routes: `../mune-frontend-orderly/src/app/[lang]/funded/*`
- Source FUNDED clients: `../mune-frontend-orderly/src/clients/pages/Funded*`
- Source mode provider: `../mune-frontend-orderly/src/providers/FundedWalletProvider.tsx`

## Overview

Complete source/current-app mapping before implementation. Know what to port, what to adapt, and what to leave behind because source is Next/Orderly-specific.

## Requirements

- Functional: identify source files used by requested pages and mode switching.
- Functional: identify current app equivalents for routing, layout, wallet, query, env, styles, and API clients.
- Non-functional: document risky source files over 200 LOC and split strategy before coding.

## Architecture

Compatibility matrix:

| Concern | Source | Current app decision |
|---------|--------|----------------------|
| Router | Next app routes under `src/app/[lang]` | React Router v5 in `src/App/MainRoutes.tsx` |
| Layout | `BaseLayout`, `AppPage` | `AppPageLayout`, `AppHeader`, `SideNav` |
| Query | TanStack Query | already available via `WalletProvider` QueryClient |
| Wallet | Orderly hooks/provider | decide adapter vs full Orderly integration |
| Styling | Tailwind v4 + Orderly UI | Tailwind v3 + GMX style tokens |
| Images | `next/image` public assets | Vite imports/public URLs |

## Related Code Files

- Read: `src/App/App.tsx`
- Read: `src/App/MainRoutes.tsx`
- Read: `src/components/AppPageLayout/AppPageLayout.tsx`
- Read: `src/lib/wallets/WalletProvider.tsx`
- Read: `src/pages/LeaderboardPage/*`
- Read source: `mune-frontend-orderly/src/clients/pages/Funded/StartJourney/StartJourneyPage.tsx`
- Read source: `mune-frontend-orderly/src/clients/pages/FundedJourneys/*`
- Read source: `mune-frontend-orderly/src/clients/pages/Funded/FundedDashboard/*`
- Read source: `mune-frontend-orderly/src/clients/pages/Leaderboards/Funded*`

## Implementation Steps

1. Build source dependency tree with `rg`/imports for each requested page.
2. List reusable pieces: pure types, API hooks, table rendering, dashboard widgets.
3. List rewrite pieces: Next route wrappers, `next/navigation`, `next/image`, `@orderly.network/ui` wrappers, `@/` aliases.
4. Inspect current route shell and decide final route names.
5. Document required dependencies and env vars before package changes.
6. Confirm no unfinished local plan overlaps this feature.

## Todo List

- [x] Produce page-to-file dependency map.
- [x] Mark source files to split because they exceed 200 LOC.
- [x] Confirm source API endpoint contracts.
- [x] Confirm current route and layout insertion points.

## Success Criteria

- [ ] Research notes are captured in phase files or plan-scoped reports.
- [ ] Every later phase references concrete files, not generic "copy components".
- [ ] Open business/ID questions are listed at end of plan.

## Risk Assessment

- Risk: source `StartJourneyPage.tsx` is 1700+ LOC and cannot be copied as one current-app file.
- Mitigation: split into page shell, track cards, contract actions, setup progress, affiliate dialog, and liquidity service.

## Implementation Notes

- Source `StartJourneyPage.tsx` and `FundedDashboardPage.tsx` were treated as reference surfaces only; the current app uses smaller GMX-native modules instead of wholesale ports.
- Current app route shell is `src/App/MainRoutes.tsx` with `AppPageLayout` and `ChainContentHeader`, not the plan's earlier placeholder assumptions around additional layout wrappers.
