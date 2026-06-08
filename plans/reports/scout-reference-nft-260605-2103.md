# NFT Feature Scout Report: Reference Implementation (mune-frontend-orderly)

**Date:** 2026-06-05 | **Source Branch:** origin/what-exchange | **Repo:** mune-frontend-orderly

---

## 1. PAGE LAYOUTS

### 1.1 NFT Management Page (`/nft`)
**Route:** `src/app/[lang]/nft/page.tsx` → `src/clients/pages/Nft/NftPage.tsx`

**Visual Structure (top-to-bottom):**
- **AppPage.Header** — Title "NFTs", description text explaining staking bonus (10% Silver, 25% Gold), footnote: extra funding across ALL FUNDED platforms EXCEPT app.foxify.trade
- **NftStakingSection** — Two-column layout:
  - LEFT: NFT preview card (208px × 208px) with dynamic border color/glow based on level, displays staked NFT or empty state
  - RIGHT: Action buttons (Stake Now, Unstake) + informational links (Buy on OpenSea, Merge button)
  - Extra funding tiers grid (3 cols) showing: None, Silver (+10%), Gold (+25%)
- **MigrateAndMintSection** — Migrate V2→V3 + mint from whitelist flow with approval dialogs
- **YourNftsSection** — Responsive NFT grid (2-6 cols based on breakpoint) with sort dropdown, cards show level badge + staked indicator, supports merge selection (max 5 NFTs)

**Dialogs used:**
- `NftSelectDialog` → stake dialog, lists all unstaked NFTs
- Confirmation dialogs for unstake, merge steps
- `NftDetailDialog` → NFT detail view
- `NftSuccessDialog` → post-action success toast

---

### 1.2 NFT Eligibility Page (`/nft/eligibility`)
**Route:** `src/app/[lang]/nft/eligibility/page.tsx` → `src/clients/pages/NftEligibility/NftEligibilityPage.tsx`

**Visual Structure (top-to-bottom):**
- **NftEligibilityHero** — Hero component (not shown, but likely title + description)
- **Check Eligibility Section** (max-width 48rem):
  - Section card with title "Check Eligibility" + description
  - `EligibilityWalletInput` — Address input field + "Use connected wallet" button + "Clear" button
  - Error banner (rose) if check fails
  - If checked:
    - **EligibilityStatusBanner** — Green card showing qualified mint count (0, 1, or 2) with emoji + remaining volume needed for 2nd mint
    - **Wave Cards Grid** (2 cols on md+) — Two cards, one per wave (Wave 1 @ Jul 2, Wave 2 @ Jul 3)
    - **SnapshotCountdownBanner** — Green/rose banner showing "Volume snapshot: Jul 1, 2026 20:00:00 UTC" + countdown timer
    - **VolumeProgress** — Progress bar showing volume vs. 250k target, percentage
  - Divider + `NftMintReminderButton` — Email reminder signup
- **NftEligibilityPerks** — 3-column grid (1 col mobile) with perks (Staking Rewards, Tier System, Exclusive Art)

---

## 2. DATA DEPENDENCIES

### 2.1 Web3 Contract Reads (Arbitrum)

**FoxifyTradingNFT (V3)** — Address: `0xE7594eF4D3a622ED70D45735bbE43972a05655cC`
- **useUserV3Nfts():** `usersIDsLength()`, `usersIDsList(address, 0, balance)`, `data(tokenId)` → (level, randomValue, timestamp)
- **useUserStakedNft():** `usersActiveID(address)` → staked tokenId
- **useCurrentMintWave():** `currentWave()` → (waveId, root, start, end, distribution)
- **useHasClaimed(waveId):** `claimed(waveId, address)` → bool
- **useMergeLevelRates():** `mergeLevelRates()` → (bronzeToSilver, silverToGold)
- **useMergeLevelPermissions():** `mergeLevelPermissions()` → (bronzeToSilver, silverToGold)
- **updateUserActiveID(tokenId)** — write, stakes NFT
- **setApprovalForAll(operator, approved)** — write, for migration
- Staking mutation: calls `updateUserActiveID(tokenId)` on Arbitrum

