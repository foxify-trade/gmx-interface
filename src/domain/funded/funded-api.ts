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
