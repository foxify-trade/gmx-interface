import type { FundedFeatureItem, FundedMarketGroup } from "domain/funded/funded-types";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-10 flex items-center gap-10">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

export function FundedFeaturesGrid({
  features,
  marketGroups,
}: {
  features: FundedFeatureItem[];
  marketGroups: FundedMarketGroup[];
}) {
  return (
    <div className="grid gap-16">
      <section>
        <SectionHeader title="No restrictions. No surprises." />
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-8 border border-slate-600 bg-[#242529] px-14 py-12">
              <div className="flex items-start gap-10">
                <div className="pt-2 text-[14px]">{feature.icon ?? "•"}</div>
                <div>
                  <div className="text-[12px] font-semibold text-white">{feature.title}</div>
                  <div className="mt-6 text-[11px] leading-5 text-slate-400">{feature.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-8 border border-violet-400/50 bg-[#2a2b30] px-16 py-16">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <div className="numbers text-[32px] font-extrabold leading-none text-violet-300">$50,000</div>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">USDC bounty</div>
          </div>
          <div className="hidden h-14 w-px bg-slate-700 lg:block" />
          <div className="flex-1 text-[12px] leading-6 text-slate-300">
            We keep the original funded payout confidence visible in the preview. If the funded path ever rejects a legitimate
            payout in production, the design intent is a contract-first settlement model rather than a manual review queue.
          </div>
          <div className="rounded-full border border-violet-400/50 px-10 py-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            Payout guarantee
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Trade 220+ markets" />
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {marketGroups.map((group) => (
            <div key={group.title} className="rounded-8 border border-slate-600 bg-[#242529] px-14 py-12">
              <div className="flex items-center gap-8">
                <div className="text-[15px]">{group.icon}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">{group.title}</div>
                {group.badgeLabel ? (
                  <div className="ml-auto rounded-full border border-violet-400/50 px-8 py-4 text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-200">
                    {group.badgeLabel}
                  </div>
                ) : null}
              </div>

              <div className="mt-12 flex flex-wrap gap-8">
                {group.symbols.map((symbol) => (
                  <div key={symbol} className="rounded-8 border border-slate-700 bg-[#1f2024] px-8 py-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                    {symbol}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
