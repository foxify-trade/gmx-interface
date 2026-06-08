# NFT UI Fix — GMX Tailwind Scale Mapping (Authoritative)

## Root cause
`tailwind.config.ts` REPLACES (not extends) these scales. NFT files used default-Tailwind values → broken.

| Scale | GMX override | Effect of default values |
|-------|--------------|--------------------------|
| spacing | `0..96` → `{N}px` | `p-6`=6px (intended 24px) → cramped |
| fontSize | only `11,12,13,14,15,16,20,24,32` | `text-sm/lg/xl/2xl/xs/base` → NO css |
| borderRadius | `0..96`→`{N}px` + `full` | `rounded-sm/md/lg/xl/2xl` → NO css |
| lineHeight | only `1,2,base` | `leading-tight/none/5/6/relaxed` → NO css |
| colors | custom palette | `emerald/rose/...` → NO css |

## SPACING — multiply default N by 4 → px. (prefixes: m,mt,mr,mb,ml,mx,my,p,pt,pr,pb,pl,px,py,gap,gap-x,gap-y,space-x,space-y,w,h,min-w,min-h,size,inset,top,right,bottom,left,translate-x,translate-y; also negatives `-mt-` etc.)
If N*4 ≤ 96 → `{util}-{N*4}` ; else → `{util}-[{N*4}px]`
```
0.5→2  1→4  1.5→6  2→8  2.5→10  3→12  3.5→14  4→16  5→20  6→24  7→28  8→32
9→36  10→40  11→44  12→48  14→56  16→64  20→80  24→96
28→[112px] 32→[128px] 36→[144px] 40→[160px] 44→[176px] 48→[192px] 52→[208px]
56→[224px] 60→[240px] 64→[256px] 72→[288px] 80→[320px] 96→[384px]
```
DO NOT touch: `w-full w-fit w-auto w-screen h-full h-screen h-auto inset-0 top-0 *-px` (0/px/full/auto/fit/screen already valid). `max-w-3xl/5xl/md/lg` etc = maxWidth scale (NOT overridden) → keep. `grid-cols-*`, `z-*`, `opacity-*`, `border-2`, `duration-*`, `col-span-*` → NOT spacing, keep.

## FONT SIZE
```
text-xs→text-12  text-sm→text-14  text-base→text-16  text-lg→text-[18px]
text-xl→text-20  text-2xl→text-24  text-3xl→text-[30px]
```
Arbitrary like `text-[28px]` → keep. Color classes `text-white/text-gray-400/text-blue-400` → NOT fontSize, keep.

## BORDER RADIUS
```
rounded→rounded-4  rounded-sm→rounded-2  rounded-md→rounded-6  rounded-lg→rounded-8
rounded-xl→rounded-12  rounded-2xl→rounded-16  rounded-3xl→rounded-24  rounded-full→keep
rounded-t-xl→rounded-t-12 (same per-side)
```

## LINE HEIGHT (only if present)
```
leading-none→leading-1  leading-tight/snug/normal→remove (inherit) or leading-base
leading-5/6/7→leading-[20px]/[24px]/[28px]  leading-relaxed→leading-base
```

## COLORS — GMX palette only. Available: blue(100-700) cold-blue slate(100-950) gray(50-950) yellow(300/500/900) red(100-900) green(100-900) white black + semantic typography/fill/stroke/button.
Map nonexistent → nearest GMX:
```
emerald-300→green-300  emerald-400→green-400  emerald-500→green-500
emerald-500/15→green-500/15  emerald-400/70→green-400/70  emerald-300/.. keep /opacity
rose-300→red-400  rose-400→red-400  rose-500→red-500  rose-500/15→red-500/15  rose-400/70→red-400/70
amber/orange→yellow-500  indigo/violet/purple→blue-400  teal/cyan/sky→blue-300  pink→red-400  lime→green-400
```
Keep existing valid: blue-*, yellow-*, gray-*, slate-*, green-*, red-*, white, black, and arbitrary `[#hex]`.
Prefer GMX semantic tokens where it reads as body text: secondary text → `text-slate-100` (=#a0a3c4) is the GMX muted token (equivalent to the gray-400 usage). Leave gray-400/500 as-is if already used; do not over-refactor.

## NOTES
- Arbitrary values `[...]` already render — keep unless they hardcode a near-slate hex that should be a token (optional, low priority).
- Verify with `yarn tsc` (no type impact expected; pure className strings).
