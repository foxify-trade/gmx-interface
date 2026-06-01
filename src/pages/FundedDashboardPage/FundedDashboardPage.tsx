import { useMemo, useState } from "react";

import type { FundedDashboardTab } from "domain/funded/funded-types";
import { sanitizeControllerAddress } from "domain/funded/funded-utils";
import { useFundedDashboard } from "domain/funded/use-funded-dashboard";
import useRouteQuery from "lib/useRouteQuery";

import { AlertInfoCard } from "components/AlertInfo/AlertInfoCard";
import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";

import { FundedDashboardHeader } from "./FundedDashboardHeader";
import { FundedLevelUpTab } from "./FundedLevelUpTab";
import { FundedOverviewTab } from "./FundedOverviewTab";
import { FundedPerformanceTab } from "./FundedPerformanceTab";
import { FundedRecentTradesTable } from "./FundedRecentTradesTable";

export function FundedDashboardPage() {
  const query = useRouteQuery();
  const controllerAddress = useMemo(() => sanitizeControllerAddress(query.get("controllerAddress")), [query]);
  const { data, isLoading, error } = useFundedDashboard(controllerAddress);
  const [activeTab, setActiveTab] = useState<FundedDashboardTab>("overview");

  return (
    <AppPageLayout title="Journey Dashboard" header={<ChainContentHeader />}>
      <div className="page-layout flex flex-col gap-0">
        {isLoading && (
          <div className="rounded-8 border border-slate-700 bg-slate-900 px-20 py-16 text-13 text-slate-400">
            Loading dashboard...
          </div>
        )}

        {!isLoading && error && (
          <AlertInfoCard type="warning" hideClose>
            Dashboard lookup failed. The route can continue with preview data after the backend URL is configured.
          </AlertInfoCard>
        )}

        {data && (
          <>
            {data.meta.source === "demo" && !data.meta.degraded && (
              <AlertInfoCard type="info" hideClose>
                Preview mode — showing demo data.
              </AlertInfoCard>
            )}
            {data.meta.degraded && (
              <AlertInfoCard type="warning" hideClose>
                {data.meta.announcement ?? "Live lookup failed. Showing preview data."}
              </AlertInfoCard>
            )}

            <div className="mt-12">
              <FundedDashboardHeader data={data} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div>
              {activeTab === "overview" && <FundedOverviewTab data={data} />}
              {activeTab === "performance" && <FundedPerformanceTab data={data} />}
              {activeTab === "trade-history" && (
                <div className="pt-16">
                  <FundedRecentTradesTable trades={data.recentTrades} />
                </div>
              )}
              {activeTab === "level-up" && <FundedLevelUpTab data={data} />}
            </div>
          </>
        )}
      </div>
    </AppPageLayout>
  );
}
