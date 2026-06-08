# Scout Report: GMX Interface Feature Addition Conventions
**Date**: 2026-06-05 | **Time**: 21:04 | **Project**: gmx-interface (Vite + React Router + TypeScript + Tailwind CSS)

---

## 1. ROUTING SETUP

### Where Routes Are Declared
- **Primary file**: `/src/App/MainRoutes.tsx` — Contains `<Switch>` with all `<Route>` definitions
- **Pattern**: React Router v5 (`react-router-dom`) using `<Switch>`, `<Route>`, `<Redirect>`
- **Notable**: Routes are NOT in a separate config file; they're JSX-based inline

### How a New Page Route is Added
1. **Import the page component** (lazy or direct)
2. **Add a `<Route>` entry** in `MainRoutes.tsx` with path and component
3. **Example from funded routes** (lines 196–204):
   ```tsx
   <Route exact path="/funded/start-journey">
     {FUNDED_ENABLED ? <FundedStartJourneyPage /> : <PageNotFound />}
   </Route>
   <Route exact path="/funded/my-journeys">
     {FUNDED_ENABLED ? <FundedMyJourneysPage /> : <PageNotFound />}
   </Route>
   <Route exact path="/funded/challenge-dashboard">
     {FUNDED_ENABLED ? <FundedDashboardPage /> : <PageNotFound />}
   </Route>
   ```

### Lazy Loading Pattern
Routes wrapped with `lazy()` + `Suspense` from React:
```tsx
const LazyFundedStartJourneyPage = lazy(() =>
  import("pages/FundedStartJourneyPage/FundedStartJourneyPage").then((module) => ({
    default: module.FundedStartJourneyPage,
  }))
);
const FundedStartJourneyPage = () => (
  <Suspense fallback={<Trans>Loading...</Trans>}>
    <LazyFundedStartJourneyPage />
  </Suspense>
);
```

---

## 2. NAVIGATION / SIDEBAR (MOST IMPORTANT FOR NFT FEATURE)

### Sidebar Location & Structure
- **Component**: `/src/components/SideNav/SideNav.tsx`
- **Expandable submenu pattern**: `/src/components/SideNav/FundedExpandableNavItem.tsx` ← **KEY REFERENCE**
- **Bottom menu (settings, language, collapse)**: `/src/components/SideNav/BottomMenuSection.tsx`

### EXACT: Parent Nav Item with Expandable Submenus

**Data structure** (`FundedExpandableNavItem.tsx`, lines 47–51):
```tsx
const subItems = [
  { label: t`Start Journey`, to: FUNDED_ROUTES.startJourney },
  { label: t`My Journeys`, to: FUNDED_ROUTES.myJourneys },
  { label: t`Journey Dashboard`, to: FUNDED_ROUTES.challengeDashboard },
];
```

**Component structure** (lines 23–103 in `FundedExpandableNavItem.tsx`):
1. **Parent button** (clickable toggle) — icon + label + chevron (up/down)
   - Expanded state managed by local `useState`
   - Auto-expands when pathname starts with `/funded`
   - Styling: uses `ACTIVE_ITEM_CLASS` and `HOVER_CLASS` constants
2. **Sub-items list** (conditional render `{isExpanded && ...}`)
   - `<ul>` with `pl-8` (left padding for nesting)
   - Each sub-item is a `<Link>` wrapping a button
   - Small dot indicator (`ml-4 size-4 rounded-full bg-current opacity-50`)
   - Active state: `pathname === item.to` highlights current sub-item

**Class styling pattern**:
```tsx
const ACTIVE_ITEM_CLASS = "bg-blue-400/20 !text-blue-400 dark:bg-slate-700 dark:!text-typography-primary";
const HOVER_CLASS = 
  "group-hover:bg-blue-400/20 group-hover:text-blue-400 dark:group-hover:bg-slate-700 dark:group-hover:text-typography-primary";
```

**Collapsed sidebar behavior** (lines 33–45):
When sidebar is collapsed, the expandable item falls back to a simple `<NavItem>` (non-expandable):
```tsx
if (isCollapsed) {
  return (
    <NavItem
      icon={<StarIcon className="size-20" />}
      label={t`FUNDED`}
      isActive={isFundedRoute}
      isCollapsed={isCollapsed}
      to={FUNDED_ROUTES.startJourney}  // Links to first sub-item
      onClick={onMenuItemClick}
    />
  );
}
```

### How Expandable Submenus Are Registered in SideNav

In `/src/components/SideNav/SideNav.tsx`, line 205:
```tsx
{FUNDED_ENABLED && <FundedExpandableNavItem isCollapsed={isCollapsed} onMenuItemClick={onMenuItemClick} />}
```

The `MenuSection` component renders pre/post nav items + the FUNDED expandable item.

### NavItem Base Component
Simple wrapper for single nav items (`SideNav.tsx`, lines 101–157):
- Icon, label, active state, to/external link
- Used for `Trade`, `Leaderboard`, and as fallback for collapsed expandable items

---

