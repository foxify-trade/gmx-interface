import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

// Foxify NFT contracts are deployed on Arbitrum regardless of the app's selected chain.
// A dedicated static HTTP read client avoids accidentally reading via the user's wallet
// provider on the wrong network (race condition prevention).
export const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});
