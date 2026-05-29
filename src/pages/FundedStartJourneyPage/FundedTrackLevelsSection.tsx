import type { FundedTrackDefinition } from "domain/funded/funded-types";
import { formatFundedUsd } from "domain/funded/funded-utils";

function getLevelDotStyle(color?: string) {
  return color ? { boxShadow: `0 0 0 1px ${color} inset` } : undefined;
}

function getLevelTextStyle(color?: string) {
  return color ? { color } : undefined;
}

function LevelStat({ label, value, accentClass }: { label: string; value: string; accentClass?: string }) {
  return (
    <div className="rounded-8 border border-slate-600 bg-[#1f2024] px-12 py-10">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className={`mt-6 text-[13px] font-semibold ${accentClass ?? "text-white"}`}>{value}</div>
    </div>
  );
}

export function FundedTrackLevelsSection({ track }: { track: FundedTrackDefinition }) {
  return (
    <section>
      <div className="mb-10 flex items-center justify-between gap-12">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {track.id} scaling path — {track.levelsToTop} levels
        </div>
        <div className="text-[10px] text-slate-500">All levels use 100 pts targets in this preview.</div>
      </div>

      <div className="grid gap-12">
        {track.levels.map((level, index) => (
          <div key={level.id} className="rounded-8 border border-slate-600 bg-[#242529] px-14 py-14">
            <div className="flex gap-12">
              <div className="flex w-18 shrink-0 justify-center pt-4">
                <div className="relative flex flex-col items-center">
                  <span
                    className="size-10 rounded-full border border-slate-300 bg-[#242529]"
                    style={getLevelDotStyle(level.accentColor ?? "#94a3b8")}
                  />
                  {index < track.levels.length - 1 ? <span className="mt-6 h-full w-px bg-slate-700" /> : null}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={getLevelTextStyle(level.accentColor)}>
                      {level.name}
                    </div>
                    <div className="mt-6 text-[10px] uppercase tracking-[0.12em] text-slate-500">Funded size</div>
                  </div>
                  <div className="numbers text-right text-[24px] font-extrabold text-white">{formatFundedUsd(level.accountSizeUsd)}</div>
                </div>

                <div className="mt-12 grid gap-10 md:grid-cols-3">
                  <LevelStat label="Profit target" value={formatFundedUsd(level.profitTargetUsd)} accentClass="text-emerald-300" />
                  <LevelStat label="Points target" value={`${level.pointsTarget} pts`} accentClass="text-sky-300" />
                  <LevelStat label="Max drawdown" value={`${level.maxDrawdownPct}%`} accentClass="text-rose-300" />
                </div>

                <div className="mt-10 text-[10px] font-medium uppercase tracking-[0.12em]" style={getLevelTextStyle(level.accentColor)}>
                  Hit targets + share profits + advance to next level.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