## 3. PAGE STRUCTURE

### Standard Page Layout Wrapper
- **Component**: `/src/components/AppPageLayout/AppPageLayout.tsx`
- **Props**: `title`, `header`, `children`, `className`, `contentClassName`, `sideNav`, `pageWrapperClassName`, `footer`
- **Usage**: All pages use this wrapper

**Example from FundedStartJourneyPage.tsx, line 51**:
```tsx
<AppPageLayout title="GMX FUNDED" header={<ChainContentHeader />}>
  <div className="page-layout flex flex-col gap-18">
    {/* page content */}
  </div>
</AppPageLayout>
```

### Page Component Conventions
1. **Title prop** – translatable string for page title (used in `<SEO>`)
2. **Header prop** – typically `<ChainContentHeader />` (shows network/account info)
3. **Content wrapper** – `<div className="page-layout flex flex-col gap-18">` (spacing utility)
4. **Use of `<Trans>` macro** for text that appears in UI

### Representative Page: FundedStartJourneyPage
**Path**: `/src/pages/FundedStartJourneyPage/FundedStartJourneyPage.tsx`

**Key elements**:
- Imports: wallet hook (`useWallet`), routing (`useLocation`), domain logic (`FUNDED_FEATURES`, `FUNDED_TRACKS`)
- State management: `useState` for UI flags (track selection, modals)
- Responsive layout: semantic section tags + Tailwind classes
- SEO: page title passed to `AppPageLayout`

---

## 4. STYLING CONVENTIONS

### CSS Approach: **Tailwind CSS + Inline SCSS**
- **Primary**: Tailwind CSS utility classes (Prefixed with color tokens)
- **Secondary**: Component-level SCSS files (e.g., `SupportChatNavItem.scss`)
- **No**: CSS Modules (`.module.scss`); no styled-components

### Color System
- **Location**: `/src/config/colors.ts`
- **Tailwind config**: `/tailwind.config.ts` — extends colors + CSS variables
- **Colors**: `text-typography-primary`, `text-typography-secondary`, `bg-blue-400/20`, `text-slate-400`, etc.
- **Dark mode**: CSS variable-based (`:root` selector) — supported natively

### Example from FundedExpandableNavItem.tsx:
```tsx
<div
  className={cx(
    "relative flex w-full cursor-pointer items-center gap-8 rounded-8 px-12 py-10 text-typography-secondary",
    HOVER_CLASS,  // predefined class string
    { [ACTIVE_ITEM_CLASS]: isFundedRoute }  // conditional
  )}
>
```

### Spacing/Sizing
- Uses Tailwind scale: `gap-8`, `px-12`, `py-10`, `rounded-8`, `size-20`, etc.
- Border utilities: `border-1/2`, `border-slate-600`, `rounded-8`

### SVG Icons
- SVG files imported as React components: `import StarIcon from "img/ic_star.svg?react";`
- Size controlled with `className="size-20"` (Tailwind)

---

## 5. i18n (LINGUI)

### Library: Lingui (`@lingui/macro`, `@lingui/react`)

### Pattern 1: Macro `t` (translatable string)
```tsx
import { t } from "@lingui/macro";
const label = t`Start Journey`;
```

### Pattern 2: JSX `<Trans>` component
```tsx
import { Trans } from "@lingui/macro";
<Trans>Total stats</Trans>
```

### Pattern 3: `useLingui()` hook for dynamic locale
```tsx
const { i18n } = useLingui();
// i18n.locale gives current locale
```

### Locale Files Location
- **Catalogs**: `/src/locales/{locale}/messages.po` and `messages.js`
- **Supported locales**: `en`, `es`, `zh`, `zh-tw`, `ko`, `ru`, `ja`, `fr`, `de` (+ `pseudo` in dev)
- **Activation**: `lib/i18n.ts` — `dynamicActivate(locale)` function

### Example Usage in SideNav
```tsx
{ icon: <TradeIcon className="size-20" />, label: t`Trade`, key: "trade", to: "/trade" }
```

---

## 6. WEB3 / CONTRACTS

### Wallet Integration: Wagmi
- **Hook**: `useWallet()` from `/lib/wallets/useWallet.ts` — wraps wagmi hooks
- **Returns**: `{ account, active, chainId, signer, connectorClient, walletClient }`
- **Wagmi hooks used internally**: `useAccount()`, `useConnectorClient()`, `useWalletClient()`

### Contract Configuration
- **Chains**: Imported from `sdk/configs/chains` (e.g., `ARBITRUM`, `AVALANCHE`, `ARBITRUM_SEPOLIA`)
- **Contracts**: Imported from `sdk/configs/contracts` via `getContract(chainId, ContractName)`
- **Files**:
  - `/src/config/chains.ts` — re-exports from SDK, defines `CONTRACTS_CHAIN_IDS`, `DEFAULT_SETTLEMENT_CHAIN_ID`
  - `/src/config/contracts.ts` — wraps SDK's `getContract()` in a try/catch `tryGetContract()`