**FoxifyAffiliation (V2)** — Address: `0x3e120638c323F705350C504F14b02959f8282280`
- **useUserV2Nfts():** `balanceOf(address)`, `usersIDsList(address, 0, balance)`, `data(tokenId)` → (level, randomValue, timestamp)
- V2 NFTs cannot be staked (isStaked always false)

### 2.2 External API Calls

**NFT Metadata:**
- **Onchain tokenURI** — `tokenURI(tokenId)` contract call, fetch the metadata JSON from URI (CORS)
- **OpenSea API** — `https://api.opensea.io/api/v2/chain/arbitrum/contract/{address}/nfts/{tokenId}` (with API key `1080fc62d5b848b1b0fa6aebdb1425cb`)
- **Foxify API fallback** — `https://api.foxify.trade/funded/nfts/{tokenId}`
- **Merkle proof API** — `/api/merkle-proof?address={walletAddress}` (same-origin proxy to avoid CORS, proxies to nft.foxify.trade)

**Eligibility Volume Check:**
- **useEligibility hook** → `/funded/account-volume?walletAddress={address}&frontendId=mune` (AXIOS, returns `{ walletAddress, frontendId, volume }`)

### 2.3 Data Structure

**NftData** (from contract + metadata):
```typescript
{
  tokenId: bigint
  level: NftLevel (0=Unknown, 1=Bronze, 2=Silver, 3=Gold)
  randomValue: string (bytes32)
  timestamp: bigint (unix seconds)
  version: NftVersion ('V2' | 'V3')
  isStaked: boolean
  imageUrl?: string (from metadata)
  name?: string (fallback: "Foxify Trading NFT #{id}")
  attributes?: Array<{ trait_type: string; value: string }> (generated if unavailable)
}
```

**EligibilityResult** (from eligibility hook):
```typescript
{
  address: string | null
  isChecked: boolean
  isLoading: boolean
  error: string | null
  qualifiedMints: 0 | 1 | 2
  overallEligible: boolean
  waves: WaveEligibility[]
  volume: number
  volumeTarget: number (TWO_MINTS_VOLUME_TARGET = 250_000)
  volumePercent: number (clamped 0-100)
  volumeRemainingFor2Mints: number
}
```

---

## 3. BUSINESS LOGIC

### 3.1 NFT Levels & Bonuses
- **Bronze** (level 1): 0% bonus
- **Silver** (level 2): 10% extra FUNDED challenge funding
- **Gold** (level 3): 25% extra FUNDED challenge funding
- Extra funding applies to ALL FUNDED platforms/integrations EXCEPT app.foxify.trade

### 3.2 Staking
- User can stake ONE V3 NFT at a time (write `updateUserActiveID(tokenId)`)
- Staked NFT is tracked globally, queried on every page that shows funding bonus
- Unstaking calls `updateUserActiveID(0)` (zero ID = unstaked)
- Only V3 NFTs can be staked; V2 NFTs are view-only

### 3.3 NFT Merging
- Only Bronze & Silver NFTs can merge (not Gold — highest tier)
- All selected NFTs must be same level
- Minimum 2 NFTs required to merge, max 5 per action
- Bronze + Bronze → Silver (rate from `mergeLevelRates()[0]`)
- Silver + Silver → Gold (rate from `mergeLevelRates()[1]`)
- Merge permissions checked via `mergeLevelPermissions()` boolean flags
- Flow: Select NFTs (up to 5 same-level) → Warning dialog → Merge mutation

### 3.4 NFT Minting & Waves
**Eligibility Waves Configuration** (hardcoded in `config/waves.ts`):
- **Wave 1:** Mint date Jul 2, 2026; threshold 125k USD volume; criteria "Reach 125k USD cumulative volume"
- **Wave 2:** Mint date Jul 3, 2026; threshold 250k USD volume; must also qualify for Wave 1

