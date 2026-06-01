import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

import { FUNDED_ENDPOINTS } from "config/funded";
import { fundedGet } from "lib/funded/funded-fetch";

import type { Challenge, FundedChallengesResponse } from "./funded-types";

export function useFundedJourneys(traderAddress: Address | undefined) {
  return useQuery<Challenge[]>({
    queryKey: ["funded-journeys", traderAddress],
    queryFn: async () => {
      const data = await fundedGet<FundedChallengesResponse>(FUNDED_ENDPOINTS.challenges, {
        traderAddress: traderAddress!,
      });
      return data.challenges ?? [];
    },
    enabled: !!traderAddress,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
