import { FUNDED_FRONTEND_ID } from "config/funded";

/**
 * Returns the newsletter subscribe context string for NFT mint reminders.
 * Context string is platform-scoped: e.g. "gmx_nft_mint", "mune_nft_mint".
 * Uses FUNDED_FRONTEND_ID (config/funded) instead of env var.
 */
export function getNftMintNewsletterContext(): string {
  const id = FUNDED_FRONTEND_ID.trim().toLowerCase().replace(/-/g, "_");

  switch (id) {
    case "gmx_funded":
    case "gmx":
      return "gmx_nft_mint";
    case "mune":
      return "mune_nft_mint";
    case "what":
    case "what_exchange":
    case "whatexchange":
      return "what_nft_mint";
    case "perptools":
    case "perp_tools":
      return "perptools_nft_mint";
    default:
      return "mune_nft_mint";
  }
}
