import cx from "classnames";
import { useHistory, useLocation } from "react-router-dom";

import { FUNDED_ROUTES } from "config/funded";

const tabs = [
  { to: FUNDED_ROUTES.startJourney, label: "Start Journey" },
  { to: FUNDED_ROUTES.challengeDashboard, label: "Challenge Dashboard" },
];

export function FundedPageTabs({ activePath }: { activePath: string }) {
  const history = useHistory();
  const { search } = useLocation();

  return (
    <div className="flex flex-wrap gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.to}
          type="button"
          onClick={() => history.push({ pathname: tab.to, search })}
          className={cx(
            "rounded-8 border px-12 py-8 text-[13px] font-medium transition-colors",
            activePath === tab.to
              ? "border-blue-300 bg-blue-300/20 text-typography-primary"
              : "border-slate-600 bg-slate-900 text-typography-secondary hover:text-typography-primary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
