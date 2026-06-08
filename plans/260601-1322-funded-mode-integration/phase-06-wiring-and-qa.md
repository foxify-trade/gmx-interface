# Phase 06 — Wiring + Manual QA

**Status:** pending
**Priority:** P0
**Est. LOC:** ~50
**Depends on:** Phase 04, 05

## Context

Final integration: mount `<FundedContextProvider>` in the app root, verify env config, run end-to-end manual flow against a live BE (or staging).

## Requirements

- `<FundedContextProvider>` mounted at correct depth (must be inside `WagmiProvider` and `QueryClientProvider`, but outside route-level providers that read funded state)
- `VITE_FUNDED_API_URL` documented in `.env.example`
- End-to-end manual flow verified

## Files

**Modify:**
- `src/App/App.tsx` (or wherever providers compose)
- `.env.example` — add `VITE_FUNDED_API_URL`, `VITE_FUNDED_STORAGE_PREFIX` (optional)

## Implementation steps

1. Locate root provider composition. Identify correct depth (after wagmi/query, before routes).
2. Wrap children with `<FundedContextProvider>`.
3. Add env vars to `.env.example` w/ comments.
4. Run `yarn start` and execute manual QA checklist below.

## Manual QA checklist

- [ ] Wallet not connected → header dropdown does NOT show funded button
- [ ] Connect wallet → header dropdown shows "Switch to Funded"
- [ ] Click → modal opens, journey list loads from BE
- [ ] No journeys → empty state renders correctly
- [ ] Pick journey + Connect → loading state visible → success closes modal
- [ ] After connect: header shows operator address, "Exit Funded" button
- [ ] Reload page → still in funded mode (same tab)
- [ ] Open new tab → NOT in funded mode (tab-scoped)
- [ ] Place test trade on `/trade` → tx signed by operator (verify via tx explorer if testnet)
- [ ] Click "Exit Funded" → back to normal mode, header reflects change
- [ ] Reload after exit → still in normal mode
- [ ] Approval-required scenario: fresh controller → approval tx prompt appears → confirm → mode activates
- [ ] Cancel approval tx → mode does NOT activate, state stays clean
- [ ] Read-only journey: connect succeeds, `isReadOnly=true` exposed (UI gating deferred — verify flag only)
- [ ] Error scenario: stop BE, attempt connect → error shown, state stays clean

## Todo

- [ ] Mount provider
- [ ] Update .env.example
- [ ] Run yarn tscheck
- [ ] Run yarn lint
- [ ] Run yarn test:ci
- [ ] Execute manual QA checklist
- [ ] Document any deferred items in `docs/project-roadmap.md` or release notes

## Success criteria

- All checklist items pass
- `yarn tscheck:ci` green
- `yarn lint:ci` green (max-warnings=0)
- `yarn test:ci` green — no regressions
- Existing non-funded trade flow unaffected (smoke test a normal trade)

## Risks

- Provider depth mistakes → context not available at consumers. Verify by mounting a debug log in `useFundedContext` consumer at app boot.
- BE downtime during QA → use mock if needed but flag deferred items.

## Docs sync

After phase complete, update:
- `docs/system-architecture.md` — note FundedContext in context map
- `docs/project-changelog.md` — entry for FUNDED mode switcher
- `docs/development-roadmap.md` — mark phase status

## Next

End of round 1. Deferred rounds:
- JWT auth (`/funded/auth/login`)
- Journey creation flow
- Read-only UI gating across trade surfaces
- Dashboard polling improvements
