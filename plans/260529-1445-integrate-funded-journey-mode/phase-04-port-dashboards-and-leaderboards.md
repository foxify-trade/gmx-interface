---
phase: 4
title: "Port Funded Dashboard UI"
status: complete
priority: P2
effort: "1.5d"
dependencies: [2, 3]
---

# Phase 4: Port Funded Dashboard UI

## Context Links

- Source challenge dashboard: `mune-frontend-orderly/src/clients/pages/Funded/FundedDashboard/FundedDashboardPage.tsx`
- Source dashboard widgets: `mune-frontend-orderly/src/clients/pages/Funded/FundedDashboard/components/*`
- Source FUNDED leaderboard pages: `mune-frontend-orderly/src/clients/pages/Leaderboards/Funded*`
- Existing leaderboard: `src/pages/LeaderboardPage/*`, `src/domain/synthetics/leaderboard/*`

## Overview

Port the Funded Challenge Dashboard UI after foundational data boundaries exist. Leaderboards are deferred; flash dashboard is out of scope.

## Requirements

- Functional: `/funded/challenge-dashboard` renders account summary, PnL, drawdown, timer, volume, recent trades, and status widgets.
- Functional: dashboard can render from typed demo/read data before full funded mode exists.
- Functional: route accepts optional `controllerAddress` but does not require active FUNDED mode for first UI review.
- Non-functional: charts and tables use current Recharts/table conventions; avoid Orderly UI dependency for simple components.

## Architecture

Dashboard routes:

- `/funded/challenge-dashboard`
- Optional read-only: `/funded/challenge-dashboard?controllerAddress=0x...`

Deferred routes:

- `/leaderboard/funded-challenge`
- `/leaderboard/funded-pnl`

Data hooks:

- `useFundedDashboard(params)`
- later: `useFundedChallengeRankings(params)`
- later: `useFundedPnlRankings(params)`

## Related Code Files

- Modify: `src/App/MainRoutes.tsx`
- Create: `src/pages/FundedDashboardPage/*`
- Create later: `src/pages/FundedLeaderboardsPage/*`
- Create: `src/domain/funded/use-funded-dashboard.ts`
- Create later: `src/domain/funded/use-funded-leaderboards.ts`

## Implementation Steps

1. Port dashboard data types and hooks from source.
2. Split source dashboard widgets into status badge, PnL chart, drawdown metric, timer widget, volume chart, recent trades, and on-deck/next steps.
3. Replace source `@orderly.network/ui` spinners/buttons with current components or simple local equivalents.
4. Replace source `formatNumber` imports with current amount/number format helpers.
5. Add feature flag guard for challenge dashboard route.
6. Add demo/read data plus loading/error/empty states that match final API shape.
7. Defer leaderboard wrappers.

## Todo List

- [x] Port dashboard hooks/types.
- [x] Port challenge dashboard widgets.
- [x] Add demo/read data adapter.
- [x] Defer funded challenge and PnL leaderboard tables.

## Success Criteria

- [ ] Dashboard route renders loading, empty, error, active, readonly states.
- [ ] `yarn tscheck` and focused render tests pass.

## Risk Assessment

- Risk: source dashboard assumes active Orderly funded mode and may redirect otherwise.
- Mitigation: support explicit read-only controller query for journey list dashboard links, and active mode for trade-connected dashboard.

## Security Considerations

- Never expose backend auth payload in route query params.
- Treat controller address query as public read-only lookup only.

## Implementation Notes

- Added modular dashboard UI under `src/pages/FundedDashboardPage/`.
- Live adapter now forwards `controllerAddress` into the funded API request and falls back to degraded preview state when the live lookup fails.
- Leaderboards remain deferred.
