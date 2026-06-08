import { Trans } from "@lingui/macro";
import { useState, useEffect } from "react";

import { useNftContext } from "domain/nft/nft-context";
import {
  NftData,
  NftLevel,
  getLevelColor,
  getLevelGradient,
  getLevelName,
  getNftImage,
} from "domain/nft/nft-types";
import { useMergeNfts } from "domain/nft/use-nft-staking-mutations";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";
import { NftSuccessDialog } from "components/Nft/NftSuccessDialog";

interface MergeWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNftIds: bigint[];
}

export function MergeWarningDialog({ open, onOpenChange, selectedNftIds }: MergeWarningDialogProps) {
  const { nfts, refetch } = useNftContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [mergedNfts, setMergedNfts] = useState<NftData[]>([]);
  const [newNft, setNewNft] = useState<NftData | null>(null);

  // Snapshot+effect pattern: snapshot existing Silver tokenIds BEFORE refetch,
  // then detect the newly merged Silver once nfts updates. Avoids closure-staleness
  // bug where a setTimeout would read pre-refetch state and pick a pre-existing Silver.
  const [pendingMerge, setPendingMerge] = useState<{
    oldTargetTokenIds: Set<string>;
    oldSourceNfts: NftData[];
  } | null>(null);

  const selectedNftData = nfts.filter((nft) => selectedNftIds.includes(nft.tokenId));
  const mergeLevel = NftLevel.Bronze;
  const targetLevel = NftLevel.Silver;
  const canMerge =
    selectedNftData.length === 5 && selectedNftData.every((nft) => nft.level === NftLevel.Bronze);

  const mergeMutation = useMergeNfts({
    onSuccess: () => {
      // Snapshot before refetch — the effect below uses this to find the new Silver
      const oldTargetTokenIds = new Set(
        nfts.filter((nft) => nft.level === targetLevel).map((nft) => nft.tokenId.toString())
      );
      setPendingMerge({ oldTargetTokenIds, oldSourceNfts: selectedNftData });
      onOpenChange(false);
      refetch();
    },
  });

  // Detect newly merged Silver NFT once refetch lands.
  // Runs on every nfts update while a merge is pending, so the success dialog
  // always displays the actual merged result — not a stale pre-refetch pick.
  useEffect(() => {
    if (!pendingMerge) return;

    const newTargetNfts = nfts.filter(
      (nft) =>
        nft.level === targetLevel &&
        !pendingMerge.oldTargetTokenIds.has(nft.tokenId.toString())
    );
    if (newTargetNfts.length === 0) return;

    // Newest by tokenId — the just-minted merged result
    const newestMergedNft = [...newTargetNfts].sort((a, b) => Number(b.tokenId - a.tokenId))[0];
    setMergedNfts(pendingMerge.oldSourceNfts);
    setNewNft(newestMergedNft);
    setShowSuccess(true);
    setPendingMerge(null);
  }, [nfts, pendingMerge, targetLevel]);

  const isMerging = mergeMutation.isPending;

  return (
    <>
      <NftDialog
        open={open}
        onOpenChange={onOpenChange}
        title={<Trans>⚠️ Merge Warning</Trans>}
      >
        <div className="p-16">
          <div className="mb-16 rounded-8 border-2 border-yellow-500 bg-yellow-500/10 p-16">
            <p className="font-semibold text-yellow-600">
              <Trans>
                NFTs that are merged will be burned and a new NFT of a higher rarity will be
                minted. Are you sure you want to merge?
              </Trans>
            </p>
            <p className="mt-8 text-14 text-gray-300">
              <Trans>
                You are about to merge {selectedNftData.length}{" "}
                {getLevelName(mergeLevel)} NFTs into 1 {getLevelName(targetLevel)} NFT.
              </Trans>
            </p>
          </div>

          {/* NFTs to be merged */}
          <p className="mb-8 text-14 font-medium text-gray-400">
            <Trans>NFTs to be merged:</Trans>
          </p>
          <div className="mb-16 grid grid-cols-3 gap-12">
            {selectedNftData.map((nft) => (
              <div
                key={nft.tokenId.toString()}
                className="relative overflow-hidden rounded-8 border-2"
                style={{
                  borderColor: getLevelColor(nft.level),
                  background:
                    "linear-gradient(180deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)",
                }}
              >
                <img
                  src={getNftImage(nft)}
                  alt={`NFT #${nft.tokenId.toString()}`}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <p className="text-center text-12 font-bold text-white">
                    #{nft.tokenId.toString()}
                  </p>
                </div>
                <span
                  className="absolute left-4 top-4 rounded-full px-8 py-2 text-[10px] font-bold text-white"
                  style={{ background: getLevelGradient(nft.level) }}
                >
                  {getLevelName(nft.level)}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-16 rounded-8 bg-green-500/10 p-12">
            <p className="text-14 text-green-500">
              <Trans>
                Result: 1 <strong>{getLevelName(targetLevel)}</strong> NFT
              </Trans>
            </p>
          </div>

          <div className="flex gap-12">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!canMerge || isMerging}
              onClick={() => mergeMutation.mutate({ tokenIds: selectedNftIds, mergeLevel })}
            >
              {isMerging ? <Trans>Merging…</Trans> : <Trans>Merge</Trans>}
            </Button>
          </div>
        </div>
      </NftDialog>

      <NftSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        oldNfts={mergedNfts}
        newNft={newNft}
        title="🎉 NFTs Merged Successfully!"
        description={`Your ${getLevelName(mergeLevel)} NFTs have been merged into a ${getLevelName(targetLevel)} NFT!`}
      />
    </>
  );
}
