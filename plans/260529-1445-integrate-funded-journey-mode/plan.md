---
title: "Integrate FUNDED Journey Mode"
description: ""
status: in_progress
priority: P2
branch: "release"
tags: [funded, journey, orderly, mode-switching]
blockedBy: []
blocks: []
created: "2026-05-29T07:41:06.565Z"
createdBy: "ck:plan"
source: skill
---

# Integrate FUNDED Journey Mode

## Overview

Port FUNDED journey from sibling repo `mune-frontend-orderly` into this Vite GMX interface. First release scope is UI-first: start journey page and funded dashboard so the product surface is visible quickly. Journey list, leaderboards, and full normal/FUNDED trading mode are deferred until after the UI path is verified.

Key constraint: source repo is Next 15/React 19 with Orderly SDK pages; current app is Vite/React 18/react-router v5. Do not copy pages blindly. Build adapters around current providers, route shell, wallet/query stack, and style tokens.

Confirmed decisions:

- Temporary app/frontend display identity: GMX.
- Prioritize Start Journey UI and Funded Dashboard UI before full backend/mode integration.
- Use read/demo-safe data adapters where needed for UI visibility, but keep real API integration points typed and ready.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Research Source And Destination](./phase-01-research-source-and-destination.md) | Complete |
| 2 | [Foundations And Adapters](./phase-02-foundations-and-adapters.md) | Complete |
| 3 | [Port Journey Pages](./phase-03-port-journey-pages.md) | Complete |
| 4 | [Port Funded Dashboard UI](./phase-04-port-dashboards-and-leaderboards.md) | Complete |
| 5 | [Deferred Mode Switching Integration](./phase-05-mode-switching-integration.md) | Deferred |
| 6 | [Validation And Documentation](./phase-06-validation-and-documentation.md) | In Progress |

## Dependencies

- Source repo: `/Users/hocvv/Documents/TwendeeWorks/Foxify-Danny/mune-frontend-orderly`
- Current app repo: `/Users/hocvv/Documents/TwendeeWorks/Foxify-Danny/gmx-interface`
- Source routes verified:
  - `src/app/[lang]/funded/start-journey/page.tsx`
  - `src/app/[lang]/funded/journeys/page.tsx`
  - `src/app/[lang]/funded/challenge-dashboard/page.tsx`
  - `src/app/[lang]/leaderboard/funded-challenge/page.tsx`
  - `src/app/[lang]/leaderboard/funded-pnl/page.tsx`

## Success Criteria

- `/funded/start-journey` and `/funded/challenge-dashboard` render polished UI in current app.
- UI is wired through typed data boundaries so real FUNDED APIs can replace demo/read adapters without page rewrites.
- Normal mode remains default and existing GMX routes are not affected by FUNDED UI routes.
- `yarn tscheck`, focused tests, and route smoke checks pass before implementation is done.

## Current Status

- Implemented feature-gated preview routes for `/funded/start-journey` and `/funded/challenge-dashboard`.
- Added current-app-native funded config, demo data, and live-read adapter boundaries keyed by optional `controllerAddress`.
- Preserved `controllerAddress` across funded navigation and downgraded failed live lookups into explicit degraded preview state.
- Focused funded tests pass and funded-file lint passes.
- Repo-wide `yarn tscheck:ci` still fails on pre-existing React Router / Portal JSX typing issues outside this funded slice, so final validation remains open.

## Deferred Scope

- `/funded/journeys` list page.
- FUNDED leaderboards.
- Full Orderly trading-mode credential switching.
