import { useQuery } from "@tanstack/react-query";

import { FUNDED_API_URL, FUNDED_ENDPOINTS, FUNDED_PUBLIC_API_URL } from "config/funded";
import type { FundedChallengeRankingsResponse } from "./funded-types";

export function useFundedChallengeRankings({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
  return useQuery<FundedChallengeRankingsResponse>({
    queryKey: ["funded-challenge-rankings", page, pageSize],
    queryFn: async () => {
      const base = (FUNDED_API_URL ?? FUNDED_PUBLIC_API_URL).replace(/\/$/, "");
      const url = new URL(`${base}${FUNDED_ENDPOINTS.leaderboardChallengeRank}`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "omit",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Leaderboard fetch failed: ${response.status}`);
      }

      return response.json() as Promise<FundedChallengeRankingsResponse>;
    },
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
