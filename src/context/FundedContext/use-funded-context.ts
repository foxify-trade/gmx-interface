import { useContextSelector } from "use-context-selector";

import type { FundedContextValue } from "./funded-context";
import { FundedContext } from "./funded-context";

export function useFundedContext<T>(selector: (ctx: FundedContextValue) => T): T {
  return useContextSelector(FundedContext, (ctx) => {
    if (!ctx) throw new Error("useFundedContext must be used within FundedContextProvider");
    return selector(ctx);
  });
}
