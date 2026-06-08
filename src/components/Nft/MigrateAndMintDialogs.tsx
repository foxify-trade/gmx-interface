import { Trans, t } from "@lingui/macro";

import { NftData, getLevelGradient, getLevelName, getNftImage } from "domain/nft/nft-types";
import { helperToast } from "lib/helperToast";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";
import { NftSuccessDialog } from "components/Nft/NftSuccessDialog";

// ─── Section panels ──────────────────────────────────────────────────────────

interface MigratePanelProps {
  isConnected: boolean;
  hasV2Nfts: boolean;
  v2NftsCount: number;
  isV2Approved: boolean | undefined;
  isApproving: boolean;
  isMigrating: boolean;
  onAction: () => void;
}

/** Presentational panel for the "Migrate NFTs" card. */
export function MigratePanel({
  isConnected, hasV2Nfts, v2NftsCount, isV2Approved,
  isApproving, isMigrating, onAction,
}: MigratePanelProps) {
  return (
    <div className="rounded-8 border border-white/10 bg-[rgba(20,20,30,0.8)] p-24">
      <div className="mb-16 flex items-center gap-12">
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-400">
          <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <h2 className="text-20 font-bold text-white"><Trans>Migrate NFTs</Trans></h2>
      </div>
      <p className="mb-24 text-gray-400">
        <Trans>Only V3 NFTs are Stakeable. Use the Migrate button to migrate all V2 NFTs in your wallet to V3.</Trans>
      </p>
      <Button variant="primary" disabled={!isConnected || !hasV2Nfts || isApproving || isMigrating} onClick={onAction}>
        {isApproving ? <Trans>Approving…</Trans> : isMigrating ? <Trans>Migrating…</Trans> : !isV2Approved ? <Trans>Approve</Trans> : <Trans>Migrate</Trans>}
      </Button>
      {hasV2Nfts ? (
        <p className="mt-12 text-14 text-yellow-500">
          <Trans>{v2NftsCount} V2 NFT{v2NftsCount !== 1 ? "s" : ""} available for migration{isV2Approved === false ? " — Approval required" : ""}</Trans>
        </p>
      ) : (
        <p className="mt-12 text-14 text-gray-500">
          {!isConnected ? <Trans>Connect wallet to check for V2 NFTs</Trans> : <Trans>No V2 NFTs found in your wallet</Trans>}
        </p>
      )}
    </div>
  );
}

interface MintPanelProps {
  isConnected: boolean;
  isMintActive: boolean;
  isWhitelisted: boolean;
  hasClaimed: boolean | undefined;
  isMinting: boolean;
  onMintClick: () => void;
}

