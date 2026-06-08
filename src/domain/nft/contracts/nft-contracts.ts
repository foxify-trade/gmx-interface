import FoxifyAffiliationAbi from "../abis/FoxifyAffiliation.json";
import FoxifyTradingNftAbi from "../abis/FoxifyTradingNFT.json";

/** Foxify Trading NFT (V3) — staking/merge/mint. Deployed on Arbitrum. */
export const FOXIFY_V3_NFT_ADDRESS = "0xE7594eF4D3a622ED70D45735bbE43972a05655cC" as const;

/** Foxify Affiliation NFT (V2) — view-only, migratable to V3. Deployed on Arbitrum. */
export const FOXIFY_V2_NFT_ADDRESS = "0x3e120638c323F705350C504F14b02959f8282280" as const;

// Export the .abi arrays (not the whole JSON object) so viem readContract/simulateContract/writeContract
// receives a proper ABI array. The JSON files have shape { address, abi: [...] }.
export const FOXIFY_V3_NFT_ABI = FoxifyTradingNftAbi.abi;
export const FOXIFY_V2_NFT_ABI = FoxifyAffiliationAbi.abi;

export function getNftContractAddress() {
  return FOXIFY_V3_NFT_ADDRESS;
}

export function getV2NftContractAddress() {
  return FOXIFY_V2_NFT_ADDRESS;
}