**Volume Snapshot:** Jul 1, 2026 20:00:00 UTC — countdown timer displayed on eligibility page

**Mint Flow:**
1. User checks eligibility via wallet address input → fetches volume from `/funded/account-volume`
2. If volume >= 125k: eligible for Wave 1
3. If volume >= 250k: eligible for both waves (2 mints)
4. During active mint window: user can claim if not already claimed (`claimed(waveId, address)`)
5. Claim requires merkle proof from `/api/merkle-proof?address={wallet}` (whitelist)
6. Mint transaction calls contract with proof + wave ID

**Migration (V2→V3):**
- V2 NFTs can be migrated to V3 contract
- Requires approval: `setApprovalForAll(V3_CONTRACT_ADDRESS, true)` on V2 contract
- Migration passes V2 token IDs to V3 contract batch function

### 3.5 Volume Calculation
- **1 Mint Target:** 125,000 USD cumulative trading volume
- **2 Mint Target:** 250,000 USD cumulative trading volume
- Volume snapshot taken at fixed UTC time (Jul 1, 2026 20:00:00 UTC)
- Counts all perp + journey trading on the MUNE frontend

---

## 4. NAVIGATION INTEGRATION

**Menu Structure** (from `useOrderlyConfig.tsx`):

```
NFTs (parent href: /nft)
  ├─ NFT Management
  │  ├─ href: /nft
  │  └─ description: "Manage and stake your Foxify NFTs"
  └─ Mint Eligibility
     ├─ href: /nft/eligibility
     └─ description: "Check your mint eligibility for upcoming waves"
```

**How it's wired:**
- Menu item "NFTs" has `href: PathEnum.Nft` (= "/nft")
- Submenu array with 2 items
- `initialMenu` prop passed to `<BaseLayout>` matches `PathEnum.Nft` or `PathEnum.NftEligibility`
- Orderly Scaffold component renders nav based on `mainMenus` config array
- Both pages wrap content in `<BaseLayout initialMenu={PathEnum.Nft}>` or `<BaseLayout initialMenu={PathEnum.NftEligibility}>`

**PathEnum constants** (in `src/consts/index.ts`):
```typescript
Nft = '/nft'
NftEligibility = '/nft/eligibility'
```

---

## 5. EXTERNAL DEPENDENCIES

### 5.1 Libraries

**Web3:**
- `viem` — Arbitrum public client, wallet client, contract simulation/writes
- `@orderly.network/hooks` — `useAccount()` for wallet state
- `@tanstack/react-query` — data fetching, caching, mutations

**UI:**
- `@orderly.network/ui` — `Button`, `toast` components
- `lucide-react` — icons (ChevronDown, Grid, AlertCircle, Wallet, ArrowRight, Sparkles, Lock)
- Custom `SafeDialog` wrapper (from `@/components/common/SafeDialog`)
- Tailwind CSS for styling

**State:**
- React Context (NftContext) for page-level state (selectedNfts, sortOption, refetch trigger)
- React Query for server state

**Other:**
- `next/image` — image optimization
- `next/link` — client-side navigation
- `clsx` — classname utilities

### 5.2 Assets

**Images in `/public`:**
- `/nft-placeholder.png` — fallback NFT image
- OpenSea logo (inline SVG in components for Buy button)
- `/rankicons/` — not used in NFT feature

**Contract ABIs** (in `src/clients/abis/common/`):
- `FoxifyTradingNFT.json` — V3 contract ABI
- `FoxifyAffiliation.json` — V2 contract ABI

---

## 6. COMPLEXITY ASSESSMENT

