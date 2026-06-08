import { Trans, t } from "@lingui/macro";
import { useMutation } from "@tanstack/react-query";

import {
  FOXIFY_V2_NFT_ADDRESS,
  FOXIFY_V3_NFT_ADDRESS,
} from "domain/nft/contracts/nft-contracts";
import { useNftContext } from "domain/nft/nft-context";
import { triggerOpenSeaMetadataRefresh, fetchNftMetadata } from "domain/nft/nft-metadata";
import {
  NftData,
  NftVersion,
  getLevelColor,
  getLevelGlow,
  getLevelGradient,
  getLevelName,
  getNftImage,
} from "domain/nft/nft-types";
import { useStakeNft } from "domain/nft/use-nft-staking-mutations";
import { helperToast } from "lib/helperToast";
import useWallet from "lib/wallets/useWallet";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";


interface NftDetailDialogProps {
  nft: NftData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NftDetailDialog({ nft, open, onOpenChange }: NftDetailDialogProps) {
  const { refetch } = useNftContext();
  const { account } = useWallet();
  const isConnected = !!account;

  const stakeNft = useStakeNft({
    onSuccess: () => {
      onOpenChange(false);
      setTimeout(() => refetch(), 2000);
    },
  });

  const refreshMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!nft) throw new Error("No NFT selected");
      const contractAddress =
        nft.version === NftVersion.V2 ? FOXIFY_V2_NFT_ADDRESS : FOXIFY_V3_NFT_ADDRESS;
      const refreshTriggered = await triggerOpenSeaMetadataRefresh(nft.tokenId, contractAddress);
      const metadata = await fetchNftMetadata(nft.tokenId, contractAddress);
      return { metadata, refreshTriggered };
    },
    onSuccess: ({ refreshTriggered, metadata }) => {
      if (refreshTriggered) {
        helperToast.success(t`OpenSea metadata refresh triggered. May take a few minutes to update.`);
      } else if (metadata) {
        helperToast.success(t`Metadata fetched (OpenSea refresh unavailable)`);
      } else {
        helperToast.error(t`Could not refresh metadata`);
      }
      setTimeout(() => refetch(), 500);
    },
    onError: () => {
      helperToast.error(t`Failed to refresh metadata`);
    },
  });

  if (!nft) return null;

  const levelColor = getLevelColor(nft.level);
  const levelGlow = getLevelGlow(nft.level);
  const levelGradient = getLevelGradient(nft.level);
  const contractAddress =
    nft.version === NftVersion.V2 ? FOXIFY_V2_NFT_ADDRESS : FOXIFY_V3_NFT_ADDRESS;
  const explorerUrl = `https://arbiscan.io/token/${contractAddress}?a=${nft.tokenId.toString()}`;
  const openSeaUrl = `https://opensea.io/assets/arbitrum/${contractAddress}/${nft.tokenId.toString()}`;

  const isStaking = stakeNft.isPending;
  const isRefreshing = refreshMetadataMutation.isPending;

  return (
    <NftDialog open={open} onOpenChange={onOpenChange} title={t`NFT #${nft.tokenId.toString()}`}>
      <div className="flex flex-col items-center p-16">
        {/* NFT image with glow */}
        <div className="relative mb-16 overflow-hidden rounded-12" style={{ boxShadow: levelGlow }}>
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(circle at center, ${levelColor} 0%, transparent 70%)` }}
          />
          <img
            src={getNftImage(nft)}
            alt={`NFT #${nft.tokenId.toString()}`}
            className="h-[224px] w-[224px] object-cover"
          />
          <span
            className="absolute bottom-12 left-12 px-12 py-4 text-12 font-bold text-white shadow-lg"
            style={{ background: levelGradient }}
          >
            {getLevelName(nft.level)}
          </span>
        </div>

        {/* NFT details */}
        <div className="mb-16 w-full space-y-4 text-center">
          <p className="text-24 font-bold text-white">NFT #{nft.tokenId.toString()}</p>
          <div className="flex items-center justify-center gap-8">
            <span className="text-gray-400"><Trans>Rarity:</Trans></span>
            <span className="font-semibold" style={{ color: levelColor }}>
              {getLevelName(nft.level)}
            </span>
          </div>
          <p className="text-gray-400">
            <Trans>Version:</Trans> <span className="text-gray-200">{nft.version}</span>
          </p>
          <p className={`font-semibold ${nft.isStaked ? "text-green-400" : "text-red-400"}`}>
            {nft.isStaked ? "✓ Currently Staked" : "○ Not Staked"}
          </p>
        </div>

        {/* Action buttons — 2×2 grid */}
        <div className="grid w-full grid-cols-2 gap-12">
          <Button
            variant="primary"
            disabled={!isConnected || nft.isStaked || isStaking}
            onClick={() => stakeNft.mutate(nft.tokenId)}
          >
            {isStaking ? <Trans>Staking…</Trans> : nft.isStaked ? <Trans>Already Staked</Trans> : <Trans>Stake Now</Trans>}
          </Button>

          <Button variant="primary" onClick={() => window.open(openSeaUrl, "_blank")}>
            {/* OpenSea icon */}
            <svg className="mr-8 h-16 w-16" viewBox="0 0 90 90" fill="currentColor">
              <path d="M45 0C20.151 0 0 20.151 0 45c0 24.849 20.151 45 45 45 24.849 0 45-20.151 45-45C90 20.151 69.849 0 45 0zM22.203 46.512l.252-.312 12.372-18.576c.15-.21.45-.18.54.06 1.98 4.542 3.69 10.188 2.88 13.68-.33 1.44-1.23 3.39-2.28 5.19-.12.24-.27.48-.42.72-.06.09-.15.15-.27.15H22.563c-.24 0-.39-.27-.36-.51zm55.827 5.58c0 .18-.12.33-.27.39-1.02.42-4.47 2.04-5.91 4.02-3.66 5.07-6.45 12.33-12.69 12.33H38.103c-9.24 0-16.74-7.56-16.74-16.86v-.3c0-.21.18-.39.39-.39h13.62c.24 0 .42.21.39.45-.12.78.06 1.59.48 2.31.84 1.41 2.37 2.28 4.02 2.28h6.3v-4.56h-6.24c-.24 0-.39-.3-.24-.51.06-.09.12-.18.21-.27.66-.9 1.62-2.31 2.55-3.93.63-1.11 1.23-2.28 1.71-3.45.09-.21.18-.45.27-.66.12-.33.27-.66.36-.96.09-.27.18-.51.24-.78.21-.75.3-1.53.3-2.34 0-.33-.03-.66-.06-.96-.03-.36-.09-.69-.15-1.05-.06-.3-.15-.6-.24-.9-.12-.42-.27-.84-.45-1.29l-.06-.18c-.15-.39-.27-.75-.45-1.14-.51-1.32-1.08-2.58-1.68-3.72-.21-.42-.45-.81-.66-1.2-.33-.57-.66-1.08-.96-1.56-.15-.24-.33-.48-.48-.69-.18-.24-.36-.48-.51-.69-.21-.27-.42-.57-.63-.84l-.6-.72c-.06-.09-.06-.18.03-.24l4.02-.93z" />
            </svg>
            <Trans>Sell Now</Trans>
          </Button>

          <Button variant="secondary" onClick={() => window.open(explorerUrl, "_blank")}>
            {/* ExternalLink inline SVG */}
            <svg className="mr-8 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <Trans>View</Trans>
          </Button>

          <Button variant="secondary" disabled={isRefreshing} onClick={() => refreshMetadataMutation.mutate()}>
            {/* RefreshCw inline SVG */}
            <svg
              className={`mr-8 h-16 w-16 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? <Trans>Refreshing…</Trans> : <Trans>Refresh</Trans>}
          </Button>
        </div>
      </div>
    </NftDialog>
  );
}

