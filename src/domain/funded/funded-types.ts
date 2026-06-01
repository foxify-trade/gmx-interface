import type { Address } from "viem";

export type FundedDataSource = "demo" | "api";
export type FundedTrackId = "entry" | "pro";
export type FundedStatus = "Active" | "Readonly Preview" | "On Deck";

export interface FundedTrackLevel {
  id: string;
  name: string;
  accountSizeUsd: number;
  depositUsd: number;
  profitTargetUsd: number;
  pointsTarget: number;
  maxDrawdownPct: number;
  accentColor?: string;
}

export interface FundedTrackDefinition {
  id: FundedTrackId;
  label: string;
  eyebrow: string;
  description: string;
  depositUsd: number;
  startsAtUsd: number;
  levelsToTop: number;
  badgeLabel?: string;
  levels: FundedTrackLevel[];
}

export interface FundedFeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface FundedMarketGroup {
  icon: string;
  title: string;
  badgeLabel?: string;
  symbols: string[];
}

export interface FundedGuideStep {
  title: string;
  description: string;
}

export interface FundedDashboardPoint {
  label: string;
  value: number;
}

export interface FundedModifier {
  label: string;
  value: string;
  tone?: "default" | "positive";
}

export interface FundedRecentTrade {
  id: string;
  timestampLabel: string;
  symbol: string;
  direction: "Long" | "Short";
  sizeUsd: number;
  pnlUsd: number;
  points: number;
}

export interface FundedDashboardSummary {
  trackLabel: string;
  levelLabel: string;
  accountSizeUsd: number;
  collateralUsd: number;
  drawdownLimitPct: number;
  currentPnlUsd: number;
  currentPnlPct: number;
  maxDrawdownPct: number;
  minProfitTargetUsd: number;
  totalVolumeUsd: number;
  currentPoints: number;
  pointsRequired: number;
  remainingHours: number;
  status: FundedStatus;
}

export interface FundedDashboardData {
  meta: {
    source: FundedDataSource;
    controllerAddress: Address;
    readonly: boolean;
    lastUpdatedLabel: string;
    degraded?: boolean;
    announcement?: string;
  };
  summary: FundedDashboardSummary;
  pnlSeries: FundedDashboardPoint[];
  volumeSeries: FundedDashboardPoint[];
  modifiers: FundedModifier[];
  nextSteps: string[];
  recentTrades: FundedRecentTrade[];
}

// Auth and challenge types for funded mode switching
export interface FundedAuthResponse {
  operatorPrivateKey: string;
  operatorWalletAddress: Address;
  controllerAddress: Address;
  readOnly?: boolean;
}

export interface Challenge {
  journeyId: number;
  controllerAddress: Address;
  challengeName: string;
  trackName: string;
  level: number;
  status: string;
  readOnly?: boolean;
}

export interface FundedChallengesResponse {
  challenges: Challenge[];
  count: number;
}

export interface SourceFundedDashboardResponse {
  summary: {
    track: string;
    currentLevel: string;
    accountSize: number;
    collateral: number;
    drawdownLimit: number;
    accountStatus: string;
    currentPnL: number;
    currentPnLPercent: number;
    maxDrawdownExperienced: number;
    minPnlTarget?: number;
    totalVolumeTraded: number;
    currentPoints: number;
    pointsRequired: number;
    remainingTimeHours: number;
    dailyPnlData?: Array<{ date: string; pnl: number }>;
    dailyVolumeData?: Array<{ date: string; volume: number }>;
  };
  performanceModifiers?: {
    sharpeBonus: number;
    calmarBonus: number;
    consistencyModifier: number;
    combinedMultiplier: number;
  };
  tradingActivity?: {
    recentTrades?: Array<{
      timestamp: string | Date;
      symbol: string;
      direction: string;
      size: number;
      pnl: number;
      pointsImpact: number;
    }>;
  };
}
