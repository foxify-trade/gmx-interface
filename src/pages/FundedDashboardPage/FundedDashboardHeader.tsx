import cx from "classnames";

import type { FundedDashboardData, FundedDashboardTab } from "domain/funded/funded-types";
import { formatFundedUsd } from "domain/funded/funded-utils";

const INNER_TABS: Array<{ id: FundedDashboardTab; label: string; num: string }> = [
  { id: "overview", label: "Overview", num: "01" },
  { id: "performance", label: "Performance", num: "02" },
  { id: "trade-history", label: "Trade History", num: "03" },
  { id: "level-up", label: "Level Up", num: "04" },
];

interface Props {
  data: FundedDashboardData;
  activeTab: FundedDashboardTab;
  onTabChange: (tab: FundedDashboardTab) => void;
}

export function FundedDashboardHeader({ data, activeTab, onTabChange }: Props) {
  const { summary, journeyMeta, levelUpData } = data;
  const isOnDeck = summary.status === "On Deck";
  const isActive = summary.status === "Active";
  const hasEnded = !!levelUpData?.levelEndedTitle;

  return (
    <div>
      {/* Journey info row */}
      <div className="flex items-start justify-between pb-20 pt-4">
        <div className="flex items-start gap-12">
          <div className="flex size-44 shrink-0 items-center justify-center rounded-8 bg-slate-700 text-[18px] font-bold text-white">
            {journeyMeta?.challengeName?.[0] ?? "J"}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Journey · {journeyMeta?.challengeType ?? "Preview"}
            </div>
            <div className="mt-2 flex items-center gap-10">
              <span className="text-[28px] font-bold leading-tight text-white">
                {journeyMeta?.challengeName ?? summary.levelLabel}
              </span>
              {(isOnDeck || hasEnded) && (
                <span className="rounded-4 bg-amber-500/20 px-8 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  On-Deck
                </span>
              )}
              {isActive && !hasEnded && (
                <span className="rounded-4 bg-green-500/20 px-8 py-3 text-[10px] font-bold uppercase tracking-wider text-green-400">
                  Active
                </span>
              )}
            </div>
            {journeyMeta && (
              <div className="mt-4 text-12 text-slate-400">
                Level {journeyMeta.levelNum} of {journeyMeta.totalLevels} · Started {journeyMeta.startDateLabel} ·{" "}
                {journeyMeta.daysIn} days in
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[22px] font-bold text-blue-300">{formatFundedUsd(summary.accountSizeUsd)}</span>
          <span className="ml-8 text-13 text-slate-400">Challenge</span>
        </div>
      </div>

      {/* Inner tab navigation */}
      <div className="flex overflow-x-auto border-b border-slate-700 scrollbar-hide">
        {INNER_TABS.map((tab) => {
          const isTabActive = activeTab === tab.id;
          const showBadge = tab.id === "level-up" && (isOnDeck || hasEnded);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cx(
                "-mb-px flex shrink-0 items-center gap-6 border-b-2 pb-12 pr-24 text-14 font-medium transition-colors",
                isTabActive
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <span className={cx("text-12", isTabActive ? "text-blue-400" : "text-slate-600")}>{tab.num}</span>
              {tab.label}
              {showBadge && (
                <span className="rounded-4 bg-amber-500/20 px-6 py-2 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  On Deck
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
