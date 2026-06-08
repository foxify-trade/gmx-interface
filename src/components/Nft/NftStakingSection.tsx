import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Link } from "react-router-dom";

import { NFT_ROUTES } from "config/nft";
import { useNftContext } from "domain/nft/nft-context";
import { getLevelColor, getLevelGlow, getLevelGradient, getLevelName, getNftImage } from "domain/nft/nft-types";
import { useStakeNft, useUnstakeNft } from "domain/nft/use-nft-staking-mutations";
import useWallet from "lib/wallets/useWallet";

import Button from "components/Button/Button";
import { MergeWarningDialog } from "components/Nft/MergeWarningDialog";
import { NftDialog } from "components/Nft/NftDialog";
import { NftMergeSelectionDialog } from "components/Nft/NftMergeSelectionDialog";
import { NftSelectDialog } from "components/Nft/NftSelectDialog";

const OPENSEA_COLLECTION = "https://opensea.io/collection/foxify-funded-bonus-nft-1";

// OpenSea icon SVG path (inline — no lucide-react dep)
const OpenSeaPath =
  "M45 0C20.151 0 0 20.151 0 45c0 24.849 20.151 45 45 45 24.849 0 45-20.151 45-45C90 20.151 69.849 0 45 0zM22.203 46.512l.252-.312 12.372-18.576c.15-.21.45-.18.54.06 1.98 4.542 3.69 10.188 2.88 13.68-.33 1.44-1.23 3.39-2.28 5.19-.12.24-.27.48-.42.72-.06.09-.15.15-.27.15H22.563c-.24 0-.39-.27-.36-.51zm55.827 5.58c0 .18-.12.33-.27.39-1.02.42-4.47 2.04-5.91 4.02-3.66 5.07-6.45 12.33-12.69 12.33H38.103c-9.24 0-16.74-7.56-16.74-16.86v-.3c0-.21.18-.39.39-.39h13.62c.24 0 .42.21.39.45-.12.78.06 1.59.48 2.31.84 1.41 2.37 2.28 4.02 2.28h6.3v-4.56h-6.24c-.24 0-.39-.3-.24-.51.06-.09.12-.18.21-.27.66-.9 1.62-2.31 2.55-3.93.63-1.11 1.23-2.28 1.71-3.45.09-.21.18-.45.27-.66.12-.33.27-.66.36-.96.09-.27.18-.51.24-.78.21-.75.3-1.53.3-2.34 0-.33-.03-.66-.06-.96-.03-.36-.09-.69-.15-1.05-.06-.3-.15-.6-.24-.9-.12-.42-.27-.84-.45-1.29l-.06-.18c-.15-.39-.27-.75-.45-1.14-.51-1.32-1.08-2.58-1.68-3.72-.21-.42-.45-.81-.66-1.2-.33-.57-.66-1.08-.96-1.56-.15-.24-.33-.48-.48-.69-.18-.24-.36-.48-.51-.69-.21-.27-.42-.57-.63-.84l-.6-.72c-.06-.09-.06-.18.03-.24l4.02-.93z";

export type NftStakingSectionVariant = "default" | "startJourney";

interface NftStakingSectionProps {
  variant?: NftStakingSectionVariant;
}

