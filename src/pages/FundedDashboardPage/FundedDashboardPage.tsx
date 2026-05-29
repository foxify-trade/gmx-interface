import { useMemo } from "react";

import { FUNDED_ROUTES } from "config/funded";
import { formatFundedPercent, formatFundedUsd, sanitizeControllerAddress } from "domain/funded/funded-utils";
import { useFundedDashboard } from "domain/funded/use-funded-dashboard";
import useRouteQuery from "lib/useRouteQuery";

import { AlertInfoCard } from "components/AlertInfo/AlertInfoCard";
import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";
import { FundedMetricCard } from "components/Funded/FundedMetricCard";
import { FundedPageTabs } from "components/Funded/FundedPageTabs";

import { FundedDashboardSummaryCard } from "./FundedDashboardSummaryCard";
import { FundedPerformanceChart } from "./FundedPerformanceChart";
import { FundedRecentTradesTable } from "./FundedRecentTradesTable";

export function FundedDashboardPage() {
  const query = useRouteQuery();
  const controllerAddress = useMemo(() => sanitizeControllerAddress(query.get("controllerAddress")), [query]);
  const { data, isLoading, error } = useFundedDashboard(controllerAddress);

  return (
    <AppPageLayout title="GMX FUNDED Dashboard" header={<ChainContentHeader />}>
      <div className="page-layout flex flex-col gap-16">
        <FundedPageTabs activePath={FUNDED_ROUTES.challengeDashboard} />

        {isLoading ? (
          <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18 text-typography-secondary">
            Loading funded dashboard preview...
          </div>
        ) : null}

        {!isLoading && error ? (
          <AlertInfoCard type="warning" hideClose>
            Funded dashboard lookup failed. The route can continue with preview data after the backend URL is configured.
          </AlertInfoCard>
        ) : null}

        {data ? (
          <>
            <AlertInfoCard type={data.meta.degraded ? "warning" : data.meta.source === "demo" ? "info" : "warning"} hideClose>
              {data.meta.announcement ??
                `Dashboard source: ${data.meta.source === "demo" ? "typed preview data" : "live API lookup"}.`}
            </AlertInfoCard>

            <FundedDashboardSummaryCard summary={data.summary} />

            <div className="grid gap-16 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
              <div className="grid gap-16">
                <FundedPerformanceChart
                  title="PnL progression"
                  description={data.meta.lastUpdatedLabel}
                  data={data.pnlSeries}
                  kind="line"
                />
                <FundedPerformanceChart
                  title="Volume progression"
                  description={`Current points ${data.summary.currentPoints} of ${data.summary.pointsRequired}`}
                  data={data.volumeSeries}
                  kind="bar"
                />
              </div>

              <div className="grid gap-16">
                <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18">
                  <div className="text-16 font-medium text-typography-primary">Read-only state</div>
                  <div className="mt-8 text-13 leading-6 text-typography-secondary">
                    Controller {data.meta.controllerAddress} is shown as a review surface only in this release.
                  </div>
                  <div className="mt-14 grid gap-10">
                    <FundedMetricCard
                      label="Target remaining"
                      value={formatFundedUsd(data.summary.minProfitTargetUsd - data.summary.currentPnlUsd)}
                    />
                    <FundedMetricCard label="Total volume" value={formatFundedUsd(data.summary.totalVolumeUsd)} />
                    <FundedMetricCard
                      label="Time remaining"
                      value={`${data.summary.remainingHours}h`}
                      helper={`Drawdown limit ${formatFundedPercent(data.summary.drawdownLimitPct)}`}
                    />
                  </div>
                </div>

                <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18">
                  <div className="text-16 font-medium text-typography-primary">Performance modifiers</div>
                  <div className="mt-12 grid gap-10">
                    {data.modifiers.map((modifier) => (
                      <FundedMetricCard key={modifier.label} label={modifier.label} value={modifier.value} tone={modifier.tone} />
                    ))}
                  </div>
                </div>

                <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18">
                  <div className="text-16 font-medium text-typography-primary">Next steps</div>
                  <div className="mt-12 flex flex-col gap-10">
                    {data.nextSteps.map((step) => (
                      <div key={step} className="rounded-8 bg-slate-800 px-14 py-12 text-13 leading-6 text-typography-secondary">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <FundedRecentTradesTable trades={data.recentTrades} />
          </>
        ) : null}
      </div>
    </AppPageLayout>
  );
}
