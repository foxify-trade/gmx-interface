import type { Address } from "viem";

import { FUNDED_DEMO_CONTROLLER_ADDRESS } from "config/funded";

import type {
  FundedDashboardData,
  FundedFeatureItem,
  FundedGuideStep,
  FundedMarketGroup,
  FundedTrackDefinition,
} from "./funded-types";

export const FUNDED_TRACKS: FundedTrackDefinition[] = [
  {
    id: "entry",
    eyebrow: "Starter ladder",
    label: "Entry Track",
    description: "Lower deposit, slower progression, and broader room to validate the funded flow before account switching lands.",
    depositUsd: 100,
    startsAtUsd: 500,
    levelsToTop: 6,
    levels: [
      {
        id: "spark",
        name: "Spark",
        accountSizeUsd: 500,
        depositUsd: 100,
        profitTargetUsd: 75,
        pointsTarget: 100,
        maxDrawdownPct: 20,
        accentColor: "#94a3b8",
      },
      {
        id: "surge",
        name: "Surge",
        accountSizeUsd: 1250,
        depositUsd: 150,
        profitTargetUsd: 187.5,
        pointsTarget: 100,
        maxDrawdownPct: 15,
        accentColor: "#60a5fa",
      },
      {
        id: "bronze",
        name: "Bronze",
        accountSizeUsd: 2500,
        depositUsd: 175,
        profitTargetUsd: 375,
        pointsTarget: 100,
        maxDrawdownPct: 15,
        accentColor: "#cd7f32",
      },
      {
        id: "silver",
        name: "Silver",
        accountSizeUsd: 5000,
        depositUsd: 350,
        profitTargetUsd: 750,
        pointsTarget: 100,
        maxDrawdownPct: 12,
        accentColor: "#9ca3af",
      },
      {
        id: "gold",
        name: "Gold",
        accountSizeUsd: 7500,
        depositUsd: 350,
        profitTargetUsd: 1125,
        pointsTarget: 100,
        maxDrawdownPct: 10,
        accentColor: "#f59e0b",
      },
      {
        id: "platinum",
        name: "Platinum",
        accountSizeUsd: 10000,
        depositUsd: 500,
        profitTargetUsd: 1500,
        pointsTarget: 100,
        maxDrawdownPct: 10,
        accentColor: "#d946ef",
      },
    ],
  },
  {
    id: "pro",
    eyebrow: "Faster ladder",
    label: "Pro Track",
    description: "Bigger starting sizes with fewer level jumps. This route stays preview-only until funded mode switching is implemented.",
    depositUsd: 500,
    startsAtUsd: 2500,
    levelsToTop: 4,
    badgeLabel: "Faster",
    levels: [
      {
        id: "bronze",
        name: "Bronze",
        accountSizeUsd: 2500,
        depositUsd: 500,
        profitTargetUsd: 375,
        pointsTarget: 100,
        maxDrawdownPct: 20,
        accentColor: "#cd7f32",
      },
      {
        id: "silver",
        name: "Silver",
        accountSizeUsd: 5000,
        depositUsd: 500,
        profitTargetUsd: 750,
        pointsTarget: 100,
        maxDrawdownPct: 15,
        accentColor: "#9ca3af",
      },
      {
        id: "gold",
        name: "Gold",
        accountSizeUsd: 7500,
        depositUsd: 500,
        profitTargetUsd: 1125,
        pointsTarget: 100,
        maxDrawdownPct: 12,
        accentColor: "#f59e0b",
      },
      {
        id: "platinum",
        name: "Platinum",
        accountSizeUsd: 10000,
        depositUsd: 500,
        profitTargetUsd: 1500,
        pointsTarget: 100,
        maxDrawdownPct: 12,
        accentColor: "#d946ef",
      },
    ],
  },
];

export const FUNDED_FEATURES: FundedFeatureItem[] = [
  { icon: "🚫", title: "No KYC", description: "Stay anonymous. No identity verification at any point." },
  { icon: "📰", title: "News Trading Allowed", description: "Trade high-impact news events freely." },
  { icon: "🤖", title: "Algos & Bots Welcome", description: "Automated strategies are fully permitted." },
  { icon: "🌙", title: "No Overnight Fee", description: "Hold trades as long as you want, zero extra cost." },
  { icon: "📉", title: "No Trailing Drawdown", description: "Fixed drawdown only. Your limit never moves against you." },
  { icon: "⚖️", title: "Hedging Allowed", description: "Hedge freely across positions and accounts." },
  { icon: "📂", title: "Multiple Accounts", description: "Run multiple funded accounts simultaneously." },
  { icon: "⛓️", title: "100% On-Chain Rules", description: "Every challenge rule is enforced by contracts, not a support queue." },
  { icon: "⚡", title: "Instant Payouts", description: "Payout narrative stays visible while setup remains preview-only in this app shell." },
];

