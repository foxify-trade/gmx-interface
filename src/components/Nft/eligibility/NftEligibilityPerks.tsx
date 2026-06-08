import { Trans } from "@lingui/macro";

const PERKS = [
  {
    emoji: "🏆",
    title: <Trans>Staking Rewards</Trans>,
    body: (
      <Trans>
        Stake your NFT to earn bonus funding on FUNDED challenges — up to 25% extra with a Gold NFT
        across all integrated platforms.
      </Trans>
    ),
  },
  {
    emoji: "⚡",
    title: <Trans>Tier System</Trans>,
    body: (
      <Trans>
        Bronze, Silver, and Gold tiers each unlock escalating perks. Silver grants 10% bonus; Gold
        unlocks 25% extra challenge funding.
      </Trans>
    ),
  },
  {
    emoji: "🦊",
    title: <Trans>Exclusive Art</Trans>,
    body: (
      <Trans>
        Hand-crafted character NFTs with unique traits. A limited on-chain collection that reflects
        your trading legacy on Mune.
      </Trans>
    ),
  },
] as const;

export function NftEligibilityPerks() {
  return (
    <section>
      <p className="mb-12 text-12 font-semibold uppercase tracking-widest text-[#a8b0c0]">
        <Trans>NFT Perks</Trans>
      </p>
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
        {PERKS.map(({ emoji, title, body }, i) => (
          <div key={i} className="flex flex-col gap-12 rounded-8 border border-[#3a3f50] bg-[#16182a] p-20">
            <span className="text-[30px]">{emoji}</span>
            <div>
              <h3 className="text-14 font-semibold text-white">{title}</h3>
              <p className="mt-4 text-12 leading-base text-[#a8b0c0]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
