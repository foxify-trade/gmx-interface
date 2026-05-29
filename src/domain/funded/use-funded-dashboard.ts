import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

import { FUNDED_ENABLED } from "config/funded";

import { fetchFundedDashboardData } from "./funded-api";

export function useFundedDashboard(controllerAddress?: Address) {
  return useQuery({
    queryKey: ["funded-dashboard", controllerAddress ?? "demo"],
    queryFn: () => fetchFundedDashboardData(controllerAddress),
    enabled: FUNDED_ENABLED,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
