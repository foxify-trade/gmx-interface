import { useQuery } from "@tanstack/react-query";

import { NFT_MERKLE_PROOF_URL } from "config/nft";
import useWallet from "lib/wallets/useWallet";

export interface MerkleProofData {
  address: string;
  proof: string[];
  merkleRoot: string;
}

/**
 * Fetches the merkle proof for the connected wallet from the upstream proof endpoint.
 *
 * NOTE: The upstream (https://nft.foxify.trade/proof) may lack CORS headers, causing
 * browser-direct calls to fail. If that happens this query returns null — mint UI
 * must degrade gracefully. A backend proxy (Vite devServer.proxy or serverless fn)
 * can be added later without changing this hook's interface.
 */
export function useMerkleProof() {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["nft", "merkleProof", account],
    queryFn: async (): Promise<MerkleProofData | null> => {
      if (!account) return null;

      try {
        const res = await fetch(`${NFT_MERKLE_PROOF_URL}?address=${account}`);
        if (!res.ok) return null;

        const data = await res.json();
        // Upstream returns { error: "..." } when address is not on whitelist
        if (data?.error) return null;

        return data as MerkleProofData;
      } catch {
        // CORS or network failure — treat as not whitelisted
        return null;
      }
    },
    enabled: !!account,
    staleTime: 5 * 60_000, // proof is stable per wave
    retry: false, // don't retry CORS failures
  });
}
