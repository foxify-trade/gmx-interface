# Phase 05 — UI: Header Switcher + Journey Selector

**Status:** pending
**Priority:** P0
**Est. LOC:** ~250
**Depends on:** Phase 03 (can run parallel to Phase 04)

## Context

Entry-point UI for mode switching. Lives in the header account dropdown. Must clearly show current mode and let user enter/exit funded mode.

Reference:
- Existing header user component (locate via grep `AppHeaderUser` or similar)
- `mune-frontend-orderly/src/clients/pages/FundedJourneys/FunderJourneysTable.tsx` (journey list UI inspiration)

## Key insights

- Two surfaces:
  1. **Switcher button/menu-item** in header dropdown — shows "Normal mode" or "Funded: {challengeName}" — clicking either enters/exits mode
  2. **JourneySelectorModal** — lists available journeys (from `useFundedJourneys`), user picks one, modal triggers `connectFunded`
- In funded mode the dropdown should also show: operator address (truncated), controller address, read-only badge if applicable, "Exit Funded" action.
- Must respect `isSwitchingMode` — disable button + show spinner during transition.

## Requirements

- `<FundedSwitcherButton />` renders inside header user menu
- Shows current mode (Normal / Funded:label)
- Opens `<JourneySelectorModal />` if not in funded mode
- Provides exit action if in funded mode
- Modal lists journeys w/ name, track, level, status; shows empty state if list is empty; shows error if fetch failed
- Modal "Connect" button on selected journey triggers `connectFunded`; shows spinner; closes on success; shows error on failure

## Files

**Create:**
- `src/components/Funded/FundedSwitcherButton.tsx`
- `src/components/Funded/JourneySelectorModal.tsx`
- `src/components/Funded/funded-switcher-styles.module.css` (optional; or Tailwind)

**Modify:**
- Existing header user menu (locate exact file during implementation; likely `src/components/Header/AppHeaderUser/...`)

## Implementation steps

1. Locate exact header user menu file (`grep -r "AppHeaderUser" src/components/Header`)
2. `FundedSwitcherButton.tsx`:
   - Read `{ isFundedMode, isSwitchingMode, fundedAccount, isReadOnly, fundedAccountInfo, disconnectFunded }` via `useFundedContext`
   - Internal `useState` for modal open
   - Layout:
     - Not in funded mode → button "Switch to Funded" → onClick → setModalOpen(true)
     - In funded mode → row showing operator address (truncated), readOnly badge if applicable, "Exit Funded" button → onClick → `disconnectFunded()`
   - Disable while `isSwitchingMode`
3. `JourneySelectorModal.tsx`:
   - Props: `{ open, onClose }`
   - Read `{ connectFunded }` from FundedContext
   - Use `useFundedJourneys(mainWalletAddress)` (phase 02 hook)
   - Render list of journeys w/ radio select
   - Connect button: `await connectFunded(selected.controllerAddress)` → onClose() on success
   - States: loading, empty, error
4. Mount `<FundedSwitcherButton />` inside header user menu — only when `FUNDED_ENABLED && walletConnected`
5. Translation strings (lingui) for all visible text — match existing project pattern

## Todo

- [ ] Locate header user menu file
- [ ] FundedSwitcherButton.tsx
- [ ] JourneySelectorModal.tsx
- [ ] Mount in header
- [ ] Lingui strings
- [ ] Tailwind/CSS styling matches existing menu items
- [ ] `yarn tscheck` green
- [ ] Manually verify: open menu, see button, click → modal opens

## Success criteria

- Button visible only when wallet connected AND `FUNDED_ENABLED`
- Click → modal opens with journey list (or empty state)
- Pick journey + Connect → mode switches, modal closes
- Header dropdown reflects funded mode after switch
- "Exit Funded" returns to normal mode
- All states (loading, empty, error) render correctly

## Risks

- Existing header user menu structure may not accept arbitrary children — may need a small refactor of the menu container. Document scope creep if it grows.
- Lingui extract step required after adding strings.

## Next

→ Phase 06 (wire provider into root + manual QA)
