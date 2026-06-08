import { Trans, t } from "@lingui/macro";
import { useState, useMemo } from "react";

import { arbitrumPublicClient } from "domain/nft/contracts/arbitrum-public-client";
import { FOXIFY_V3_NFT_ADDRESS, FOXIFY_V3_NFT_ABI } from "domain/nft/contracts/nft-contracts";
import { useNftContext } from "domain/nft/nft-context";
import { NftLevel } from "domain/nft/nft-types";
import { helperToast } from "lib/helperToast";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";
import { NftMergeSelectionGrid } from "components/Nft/NftMergeSelectionGrid";

const REQUIRED_COUNT = 5;

interface NftMergeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmSelection: (selectedIds: bigint[]) => void;
}

export function NftMergeSelectionDialog({
  open,
  onOpenChange,
  onConfirmSelection,
}: NftMergeSelectionDialogProps) {
  const { nfts } = useNftContext();
  const [selectedNftIds, setSelectedNftIds] = useState<Set<bigint>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const bronzeNfts = useMemo(
    () => nfts.filter((nft) => nft.level === NftLevel.Bronze),
    [nfts]
  );

  const canMerge = selectedNftIds.size === REQUIRED_COUNT;

  const toggleSelection = (tokenId: bigint) => {
    // Guard: only allow Bronze NFTs
    const nft = nfts.find((n) => n.tokenId === tokenId);
    if (!nft || nft.level !== NftLevel.Bronze) return;

    setSelectedNftIds((prev) => {
      const next = new Set(prev);
      if (next.has(tokenId)) {
        next.delete(tokenId);
      } else if (next.size < REQUIRED_COUNT) {
        next.add(tokenId);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!canMerge || isValidating) return;
    setIsValidating(true);
    try {
      const selectedIds = Array.from(selectedNftIds);
      // Validate on-chain levels to prevent stale-metadata mismatches
      const onchainLevels = await Promise.all(
        selectedIds.map(async (tokenId) => {
          const data = (await arbitrumPublicClient.readContract({
            address: FOXIFY_V3_NFT_ADDRESS,
            abi: FOXIFY_V3_NFT_ABI,
            functionName: "data",
            args: [tokenId],
          })) as [number, string, bigint];
          return { tokenId, onchainLevel: data[0] as NftLevel };
        })
      );

      const invalidNfts = onchainLevels.filter((n) => n.onchainLevel !== NftLevel.Bronze);
      if (invalidNfts.length > 0) {
        helperToast.error(
          t`Cannot merge: ${invalidNfts.length} NFT(s) are not Bronze level on-chain. Please refresh and try again.`
        );
        return;
      }

      onConfirmSelection(selectedIds);
      setSelectedNftIds(new Set());
    } catch {
      helperToast.error(t`Failed to validate NFT levels. Please try again.`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setSelectedNftIds(new Set());
    onOpenChange(false);
  };

  return (
    <NftDialog
      open={open}
      onOpenChange={onOpenChange}
      title={<Trans>Select Bronze NFTs to Merge</Trans>}
    >
      <div className="p-8">
        {/* Instructions */}
        <div className="mb-16 rounded-8 border-2 border-blue-500/30 bg-blue-500/10 p-16">
          <p className="text-14 font-medium text-blue-300">
            <Trans>
              💡 Select exactly {REQUIRED_COUNT} Bronze NFTs to merge them into 1 Silver NFT
            </Trans>
          </p>
          <p className="mt-4 text-12 text-blue-400/80">
            <Trans>Selected: {selectedNftIds.size} / {REQUIRED_COUNT}</Trans>
          </p>
        </div>

        <NftMergeSelectionGrid
          bronzeNfts={bronzeNfts}
          selectedNftIds={selectedNftIds}
          requiredCount={REQUIRED_COUNT}
          onToggle={toggleSelection}
        />

        {bronzeNfts.length > 0 && (
          <div className="mt-16 flex gap-12">
            <Button variant="secondary" className="flex-1" onClick={handleCancel}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!canMerge || isValidating}
              onClick={handleConfirm}
            >
              {isValidating
                ? <Trans>Validating…</Trans>
                : <Trans>Merge {selectedNftIds.size}/{REQUIRED_COUNT}</Trans>}
            </Button>
          </div>
        )}
      </div>
    </NftDialog>
  );
}
