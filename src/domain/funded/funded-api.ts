import type { Address } from "viem";

import { FUNDED_API_URL } from "config/funded";

import { getFundedDashboardDemo } from "./funded-demo-data";
import type { FundedDashboardData, SourceFundedDashboardResponse } from "./funded-types";
import { formatFundedDateLabel, getFundedDashboardSource } from "./funded-utils";

function appendTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function buildFundedDashboardUrl(apiUrl: string, controllerAddress: Address) {
  const url = new URL("funded/journey-dashboard", appendTrailingSlash(apiUrl));
  url.searchParams.set("controllerAddress", controllerAddress);

  return url.toString();
}

function getStatusLabel(accountStatus?: string) {
  if (!accountStatus) {
    return "Readonly Preview";
  }

  if (accountStatus.toLowerCase() === "active") {
    return "Active";
  }

  return "On Deck";
}

export function normalizeFundedDashboardResponse(
  response: SourceFundedDashboardResponse,
  controllerAddress: Address
): FundedDashboardData {
  return {
    meta: {
      source: "api",
      controllerAddress,
      readonly: false,
      lastUpdatedLabel: `Live lookup updated ${formatFundedDateLabel(new Date())}`,
    },
    summary: {
      trackLabel: response.summary.track,
      levelLabel: response.summary.currentLevel,
      accountSizeUsd: response.summary.accountSize,
      collateralUsd: response.summary.collateral,
      drawdownLimitPct: response.summary.drawdownLimit,
      currentPnlUsd: response.summary.currentPnL,
      currentPnlPct: response.summary.currentPnLPercent,
      maxDrawdownPct: response.summary.maxDrawdownExperienced,
      minProfitTargetUsd: response.summary.minPnlTarget ?? 0,
      totalVolumeUsd: response.summary.totalVolumeTraded,
      currentPoints: response.summary.currentPoints,
      pointsRequired: response.summary.pointsRequired,
      remainingHours: response.summary.remainingTimeHours,
      status: getStatusLabel(response.summary.accountStatus),
    },
    pnlSeries: (response.summary.dailyPnlData ?? []).map((point) => ({
      label: point.date,
      value: point.pnl,
    })),
    volumeSeries: (response.summary.dailyVolumeData ?? []).map((point) => ({
      label: point.date,
      value: point.volume,
    })),
    modifiers: [
      { label: "Sharpe bonus", value: `+${response.performanceModifiers?.sharpeBonus ?? 0}%`, tone: "positive" },
      { label: "Calmar bonus", value: `+${response.performanceModifiers?.calmarBonus ?? 0}%`, tone: "positive" },
      {
        label: "Consistency",
        value: `+${response.performanceModifiers?.consistencyModifier ?? 0}%`,
        tone: "positive",
      },
      {
        label: "Combined multiplier",
        value: `${response.performanceModifiers?.combinedMultiplier ?? 1}x`,
        tone: "positive",
      },
    ],
    nextSteps: [
      "Switch back to GMX default trading routes for live trading while funded mode switching is still deferred.",
      "Use the controller address query param for read-only dashboard reviews.",
      "Enable additional funded flows only after provider compatibility is approved.",
    ],
    recentTrades: (response.tradingActivity?.recentTrades ?? []).map((trade, index) => ({
      id: `${trade.symbol}-${index}`,
      timestampLabel: formatFundedDateLabel(trade.timestamp),
      symbol: trade.symbol,
      direction: trade.direction.toLowerCase() === "short" ? "Short" : "Long",
      sizeUsd: trade.size,
      pnlUsd: trade.pnl,
      points: trade.pointsImpact,
    })),
    // v2 extensions
    journeyMeta: response.summary.challengeName
      ? {
          challengeName: response.summary.challengeName,
          challengeType: response.summary.challengeType ?? "CHALLENGE",
          levelNum: response.summary.levelNum ?? 1,
          totalLevels: response.summary.totalLevels ?? 1,
          startDateLabel: response.summary.startDate ? formatFundedDateLabel(response.summary.startDate) : "Unknown",
          daysIn: 0,
        }
      : undefined,
    overviewExtras: {
      activityTimerStatus: response.summary.activityTimerStatus ?? "Active",
      activityTimerHelper: response.summary.activityTimerHelper ?? "",
      pointsTrend: response.summary.pointsTrend ?? "Stable",
      snapshotAmountUsd: response.summary.snapshotAmountUsd ?? 0,
      snapshotDateLabel: response.summary.snapshotDate ? formatFundedDateLabel(response.summary.snapshotDate) : "",
      tradingFrequencyPerDay: response.summary.tradingFrequency ?? 0,
    },
    performanceStats: response.performanceModifiers
      ? {
          sharpeRatio: response.performanceModifiers.sharpeBonus,
          sharpeLabel: response.performanceModifiers.sharpeLabel ?? "Below average",
          calmarRatio: response.performanceModifiers.calmarBonus,
          calmarLabel: response.performanceModifiers.calmarLabel ?? "Below average",
          gainToPain: response.performanceModifiers.gainToPain ?? 0,
          gainToPainLabel: response.performanceModifiers.gainToPainLabel ?? "Steady",
          consistency: response.performanceModifiers.consistencyModifier,
          consistencyLabel: response.performanceModifiers.consistencyLabel ?? "Variable",
          combinedModifier: response.performanceModifiers.combinedMultiplier,
          sessions: response.performanceModifiers.sessions ?? 0,
          avgTradeSizeUsd: response.performanceModifiers.avgTradeSize ?? 0,
          winLossRatio: response.performanceModifiers.winLossRatio ?? 0,
          commissionPaid: response.performanceModifiers.commissionPaid ?? 0,
          activityPenalty: response.performanceModifiers.activityPenalty ?? 0,
          fundsTxFee: response.performanceModifiers.fundsTxFee ?? 0,
          availableProfit: response.summary.availableProfit ?? 0,
          availableCollateral: response.summary.availableCollateral ?? 0,
          assetDistribution: response.performanceModifiers.assetDistribution ?? [],
          peerPerformance: response.performanceModifiers.peerPerformance ?? "Average",
          peerPerformanceTone:
            (response.performanceModifiers.peerPerformanceTone as "positive" | "negative" | "neutral") ?? "neutral",
          peerVolume: response.performanceModifiers.peerVolume ?? "Average",
          peerVolumeTone:
            (response.performanceModifiers.peerVolumeTone as "positive" | "negative" | "neutral") ?? "neutral",
          peerDuration: response.performanceModifiers.peerDuration ?? "Average",
          peerDurationTone:
            (response.performanceModifiers.peerDurationTone as "positive" | "negative" | "neutral") ?? "neutral",
          dailyPnlSeries: (response.performanceModifiers.dailyPnlData ?? []).map((p) => ({
            label: p.date,
            value: p.pnl,
          })),
        }
      : undefined,
    levelUpData: {
      challengeDurationDays: response.summary.challengeDurationDays ?? 0,
      availableProfitUsd: response.summary.availableProfit ?? 0,
      availableCollateralUsd: response.summary.availableCollateral ?? 0,
      totalWithdrawnUsd: response.summary.totalWithdrawn ?? 0,
      levelEndedTitle: response.summary.levelEndedTitle,
      levelEndedSubtitle: response.summary.levelEndedSubtitle,
      nextLevel: response.nextLevel
        ? {
            levelName: response.nextLevel.levelName,
            advanceLabel: response.nextLevel.advanceLabel,
            description: response.nextLevel.description,
            accountSizeUsd: response.nextLevel.accountSize,
            collateralUsd: response.nextLevel.collateral,
            drawdownLimitPct: response.nextLevel.drawdownLimit,
            requiredCollateralUsd: response.nextLevel.requiredCollateral,
            availableFundsUsd: response.nextLevel.availableFunds,
            netDepositRequired: response.nextLevel.netDepositRequired,
          }
        : undefined,
    },
  };
}

export async function fetchFundedDashboardData(controllerAddress?: Address): Promise<FundedDashboardData> {
  const source = getFundedDashboardSource(controllerAddress);

  if (source === "demo" || !controllerAddress || !FUNDED_API_URL) {
    return getFundedDashboardDemo(controllerAddress);
  }

  try {
    const response = await fetch(buildFundedDashboardUrl(FUNDED_API_URL, controllerAddress), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`FUNDED dashboard request failed with ${response.status}`);
    }

    const data = (await response.json()) as SourceFundedDashboardResponse;

    return normalizeFundedDashboardResponse(data, controllerAddress);
  } catch {
    return getFundedDashboardDemo(controllerAddress, {
      degraded: true,
      announcement:
        "Live FUNDED lookup failed for the requested controller address. Showing preview data so the route remains reviewable.",
    });
  }
}
