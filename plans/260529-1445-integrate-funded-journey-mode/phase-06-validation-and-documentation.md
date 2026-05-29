---
phase: 6
title: "Validation And Documentation"
status: in_progress
priority: P2
effort: "0.5d"
dependencies: [3, 4, 5]
---

# Phase 6: Validation And Documentation

## Context Links

- Current docs: `docs/style-guidelines.md`
- Scripts: `package.json`
- Project docs rule: `.claude/rules/documentation-management.md`

## Overview

Validate the integrated feature and update docs/changelog where needed. This phase blocks completion; do not accept failing tests by hiding routes or mocking real FUNDED flows.

## Requirements

- Functional: routes, API hooks, mode switching, and feature flag behavior verified.
- Functional: docs record new env vars, routes, and mode behavior.
- Non-functional: use focused checks first, then broader compile/lint.

## Architecture

Validation layers:

1. Static: TypeScript compile and lint.
2. Unit: storage/mode reducer, API param sanitization, route guards.
3. Component: render start/list/dashboard/leaderboard states.
4. Manual smoke: feature flag off/on, start journey UI, funded dashboard UI, existing GMX trade route unaffected.

## Related Code Files

- Modify: `docs/project-changelog.md` if it exists, else create per docs rule.
- Modify: `docs/project-roadmap.md` or `docs/development-roadmap.md` if it exists.
- Create/modify tests near changed files.
- Run: `yarn tscheck`
- Run: `yarn test:ci` or focused `vitest run` specs.
- Run: `yarn build-app` if route compile risk remains high.

## Implementation Steps

1. Add unit tests for `funded-mode-storage`, config parsing, and API param guards.
2. Add component tests for feature-flag off/on route rendering.
3. Run `yarn tscheck`.
4. Run focused Vitest specs; use `yarn test:ci` if practical.
5. Run route smoke checks in dev server for start journey and challenge dashboard first.
6. Update docs/changelog with routes, env vars, and operational notes.
7. Run code review pass before handoff.

## Todo List

- [x] Add focused tests.
- [ ] Run compile/type checks.
- [ ] Run route smoke checks.
- [x] Update docs/changelog.
- [x] Review final diff for leaked secrets/logs.

## Success Criteria

- [ ] All agreed checks pass or failures are documented with exact blockers.
- [ ] Documentation lists new env vars and FUNDED mode limitations.
- [ ] No source-only Next imports remain in current FUNDED files.
- [ ] No new credentials or `.env` values committed.

## Risk Assessment

- Risk: build may pass while funded runtime fails because backend/env is missing.
- Mitigation: include explicit feature flag off/on smoke tests and document required backend setup.

## Unresolved Questions

- Need final backend env values before production API smoke.
- Need product decision later on journey list, leaderboards, and full mode switching.

## Validation Notes

- `yarn test:ci src/config/funded.spec.ts src/domain/funded/funded-utils.spec.ts` passes.
- Funded-file lint passes with `yarn eslint ... --max-warnings=0`.
- `yarn tscheck:ci` remains blocked by existing React Router / Portal JSX typing failures outside this funded feature. This prevents full plan closure.