### Example Chain Constants
```tsx
import { ARBITRUM, AVALANCHE } from "config/chains";
export const ACTIVE_CHAIN_IDS = [ARBITRUM, AVALANCHE];
```

### Supported Chains
- Mainnet: Arbitrum, Avalanche
- Testnet: Arbitrum Sepolia, Avalanche Fuji
- Special: Megaeth, Botanix

### On-Chain Read Example (from DashboardV2.tsx)
```tsx
const statsArbitrum = useDashboardChainStatsMulticall(ARBITRUM);  // Hook call
```
Hooks defined in domain/ folders (e.g., `domain/legacy`, `domain/synthetics`).

---

## 7. CONFIG & FEATURE FLAGS

### Feature Flag Pattern: FUNDED_ENABLED
**File**: `/src/config/funded.ts`

```tsx
export const FUNDED_ENABLED = parseFundedFlag(viteEnv.VITE_ENABLE_FUNDED);
export const FUNDED_ROUTES = {
  startJourney: "/funded/start-journey",
  myJourneys: "/funded/my-journeys",
  challengeDashboard: "/funded/challenge-dashboard",
} as const;
```

**Usage in Routes** (MainRoutes.tsx, line 197):
```tsx
<Route exact path="/funded/start-journey">
  {FUNDED_ENABLED ? <FundedStartJourneyPage /> : <PageNotFound />}
</Route>
```

**Usage in SideNav** (SideNav.tsx, line 205):
```tsx
{FUNDED_ENABLED && <FundedExpandableNavItem isCollapsed={isCollapsed} onMenuItemClick={onMenuItemClick} />}
```

---

## 8. EXISTING NFT CODE

**Result**: ZERO existing NFT code. Grep search across entire `/src` found no matches for "nft", "NFT".

---

## RECOMMENDATIONS FOR NFT FEATURE

### 1. Routes (/nft, /nft/eligibility)
Add to `MainRoutes.tsx` after funded routes:
```tsx
<Route exact path="/nft">
  <NFTManagementPage />
</Route>
<Route exact path="/nft/eligibility">
  <NFTEligibilityPage />
</Route>
```

### 2. Sidebar Nav Item
Create `/src/components/SideNav/NFTExpandableNavItem.tsx` similar to `FundedExpandableNavItem.tsx`:
- Parent: "NFT" with icon (e.g., gem, diamond SVG)
- Sub-items:
  - `{ label: t`NFT Management`, to: "/nft" }`
  - `{ label: t`NFT Eligibility`, to: "/nft/eligibility" }`
- Use same styling patterns (`ACTIVE_ITEM_CLASS`, `HOVER_CLASS`)
- Register in `MenuSection` after FUNDED item

### 3. Pages
Create in `/src/pages/`:
- `NFTManagementPage/NFTManagementPage.tsx`
- `NFTEligibilityPage/NFTEligibilityPage.tsx`
Both wrapped with `AppPageLayout` + `ChainContentHeader`

### 4. Config
Add to `/src/config/nft.ts` (new file):
```tsx
export const NFT_ENABLED = parseNftFlag(viteEnv.VITE_ENABLE_NFT);
export const NFT_ROUTES = {
  management: "/nft",
  eligibility: "/nft/eligibility",
} as const;
```

### 5. i18n
Strings will auto-extract from `t` and `<Trans>` macros when running Lingui extract.

---

## UNRESOLVED QUESTIONS

1. **NFT contract/on-chain integration**: Which chain(s) should NFT contract calls target? (Arbitrum? Multi-chain?)
2. **Wallet requirement**: Should NFT pages require wallet connection, or can they be viewed without?
3. **NFT data source**: Is there an API endpoint, or on-chain data only? If API, should it follow `VITE_FUNDED_API_URL` pattern?
4. **SVG icon**: What icon should NFT nav item use? Need design asset or use existing icon?
5. **Feature flag env var**: What should the env var be named? (e.g., `VITE_ENABLE_NFT`?)
6. **Page content structure**: Should NFT pages mirror funded dashboard (tabs, summary cards) or different layout?

---

## KEY FILES TO REFERENCE

| Component | File | Purpose |
|-----------|------|---------|
| Routes | `src/App/MainRoutes.tsx` | All route definitions |
| Sidebar | `src/components/SideNav/SideNav.tsx` | Main sidebar + menu items list |
| Expandable Item | `src/components/SideNav/FundedExpandableNavItem.tsx` | **Template for NFT item** |
| Page Layout | `src/components/AppPageLayout/AppPageLayout.tsx` | Standard page wrapper |
| Example Page | `src/pages/FundedStartJourneyPage/FundedStartJourneyPage.tsx` | Page structure reference |
| Config | `src/config/funded.ts` | Feature flag + routes constants pattern |
| Colors | `src/config/colors.ts` | Color definitions |
| i18n | `src/lib/i18n.ts` | i18n activation |
| Wallet | `src/lib/wallets/useWallet.ts` | Wallet hook |

---

**Report generated**: 2026-06-05 21:04 UTC