/** Presentational panel for the "Mint NFT" card. */
export function MintPanel({
  isConnected, isMintActive, isWhitelisted, hasClaimed, isMinting, onMintClick,
}: MintPanelProps) {
  return (
    <div className="rounded-8 border border-white/10 bg-[rgba(20,20,30,0.8)] p-24">
      <div className="mb-16 flex items-center gap-12">
        <div className={`flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br ${isMintActive && isWhitelisted ? "from-yellow-500 to-yellow-500" : "from-gray-500 to-gray-700"}`}>
          {isMintActive && isWhitelisted ? (
            <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3z" />
            </svg>
          ) : (
            <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <h2 className="text-20 font-bold text-white"><Trans>Mint NFT</Trans></h2>
      </div>
      <p className="mb-24 text-gray-400">
        {isMintActive ? <Trans>Mint a new Foxify Trading NFT. You will receive a random Bronze, Silver, or Gold NFT!</Trans> : <Trans>Date: TBD</Trans>}
      </p>
      <Button variant="primary" disabled={!isConnected || !isMintActive || !isWhitelisted || !!hasClaimed || isMinting} onClick={onMintClick}>
        {isMinting ? <Trans>Minting…</Trans> : hasClaimed ? <Trans>Already Claimed</Trans> : isMintActive ? <Trans>Mint Now</Trans> : <Trans>Closed</Trans>}
      </Button>
      <p className="mt-12 text-14 text-gray-500">
        {!isConnected ? <Trans>Connect wallet to check eligibility</Trans>
          : hasClaimed ? <Trans>You have already minted in this wave</Trans>
          : !isMintActive ? <Trans>No active mint wave</Trans>
          : !isWhitelisted ? <Trans>Your address is not whitelisted for this wave</Trans>
          : <Trans>You are eligible to mint!</Trans>}
      </p>
    </div>
  );
}

// ─── Confirmation dialogs ─────────────────────────────────────────────────────

interface MigrateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  v2Nfts: NftData[];
  isMigrating: boolean;
  onConfirm: () => void;
}

/** Confirmation dialog shown before V2→V3 migration executes. */
export function MigrateConfirmDialog({
  open,
  onOpenChange,
  v2Nfts,
  isMigrating,
  onConfirm,
}: MigrateDialogProps) {
  return (
    <NftDialog open={open} onOpenChange={onOpenChange} title={<Trans>Migrate V2 NFTs to V3</Trans>}>
      <div className="p-16">
        <div className="mb-16 rounded-12 bg-blue-500/10 p-16">
          <p className="text-blue-400">
            <Trans>
              You have <strong>{v2Nfts.length}</strong> V2 NFT{v2Nfts.length !== 1 ? "s" : ""} that
              can be migrated to V3.
            </Trans>
          </p>
        </div>
        <p className="mb-8 text-14 text-gray-400">
          <Trans>NFTs to migrate:</Trans>
        </p>
        <div className="mb-16 grid max-h-[300px] grid-cols-3 gap-12 overflow-y-auto">
          {v2Nfts.map((nft) => (
            <div
              key={nft.tokenId.toString()}
              className="relative flex flex-col items-center rounded-12 border border-white/10 bg-white/5 p-8"
            >
              <div className="relative mb-8 w-full overflow-hidden rounded-8">
                <img
                  src={getNftImage(nft)}
                  alt={`NFT #${nft.tokenId.toString()}`}
                  className="aspect-square w-full rounded-8 object-cover"
                />
                <span
                  className="absolute bottom-4 left-4 rounded-full px-8 py-2 text-[10px] font-bold text-white shadow-lg"
                  style={{ background: getLevelGradient(nft.level) }}
                >
                  {getLevelName(nft.level)}
                </span>
              </div>
              <span className="text-14 font-medium text-white">#{nft.tokenId.toString()}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-12">
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
          <Button variant="primary" className="flex-1" disabled={isMigrating} onClick={onConfirm}>
            {isMigrating ? <Trans>Migrating…</Trans> : <Trans>Confirm Migration</Trans>}
          </Button>
        </div>
      </div>
    </NftDialog>
  );
}

interface MintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMinting: boolean;
  proof: string[] | undefined;
  onConfirm: (proof: string[]) => void;
}

/** Confirmation dialog shown before minting a new NFT. */
export function MintConfirmDialog({
  open,
  onOpenChange,
  isMinting,
  proof,
  onConfirm,
}: MintDialogProps) {
  const handleMint = () => {
    if (!proof?.length) {
      helperToast.error(t`No whitelist proof available`);
      return;
    }
    onConfirm(proof);
  };

  return (
    <NftDialog open={open} onOpenChange={onOpenChange} title={<Trans>Mint Foxify Trading NFT</Trans>}>
      <div className="p-16">
        <div className="mb-16 rounded-12 bg-gradient-to-r from-yellow-500/10 to-yellow-500/10 p-16">
          <p className="text-yellow-500">
            <Trans>
              You will receive <strong>1 random NFT</strong> which can be Bronze, Silver, or Gold
              tier!
            </Trans>
          </p>
        </div>
        <div className="mb-16 rounded-8 bg-white/5 p-12">
          <p className="text-14 text-gray-400">
            <Trans>Note: Each address can only mint once per wave.</Trans>
          </p>
        </div>
        <div className="flex gap-12">
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
          <Button variant="primary" className="flex-1" disabled={isMinting} onClick={handleMint}>
            {isMinting ? <Trans>Minting…</Trans> : <Trans>Mint NFT</Trans>}
          </Button>
        </div>
      </div>
    </NftDialog>
  );
}

interface SuccessDialogsProps {
  showMigrationSuccess: boolean;
  onMigrationSuccessChange: (open: boolean) => void;
  migratedNfts: NftData[];
  newMigratedNft: NftData | null;
  showMintSuccess: boolean;
  onMintSuccessChange: (open: boolean) => void;
  mintedNft: NftData | null;
}

/** Success dialogs for both migration and mint flows. */
export function MigrateAndMintSuccessDialogs({
  showMigrationSuccess,
  onMigrationSuccessChange,
  migratedNfts,
  newMigratedNft,
  showMintSuccess,
  onMintSuccessChange,
  mintedNft,
}: SuccessDialogsProps) {
  return (
    <>
      <NftSuccessDialog
        open={showMigrationSuccess}
        onOpenChange={onMigrationSuccessChange}
        oldNfts={migratedNfts}
        newNft={newMigratedNft}
        title="🎉 Migration Successful!"
        description="Your V2 NFTs have been migrated to V3!"
        oldNftsLabel={
          migratedNfts.length === 1 ? "Previous V2 NFT" : `${migratedNfts.length} V2 NFTs Migrated`
        }
      />
      <NftSuccessDialog
        open={showMintSuccess}
        onOpenChange={onMintSuccessChange}
        oldNfts={[]}
        newNft={mintedNft}
        title="🎉 Congratulations!"
        description="Your Foxify Trading NFT has been minted!"
        showMintWarning
      />
    </>
  );
}
