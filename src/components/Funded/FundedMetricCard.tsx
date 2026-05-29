import cx from "classnames";

export function FundedMetricCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-16 py-14">
      <div className="text-caption">{label}</div>
      <div
        className={cx("mt-10 text-20 font-medium numbers", {
          "text-typography-primary": tone === "default",
          "text-green-500": tone === "positive",
          "text-red-500": tone === "negative",
        })}
      >
        {value}
      </div>
      {helper ? <div className="mt-6 text-13 text-typography-secondary">{helper}</div> : null}
    </div>
  );
}
