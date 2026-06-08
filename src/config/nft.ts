const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const viteEnv = import.meta.env;

export function parseNftFlag(value?: string | null) {
  return value ? TRUE_VALUES.has(value.trim().toLowerCase()) : false;
}

/** Feature flag — when false, NFT routes render PageNotFound and the nav item is hidden. */
export const NFT_ENABLED = parseNftFlag(viteEnv.VITE_ENABLE_NFT);

export const NFT_ROUTES = {
  management: "/nft",
  eligibility: "/nft/eligibility",
} as const;

/** OpenSea API key used for NFT metadata enrichment (read-only, public-scope key). */
export const NFT_OPENSEA_API_KEY = viteEnv.VITE_OPENSEA_API_KEY?.trim() || "";

/** Upstream merkle-proof endpoint for mint whitelist. Called directly (Vite has no server routes). */
export const NFT_MERKLE_PROOF_URL = viteEnv.VITE_NFT_MERKLE_PROOF_URL?.trim() || "https://nft.foxify.trade/proof";
