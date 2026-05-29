# Project Changelog

## 2026-05-29

- Added feature-gated FUNDED preview routes at `/funded/start-journey` and `/funded/challenge-dashboard`.
- Added `src/config/funded.ts` with `VITE_ENABLE_FUNDED`, optional `VITE_FUNDED_API_URL`, route constants, and preview-state messaging.
- Added typed funded domain adapters for track data, dashboard demo data, controller sanitization, and live-read fallback behavior.
- Preserved `controllerAddress` across funded navigation and forwarded it into live dashboard reads when a FUNDED API URL is configured.
- Kept funded mode switching, journey list, and leaderboards deferred.
- Validation status: focused funded tests pass; funded-file lint passes; repo-wide `yarn tscheck:ci` is still blocked by existing React Router / Portal JSX typing failures outside this slice.