export const FUNDED_MARKET_GROUPS: FundedMarketGroup[] = [
  { icon: "₿", title: "Crypto", badgeLabel: "100+ pairs", symbols: ["BTC", "ETH", "SOL", "DOGE", "XRP", "AVAX"] },
  { icon: "🪙", title: "Metals", symbols: ["Gold", "Silver"] },
  { icon: "📈", title: "Indices", symbols: ["S&P 500", "NASDAQ 100"] },
  { icon: "🏢", title: "Stocks", symbols: ["NVDA", "GOOGL", "TSLA"] },
];

export const FUNDED_GUIDE_STEPS: FundedGuideStep[] = [
  { title: "Choose a track", description: "Entry and Pro define the starting deposit, first account size, and how quickly the ladder scales." },
  { title: "Lock a controller", description: "The real funded flow will mint or attach a funded controller account. This preview keeps that action informational." },
  { title: "Trade on GMX", description: "Normal GMX trading remains the default. Full funded mode switching stays deferred until the provider integration is approved." },
  { title: "Review challenge stats", description: "The funded dashboard already supports a direct controller lookup and can fall back to typed preview data." },
];

export function getFundedDashboardDemo(
  controllerAddress?: Address,
  options?: { degraded?: boolean; announcement?: string }
): FundedDashboardData {
  return {
    meta: {
      source: "demo",
      controllerAddress: controllerAddress ?? FUNDED_DEMO_CONTROLLER_ADDRESS,
      readonly: true,
      degraded: options?.degraded ?? false,
      lastUpdatedLabel: "Preview dataset refreshed 5 minutes ago",
      announcement:
        options?.announcement ??
        "Preview mode is active. Account setup, mode switching, and withdrawals remain intentionally disabled in this release.",
    },
    summary: {
      trackLabel: "Pro Track",
      levelLabel: "Gold",
      accountSizeUsd: 10000,
      collateralUsd: 500,
      drawdownLimitPct: 12,
      currentPnlUsd: 642.38,
      currentPnlPct: 6.4,
      maxDrawdownPct: 4.8,
      minProfitTargetUsd: 1125,
      totalVolumeUsd: 182430,
      currentPoints: 8640,
      pointsRequired: 12000,
      remainingHours: 38,
      status: "Readonly Preview",
    },
    pnlSeries: [
      { label: "Mon", value: 45 },
      { label: "Tue", value: 132 },
      { label: "Wed", value: 188 },
      { label: "Thu", value: 301 },
      { label: "Fri", value: 418 },
      { label: "Sat", value: 580 },
      { label: "Sun", value: 642.38 },
    ],
    volumeSeries: [
      { label: "Mon", value: 12200 },
      { label: "Tue", value: 18400 },
      { label: "Wed", value: 24350 },
      { label: "Thu", value: 26880 },
      { label: "Fri", value: 30420 },
      { label: "Sat", value: 33800 },
      { label: "Sun", value: 36380 },
    ],
    modifiers: [
      { label: "Sharpe bonus", value: "+6.2%", tone: "positive" },
      { label: "Calmar bonus", value: "+4.1%", tone: "positive" },
      { label: "Consistency", value: "+3.4%", tone: "positive" },
      { label: "Combined multiplier", value: "1.14x", tone: "positive" },
    ],
    nextSteps: [
      "Enable the funded backend URL to replace preview data on this route.",
      "Approve full funded mode switching before wiring controller setup and funded trading actions.",
      "Add journey list and leaderboards after the two preview routes are accepted.",
    ],
    recentTrades: [
      {
        id: "1",
        timestampLabel: "May 29, 9:20 AM",
        symbol: "BTC",
        direction: "Long",
        sizeUsd: 4200,
        pnlUsd: 124.4,
        points: 580,
      },
      {
        id: "2",
        timestampLabel: "May 29, 7:45 AM",
        symbol: "ETH",
        direction: "Short",
        sizeUsd: 3600,
        pnlUsd: -38.1,
        points: 220,
      },
      {
        id: "3",
        timestampLabel: "May 28, 6:10 PM",
        symbol: "SOL",
        direction: "Long",
        sizeUsd: 2950,
        pnlUsd: 88.7,
        points: 390,
      },
      {
        id: "4",
        timestampLabel: "May 28, 2:30 PM",
        symbol: "ARB",
        direction: "Short",
        sizeUsd: 1800,
        pnlUsd: 21.9,
        points: 140,
      },
    ],
  };
}
