import { Trans, t } from "@lingui/macro";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { LEADERBOARD_PAGES } from "domain/synthetics/leaderboard/constants";
import { useChainId } from "lib/chains";

import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";

import { FundedChallengeLeaderboardTable } from "./components/funded-challenge-leaderboard-table";
import "./LeaderboardPage.scss";

export function LeaderboardPage() {
  return (
    <AppPageLayout title={t`Leaderboard`} header={<ChainContentHeader />}>
      <div className="page-layout">
        <div className="mb-16">
          <h2 className="text-h2 font-medium">
            <Trans>FUNDED Challenge Leaderboard</Trans>
          </h2>
          <p className="mt-4 text-body-medium text-typography-secondary">
            <Trans>Top FUNDED traders ranked by challenge performance</Trans>
          </p>
        </div>
        <FundedChallengeLeaderboardTable />
      </div>
    </AppPageLayout>
  );
}

export function CompetitionRedirect() {
  const { chainId } = useChainId();
  const history = useHistory();

  useEffect(() => {
    const competitions = Object.values(LEADERBOARD_PAGES).filter((p) => p.isCompetition && p.enabled);
    const active = competitions.find((p) => p.timeframe.to && p.timeframe.to > Date.now() / 1000);
    const target = active ?? competitions[0] ?? LEADERBOARD_PAGES.leaderboard;
    history.replace(target.href);
  }, [chainId, history]);

  return null;
}
