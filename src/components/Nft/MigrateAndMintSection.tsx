import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { arbitrumPublicClient } from "domain/nft/contracts/arbitrum-public-client";
import {
  FOXIFY_V2_NFT_ADDRESS,
  FOXIFY_V2_NFT_ABI,
  FOXIFY_V3_NFT_ADDRESS,
} from "domain/nft/contracts/nft-contracts";
import { useNftContext } from "domain/nft/nft-context";
import { NftData, NftVersion } from "domain/nft/nft-types";
import { useMerkleProof } from "domain/nft/use-merkle-proof";
import { useCurrentMintWave, useHasClaimed } from "domain/nft/use-nft-merge-config";
import { useApproveV2Nfts, useMigrateNfts, useMintNft } from "domain/nft/use-nft-migrate-mint-mutations";
import useWallet from "lib/wallets/useWallet";

import {
  MigratePanel,
  MintPanel,
  MigrateConfirmDialog,
  MintConfirmDialog,
  MigrateAndMintSuccessDialogs,
} from "components/Nft/MigrateAndMintDialogs";

export function MigrateAndMintSection() {
  const { nfts, refetch } = useNftContext();
  const { account } = useWallet();
  const isConnected = !!account;

  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showMigrationSuccess, setShowMigrationSuccess] = useState(false);
  const [migratedNfts, setMigratedNfts] = useState<NftData[]>([]);
  const [newMigratedNft, setNewMigratedNft] = useState<NftData | null>(null);
  const [showMintSuccess, setShowMintSuccess] = useState(false);
  const [mintedNft, setMintedNft] = useState<NftData | null>(null);

  // Snapshot+effect: snapshot existing V3 tokenIds BEFORE refetch lands so the
  // effect below can reliably detect the newly-minted V3 — avoids closure-staleness
  // where setTimeout would read pre-refetch nfts and pick a pre-existing V3.
  const [pendingMigration, setPendingMigration] = useState<{
    oldV3TokenIds: Set<string>;
    oldV2Nfts: NftData[];
  } | null>(null);
  const [pendingMint, setPendingMint] = useState<{ oldV3TokenIds: Set<string> } | null>(null);

  const v2Nfts = nfts.filter((n) => n.version === NftVersion.V2);
  const hasV2Nfts = v2Nfts.length > 0;

  const { data: currentWave } = useCurrentMintWave();
  const { data: hasClaimed } = useHasClaimed(currentWave?.id ?? BigInt(0));
  const { data: merkleProofData } = useMerkleProof();
  const isWhitelisted = !!merkleProofData?.proof?.length;
  const isMintActive = !!(currentWave?.isActive && !hasClaimed);

  const { data: isV2Approved, refetch: refetchApproval } = useQuery({
    queryKey: ["nft", "v2-approval", account, v2Nfts.length],
    queryFn: async () => {
      if (!account || !hasV2Nfts) return false;
      try {
        return (await arbitrumPublicClient.readContract({
          address: FOXIFY_V2_NFT_ADDRESS,
          abi: FOXIFY_V2_NFT_ABI,
          functionName: "isApprovedForAll",
          args: [account as `0x${string}`, FOXIFY_V3_NFT_ADDRESS],
        })) as boolean;
      } catch {
        return false;
      }
    },
    enabled: isConnected && hasV2Nfts,
  });

  const approveV2 = useApproveV2Nfts({ onSuccess: () => { refetchApproval(); } });
  const migrateNfts = useMigrateNfts({
    onSuccess: () => {
      const oldV3TokenIds = new Set(
        nfts.filter((n) => n.version === NftVersion.V3).map((n) => n.tokenId.toString())
      );
      setPendingMigration({ oldV3TokenIds, oldV2Nfts: v2Nfts });
      setShowMigrateDialog(false);
      refetch();
      refetchApproval();
    },
  });
  const mintNft = useMintNft({
    onSuccess: () => {
      const oldV3TokenIds = new Set(
        nfts.filter((n) => n.version === NftVersion.V3).map((n) => n.tokenId.toString())
      );
      setPendingMint({ oldV3TokenIds });
      setShowMintDialog(false);
      refetch();
    },
  });

  // Detect newly migrated V3 NFTs once refetch lands.
  useEffect(() => {
    if (!pendingMigration) return;
    const newV3 = nfts.filter(
      (n) => n.version === NftVersion.V3 && !pendingMigration.oldV3TokenIds.has(n.tokenId.toString())
    );
    if (newV3.length === 0) return;
    const newest = [...newV3].sort((a, b) => Number(b.tokenId - a.tokenId))[0];
    setMigratedNfts(pendingMigration.oldV2Nfts);
    setNewMigratedNft(newest);
    setShowMigrationSuccess(true);
    setPendingMigration(null);
  }, [nfts, pendingMigration]);

  // Detect the newly minted V3 NFT once refetch lands.
  useEffect(() => {
    if (!pendingMint) return;
    const newV3 = nfts.filter(
      (n) => n.version === NftVersion.V3 && !pendingMint.oldV3TokenIds.has(n.tokenId.toString())
    );
    if (newV3.length === 0) return;
    const justMinted = [...newV3].sort((a, b) => Number(b.tokenId - a.tokenId))[0];
    setMintedNft(justMinted);
    setShowMintSuccess(true);
    setPendingMint(null);
  }, [nfts, pendingMint]);

  const isApproving = approveV2.isPending;
  const isMigrating = migrateNfts.isPending;
  const isMinting = mintNft.isPending;

  return (
    <div className="grid gap-24">
      <MigratePanel
        isConnected={isConnected}
        hasV2Nfts={hasV2Nfts}
        v2NftsCount={v2Nfts.length}
        isV2Approved={isV2Approved}
        isApproving={isApproving}
        isMigrating={isMigrating}
        onAction={() => { if (!isV2Approved) { approveV2.mutate(); } else { setShowMigrateDialog(true); } }}
      />
      <MintPanel
        isConnected={isConnected}
        isMintActive={isMintActive}
        isWhitelisted={isWhitelisted}
        hasClaimed={hasClaimed}
        isMinting={isMinting}
        onMintClick={() => setShowMintDialog(true)}
      />
      <MigrateConfirmDialog
        open={showMigrateDialog}
        onOpenChange={setShowMigrateDialog}
        v2Nfts={v2Nfts}
        isMigrating={isMigrating}
        onConfirm={() => migrateNfts.mutate(v2Nfts.map((n) => n.tokenId))}
      />
      <MintConfirmDialog
        open={showMintDialog}
        onOpenChange={setShowMintDialog}
        isMinting={isMinting}
        proof={merkleProofData?.proof}
        onConfirm={(proof) => mintNft.mutate(proof)}
      />
      <MigrateAndMintSuccessDialogs
        showMigrationSuccess={showMigrationSuccess}
        onMigrationSuccessChange={setShowMigrationSuccess}
        migratedNfts={migratedNfts}
        newMigratedNft={newMigratedNft}
        showMintSuccess={showMintSuccess}
        onMintSuccessChange={setShowMintSuccess}
        mintedNft={mintedNft}
      />
    </div>
  );
}
