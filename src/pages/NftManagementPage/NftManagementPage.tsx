import { Trans } from "@lingui/macro";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { NftProvider } from "domain/nft/nft-context";
import { NftData } from "domain/nft/nft-types";
import { useUserV2Nfts, useUserV3Nfts, useUserStakedNft } from "domain/nft/use-user-nfts";

import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";
import { MigrateAndMintSection } from "components/Nft/MigrateAndMintSection";
import { NftStakingSection } from "components/Nft/NftStakingSection";
import { YourNftsSection } from "components/Nft/YourNftsSection";

function NftManagementPageContent() {
  const queryClient = useQueryClient();
  const { data: v2Nfts = [], isLoading: v2Loading } = useUserV2Nfts();
  const { data: v3Nfts = [], isLoading: v3Loading } = useUserV3Nfts();
  const { data: stakedNftId, isLoading: stakedLoading } = useUserStakedNft();

  const nfts = useMemo(() => [...v2Nfts, ...v3Nfts], [v2Nfts, v3Nfts]);
  const isLoading = v2Loading || v3Loading || stakedLoading;

  const stakedNft = useMemo<NftData | null>(() => {
    if (stakedNftId === undefined || stakedNftId === BigInt(0)) return null;
    return nfts.find((nft) => nft.tokenId === stakedNftId) ?? null;
  }, [nfts, stakedNftId]);

  const nftsWithStakedStatus = useMemo<NftData[]>(
    () =>
      nfts.map((nft) => ({
        ...nft,
        isStaked:
          stakedNftId !== undefined &&
          stakedNftId !== BigInt(0) &&
          nft.tokenId === stakedNftId,
      })),
    [nfts, stakedNftId]
  );

  // Invalidate all NFT-related queries so subscribers outside this page also refresh.
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["nft"] });
  }, [queryClient]);

  return (
    <NftProvider nfts={nftsWithStakedStatus} stakedNft={stakedNft} isLoading={isLoading} refetch={refetch}>
      <div className="page-layout flex flex-col gap-24">
        {/* Page header */}
        <div>
          <h1 className="mb-8 text-[28px] font-extrabold text-white">
            <Trans>NFTs</Trans>
          </h1>
          <p className="text-14 text-gray-400">
            <Trans>
              Manage Your Foxify NFTs, stake them to earn extra funding for FUNDED challenges{" "}
              <span className="text-yellow-500">(10% extra with Silver NFT, 25% extra with Gold NFT)</span>
              <br />
              Staked NFTs provide extra funding across <strong>ALL</strong> Funded platforms and
              integrations{" "}
              <span className="text-red-500">EXCEPT app.foxify.trade</span>
            </Trans>
          </p>
        </div>

        <NftStakingSection />
        <MigrateAndMintSection />
        <YourNftsSection />
      </div>
    </NftProvider>
  );
}

export function NftManagementPage() {
  return (
    <AppPageLayout title="NFTs" header={<ChainContentHeader />}>
      <NftManagementPageContent />
    </AppPageLayout>
  );
}
