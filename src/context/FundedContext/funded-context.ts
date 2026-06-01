import { createContext } from "use-context-selector";
import type { Address } from "viem";

import type { FundedAuthResponse } from "domain/funded/funded-types";

export type FundedContextValue = {
  isFundedMode: boolean;
  isSwitchingMode: boolean;
  fundedAccount: Address | null;
  fundedAccountInfo: FundedAuthResponse | null;
  connectedControllerAddress: Address | null;
  isReadOnly: boolean;
  connectFunded: (controllerAddress: Address) => Promise<void>;
  disconnectFunded: () => void;
};

export const FundedContext = createContext<FundedContextValue | null>(null);