### 6.1 Heavy Web3 Logic
- **useNftData.ts** (5+ hooks) — Most complex: contract reads for V2 & V3, metadata fetching with fallback chain (onchain URI → OpenSea → fallback API), trait generation from seed
- **Staking/unstaking mutations** — Arbitrum chain switching, simulation, writeContract, receipt polling
- **Merge logic** — Multi-step state machine (selection → warning → execution)
- **Eligibility volume check** — API call to fetch volume, then deterministic wave calculation

**Difficulty:** HIGH
- Parallel data fetching (V2 + V3 NFTs simultaneously)
- Merkle proof integration
- Trait generation algorithm (deterministic from randomValue seed)
- Transaction simulation + waiting pattern
- Chain switching (to Arbitrum)

### 6.2 Pure UI/Layout
- NftCard, YourNftsSection (grid + sort dropdown)
- NftStakingSection (flexbox layout, glow effects)
- EligibilityWalletInput (form)
- StatusBanner, WaveCard, VolumeProgress (display components)

**Difficulty:** LOW to MEDIUM
- Responsive grid layouts
- Custom styling with level-based colors/glows
- Dialog components

### 6.3 State Management
- **NftContext** — Simple, local to page. Tracks selected NFTs (Set<bigint>), sortOption, canMerge calculation
- **useEligibility** — Input address state + checked address state, builds result object

**Difficulty:** LOW

---

## 7. PORTING CHALLENGES TO VITE + REACT-ROUTER + WAGMI

### Critical Differences

1. **Next.js App Router → React Router**
   - Page wrapping: remove `BaseLayout` wrapper, use `<Layout>` component instead
   - `initialMenu` prop: encode in route matching, not prop passing
   - Metadata: remove `export const metadata`, use Helmet or react-helmet-async

2. **Orderly.network Hooks → Wagmi**
   - `useAccount()` from `@orderly.network/hooks` → `useAccount()` from wagmi
   - Different API: `state.address` (orderly) vs `address` (wagmi)
   - Connection state differs

3. **Orderly Scaffold NavBar → Custom Nav**
   - Remove dependency on `@orderly.network/ui-scaffold`
   - Rebuild nav with React Router `<Link>`, `useLocation()` for active state
   - Define menu structure in config, consume in custom NavBar component

4. **Contract Clients**
   - `arbitrumPublicClient` uses viem (good, compatible)
   - `switchToArbitrumAndGetClient()` — needs to be reimplemented for wagmi `useSwitchChain()` + `useWalletClient()`
   - Replace viem's `readContract`/`writeContract` with wagmi equivalents

5. **Contract ABIs**
   - Keep as-is JSON files, they're chain-agnostic
   - Wagmi can use them directly in hooks

6. **Dialog Component**
   - `SafeDialog` from Orderly UI — replace with shadcn/ui `Dialog` or custom
   - Re-export as `Dialog`, `DialogContent`, `DialogTitle`, `DialogBody` for drop-in compatibility

7. **Button Styling**
   - Orderly Button with custom `style=` inline — migrate to shadcn Button with `className` + Tailwind
   - Ensure color CSS var `--color-foxify-primary` is defined in Tailwind config

### Hardest Parts to Port

1. **Merkle Proof Proxy** — `/api/merkle-proof` route needs to be recreated. Currently proxies to nft.foxify.trade. Requires same logic in Vite+React project's API layer (if using Vite + Express, or external API).

2. **OpenSea Metadata Fallback** — OpenSea API key is hardcoded. Needs environment variable + proper CORS handling or backend proxy.

3. **Chain Switching** — Orderly's `switchToArbitrumAndGetClient()` abstraction needs to map to wagmi's `useSwitchChain()` hook pattern.

4. **Eligibility Volume API** — Depends on `/funded/account-volume` endpoint. Ensure backend is compatible or refactor to alternative source.

5. **Toast System** — Orderly UI's `toast.success()` / `toast.error()` — replace with Sonner or similar library.

---

## 8. UNRESOLVED QUESTIONS

1. **Merkle Proof Validation** — Is the merkle proof checked client-side before submission, or only server-side in the contract? Current code fetches but doesn't show validation flow.

