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
  // v2 dashboard extensions
  journeyMeta?: FundedJourneyMeta;
  overviewExtras?: FundedOverviewExtras;
  performanceStats?: FundedPerformanceStats;
  levelUpData?: FundedLevelUpData;
}

export type FundedDashboardTab = "overview" | "performance" | "trade-history" | "level-up";

export interface FundedJourneyMeta {
  challengeName: string;
  challengeType: string;
  levelNum: number;
  totalLevels: number;
  startDateLabel: string;
  daysIn: number;
}

export interface FundedOverviewExtras {
  activityTimerStatus: string;
  activityTimerHelper: string;
  pointsTrend: string;
  snapshotAmountUsd: number;
  snapshotDateLabel: string;
  tradingFrequencyPerDay: number;
}

export interface FundedPerformanceStats {
  sharpeRatio: number;
  sharpeLabel: string;
  calmarRatio: number;
  calmarLabel: string;
  gainToPain: number;
  gainToPainLabel: string;
  consistency: number;
  consistencyLabel: string;
  combinedModifier: number;
  sessions: number;
  avgTradeSizeUsd: number;
  winLossRatio: number;
  commissionPaid: number;
  activityPenalty: number;
  fundsTxFee: number;
  availableProfit: number;
  availableCollateral: number;
  assetDistribution: Array<{ symbol: string; pct: number }>;
  peerPerformance: string;
  peerPerformanceTone: "positive" | "negative" | "neutral";
  peerVolume: string;
  peerVolumeTone: "positive" | "negative" | "neutral";
  peerDuration: string;
  peerDurationTone: "positive" | "negative" | "neutral";
  dailyPnlSeries: FundedDashboardPoint[];
}

export interface FundedLevelUpData {
  challengeDurationDays: number;
  availableProfitUsd: number;
  availableCollateralUsd: number;
  totalWithdrawnUsd: number;
  levelEndedTitle?: string;
  levelEndedSubtitle?: string;
  nextLevel?: {
    levelName: string;
    advanceLabel: string;
    description: string;
    accountSizeUsd: number;
    collateralUsd: number;
    drawdownLimitPct: number;
    requiredCollateralUsd: number;
    availableFundsUsd: number;
    netDepositRequired: number;
  };
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
    // v2 extensions
    challengeName?: string;
    challengeType?: string;
    levelNum?: number;
    totalLevels?: number;
    startDate?: string;
    activityTimerStatus?: string;
    activityTimerHelper?: string;
    pointsTrend?: string;
    snapshotAmountUsd?: number;
    snapshotDate?: string;
    tradingFrequency?: number;
    challengeDurationDays?: number;
    levelEndedTitle?: string;
    levelEndedSubtitle?: string;
    availableProfit?: number;
    availableCollateral?: number;
    totalWithdrawn?: number;
  };
  performanceModifiers?: {
    sharpeBonus: number;
    calmarBonus: number;
    consistencyModifier: number;
    combinedMultiplier: number;
    // v2 extensions
    sharpeLabel?: string;
    calmarLabel?: string;
    gainToPain?: number;
    gainToPainLabel?: string;
    consistencyLabel?: string;
    sessions?: number;
    winLossRatio?: number;
    avgTradeSize?: number;
    commissionPaid?: number;
    activityPenalty?: number;
    fundsTxFee?: number;
    assetDistribution?: Array<{ symbol: string; pct: number }>;
    peerPerformance?: string;
    peerPerformanceTone?: string;
    peerVolume?: string;
    peerVolumeTone?: string;
    peerDuration?: string;
    peerDurationTone?: string;
    dailyPnlData?: Array<{ date: string; pnl: number }>;
  };
  nextLevel?: {
    levelName: string;
    advanceLabel: string;
    description: string;
    accountSize: number;
    collateral: number;
    drawdownLimit: number;
    requiredCollateral: number;
    availableFunds: number;
    netDepositRequired: number;
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

export interface FundedChallengeRankingsItem {
  rank: number;
  traderAddress: string;
  frontendId?: string | null;
  challengeName: string | null;
  levelRank: string | null;
  points: number | null;
  journeyPnL: number | null;
  sharpeRatio: number | null;
  calmarRatio: number | null;
  gainToPainRatio: number | null;
  consistencyScore: number | null;
  favoriteAsset: string | null;
}

export interface FundedChallengeRankingsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: FundedChallengeRankingsItem[];
}
