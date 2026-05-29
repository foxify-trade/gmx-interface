# Project Roadmap

## FUNDED Journey Mode

### Completed in this rollout

- Current-app-native funded config and typed preview adapters
- `/funded/start-journey` modular UI port
- `/funded/challenge-dashboard` modular UI port
- Query-preserving funded navigation and degraded live-read fallback

### Deferred

- Funded mode switching and wallet/provider integration
- Journey list page
- Funded leaderboards
- Live funded trading and withdrawals

### Remaining blocker

- Repo-wide `yarn tscheck:ci` currently fails on existing React Router / Portal JSX typing issues that predate this funded preview work.