2. **Volume Snapshot Timing** — Why fixed snapshot at Jul 1 20:00 UTC? Is this dynamically configurable in contract or hardcoded? Current code hardcodes date in hook.

3. **Affiliate API Compatibility** — Does the `/funded/account-volume` API exist in the gmx-interface backend, or needs to be built?

4. **OpenSea API Rate Limits** — API key is exposed in frontend code. How is rate limiting handled? Is there a backend proxy in production?

5. **V2 NFT Migration Endpoint** — Which contract function handles V2→V3 migration? Code mentions `setApprovalForAll` but actual migration call is not shown in excerpt.

6. **Trait Generation Algorithm** — The `generateTraitsFromOnchainData()` function uses pseudo-random selection based on `randomValue` seed. Is this deterministic reproducible on-chain or just for display?

7. **Mint Wave Scheduling** — Are mint waves (wave ID, root, start, end, distribution) stored on-chain and queryable, or defined in backend config?

8. **Extra Funding Application** — How is the staked NFT's bonus (10% or 25%) applied in the FUNDED challenge contract? Does FUNDED pull the staked NFT data from the NFT contract, or is it passed separately?

---

## FILES SUMMARY

**Core Route Wrappers:**
- `src/app/[lang]/nft/page.tsx`
- `src/app/[lang]/nft/eligibility/page.tsx`

**Main Page Components:**
- `src/clients/pages/Nft/NftPage.tsx`
- `src/clients/pages/Nft/types.ts`
- `src/clients/pages/Nft/index.ts`
- `src/clients/pages/NftEligibility/NftEligibilityPage.tsx`

**Hooks & Contexts:**
- `src/clients/pages/Nft/hooks/useNftData.ts` (complex, ~400 lines)
- `src/clients/pages/Nft/contexts/NftContext.tsx`
- `src/clients/pages/NftEligibility/hooks/useEligibility.ts`
- `src/clients/pages/NftEligibility/hooks/useVolumeSnapshotCountdown.ts`

**Nft Page Components:**
- `src/clients/pages/Nft/components/NftStakingSection.tsx`
- `src/clients/pages/Nft/components/MigrateAndMintSection.tsx`
- `src/clients/pages/Nft/components/YourNftsSection.tsx`
- `src/clients/pages/Nft/components/NftCard.tsx`
- `src/clients/pages/Nft/components/NftSelectDialog.tsx`
- `src/clients/pages/Nft/components/NftDetailDialog.tsx`
- `src/clients/pages/Nft/components/NftMergeSelectionDialog.tsx`
- `src/clients/pages/Nft/components/MergeWarningDialog.tsx`
- `src/clients/pages/Nft/components/NftSuccessDialog.tsx`

**NftEligibility Page Components:**
- `src/clients/pages/NftEligibility/NftEligibilityPage.tsx`
- `src/clients/pages/NftEligibility/components/NftEligibilityHero.tsx`
- `src/clients/pages/NftEligibility/components/NftEligibilityPerks.tsx`
- `src/clients/pages/NftEligibility/components/EligibilityWalletInput.tsx`
- `src/clients/pages/NftEligibility/components/WaveCard.tsx`
- `src/clients/pages/NftEligibility/components/VolumeProgress.tsx`
- `src/clients/pages/NftEligibility/components/NftMintReminderButton.tsx`
- `src/clients/pages/NftEligibility/components/NftMintReminderDialog.tsx`
- `src/clients/pages/NftEligibility/components/NftMintEmailReminder.tsx`

**Config:**
- `src/clients/pages/NftEligibility/config/waves.ts`

**ABIs:**
- `src/clients/abis/common/FoxifyTradingNFT.json`
- `src/clients/abis/common/FoxifyAffiliation.json`

**Navigation Config:**
- `src/hooks/shared/useOrderlyConfig.tsx` (menu structure defined here)
- `src/consts/index.ts` (PathEnum)

