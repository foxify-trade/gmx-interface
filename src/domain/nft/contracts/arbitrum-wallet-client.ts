import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

/** Minimal EIP-1193 provider type for window.ethereum calls. */
interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

/**
 * Switches the connected wallet to Arbitrum and returns a viem wallet client.
 * Used for NFT staking / merging / migration / mint writes, since the Foxify NFT
 * contracts live on Arbitrum independent of the app's selected chain.
 */
export async function switchToArbitrumAndGetClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected");
  }

  const provider = window.ethereum as unknown as EIP1193Provider;
  const targetChainId = arbitrum.id; // 42161
  const targetChainHex = `0x${targetChainId.toString(16)}`;

  const currentChainHex = (await provider.request({ method: "eth_chainId" })) as string;
  const currentChainId = parseInt(currentChainHex, 16);

  if (currentChainId !== targetChainId) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainHex }],
      });
    } catch (switchError: unknown) {
      // 4902 = chain not added to wallet → add it, then retry implicitly via re-check below.
      if ((switchError as { code?: number })?.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetChainHex,
              chainName: arbitrum.name,
              nativeCurrency: arbitrum.nativeCurrency,
              rpcUrls: [arbitrum.rpcUrls.default.http[0]],
              blockExplorerUrls: [arbitrum.blockExplorers?.default?.url],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }

    const newChainHex = (await provider.request({ method: "eth_chainId" })) as string;
    if (parseInt(newChainHex, 16) !== targetChainId) {
      throw new Error("Please switch your wallet to Arbitrum to continue.");
    }
  }

  return createWalletClient({
    chain: arbitrum,
    transport: custom(provider as Parameters<typeof custom>[0]),
  });
}