export function NftStakingSection({ variant = "default" }: NftStakingSectionProps) {
  const isStartJourney = variant === "startJourney";
  const { stakedNft, nfts, refetch } = useNftContext();
  const { account } = useWallet();
  const isConnected = !!account;

  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showUnstakeDialog, setShowUnstakeDialog] = useState(false);
  const [showMergeSelection, setShowMergeSelection] = useState(false);
  const [showMergeWarning, setShowMergeWarning] = useState(false);
  const [selectedMergeNfts, setSelectedMergeNfts] = useState<bigint[]>([]);

  const stakeNft = useStakeNft({ onSuccess: () => { setShowStakeDialog(false); refetch(); } });
  const unstakeNft = useUnstakeNft({ onSuccess: () => { setShowUnstakeDialog(false); refetch(); } });

  const hasUnstakedNfts = nfts.some((nft) => !nft.isStaked);
  const isStaking = stakeNft.isPending;
  const isUnstaking = unstakeNft.isPending;

  return (
    <div className="rounded-8 border border-white/10 bg-[rgba(20,20,30,0.8)] p-24">
      <h2 className="mb-24 text-24 font-bold text-white"><Trans>Staking</Trans></h2>

      <div className="mt-8 flex flex-col gap-32 lg:flex-row">
        {/* NFT Preview */}
        <div className="flex flex-col items-center">
          <div
            className="relative flex w-[208px] items-center justify-center overflow-hidden rounded-12 border-2"
            style={{
              borderColor: stakedNft ? getLevelColor(stakedNft.level) : "rgba(255,255,255,0.1)",
              boxShadow: stakedNft ? getLevelGlow(stakedNft.level) : "none",
            }}
          >
            {stakedNft ? (
              <>
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: `radial-gradient(circle at center, ${getLevelColor(stakedNft.level)} 0%, transparent 70%)` }}
                />
                <img src={getNftImage(stakedNft)} alt={`NFT #${stakedNft.tokenId.toString()}`} className="h-full w-full object-cover" />
                <span
                  className="absolute bottom-8 left-8 px-8 py-4 text-12 font-bold text-white"
                  style={{ background: getLevelGradient(stakedNft.level) }}
                >
                  {getLevelName(stakedNft.level)}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center px-8 py-24 text-center text-gray-500">
                <svg className="mb-8 h-48 w-48 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-14 font-medium"><Trans>No NFT Staked</Trans></span>
                <span className="mt-4 text-12 text-gray-600"><Trans>Stake an NFT to earn bonus funding</Trans></span>
              </div>
            )}
          </div>
          <div className="mt-12 text-center">
            <p className="font-medium text-white">
              <Trans>NFT ID:</Trans>{" "}
              {stakedNft ? (
                <span className="text-blue-400">#{stakedNft.tokenId.toString()}</span>
              ) : (
                <span className="text-gray-500"><Trans>None</Trans></span>
              )}
            </p>
            <p className="text-14 text-gray-400">
              <Trans>Rarity:</Trans>{" "}
              {stakedNft ? (
                <span style={{ color: getLevelColor(stakedNft.level) }}>{getLevelName(stakedNft.level)}</span>
              ) : (
                <span className="text-gray-500"><Trans>None</Trans></span>
              )}
            </p>
          </div>
        </div>

        {/* Staking actions */}
        <div className="flex flex-1 flex-col justify-center">
          <p className="mb-24 text-20 font-semibold text-white">
            <Trans>Get More Funding By staking an NFT</Trans>
          </p>

          <div className="my-16 flex gap-16">
            <div className="flex flex-col">
              <Button className="w-[140px]" variant="primary" disabled={!isConnected || !hasUnstakedNfts || isStaking} onClick={() => setShowStakeDialog(true)}>
                {isStaking ? <Trans>Staking…</Trans> : <Trans>Stake Now</Trans>}
              </Button>
              {!isConnected && <span className="mt-4 text-12 text-gray-500"><Trans>Connect wallet to stake</Trans></span>}
              {isConnected && !hasUnstakedNfts && nfts.length > 0 && <span className="mt-4 text-12 text-gray-500"><Trans>All NFTs already staked</Trans></span>}
              {isConnected && nfts.length === 0 && <span className="mt-4 text-12 text-gray-500"><Trans>No NFTs available</Trans></span>}
            </div>
            <div className="flex flex-col">
              <Button className="w-[140px]" variant="secondary" disabled={!isConnected || !stakedNft || isUnstaking} onClick={() => setShowUnstakeDialog(true)}>
                {isUnstaking ? <Trans>Unstaking…</Trans> : <Trans>Unstake</Trans>}
              </Button>
              {isConnected && !stakedNft && <span className="mt-4 text-12 text-gray-500"><Trans>No NFT currently staked</Trans></span>}
            </div>
          </div>

          <p className="mb-16 text-gray-400">
            {isStartJourney
              ? <Trans>No NFT to Stake? Buy or Manage your NFTs to receive more funding</Trans>
              : <Trans>No NFT to Stake? Buy or Merge one to receive more funding</Trans>}
          </p>

          <div className="mt-16 flex flex-wrap gap-16">
            <Button className="w-[140px]" variant="primary" onClick={() => window.open(OPENSEA_COLLECTION, "_blank")}>
              <svg className="mr-8 h-16 w-16" viewBox="0 0 90 90" fill="currentColor"><path d={OpenSeaPath} /></svg>
              <Trans>Buy Now</Trans>
            </Button>
            {isStartJourney ? (
              <Link to={NFT_ROUTES.management}>
                <Button className="w-[140px]" variant="primary"><Trans>Manage</Trans></Button>
              </Link>
            ) : (
              <div className="flex flex-col">
                <Button className="w-[140px]" variant="primary" disabled={!isConnected} onClick={() => setShowMergeSelection(true)}>
                  <Trans>Merge</Trans>
                </Button>
                {!isConnected && <span className="mt-4 text-12 text-gray-500"><Trans>Connect wallet to merge</Trans></span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NftSelectDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
        onSelect={(tokenId) => stakeNft.mutate(tokenId)}
        isLoading={isStaking}
        title="Select NFT to Stake"
      />

      <NftDialog open={showUnstakeDialog} onOpenChange={setShowUnstakeDialog} title={<Trans>Unstake NFT</Trans>}>
        <div className="p-16">
          <p className="mb-16 text-gray-200">
            <Trans>Are you sure you want to unstake NFT #{stakedNft?.tokenId.toString()}?</Trans>
          </p>
          <p className="mb-16 text-14 text-gray-400">
            <Trans>You will lose the extra funding bonus while this NFT is unstaked.</Trans>
          </p>
          <div className="flex gap-12">
            <Button variant="secondary" className="flex-1" onClick={() => setShowUnstakeDialog(false)}><Trans>Cancel</Trans></Button>
            <Button variant="primary" className="flex-1" disabled={isUnstaking} onClick={() => unstakeNft.mutate()}>
              {isUnstaking ? <Trans>Unstaking…</Trans> : <Trans>Confirm Unstake</Trans>}
            </Button>
          </div>
        </div>
      </NftDialog>

      <NftMergeSelectionDialog
        open={showMergeSelection}
        onOpenChange={setShowMergeSelection}
        onConfirmSelection={(ids) => { setSelectedMergeNfts(ids); setShowMergeSelection(false); setShowMergeWarning(true); }}
      />

      <MergeWarningDialog
        open={showMergeWarning}
        onOpenChange={setShowMergeWarning}
        selectedNftIds={selectedMergeNfts}
      />
    </div>
  );
}
