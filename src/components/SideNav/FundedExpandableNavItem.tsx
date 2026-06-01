import { t } from "@lingui/macro";
import cx from "classnames";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { FUNDED_ROUTES } from "config/funded";

import ChevronDownIcon from "img/ic_chevron_down.svg?react";
import ChevronRightIcon from "img/ic_chevron_right.svg?react";
import StarIcon from "img/ic_star.svg?react";

import { NavItem } from "./SideNav";

interface Props {
  isCollapsed: boolean | undefined;
  onMenuItemClick?: () => void;
}

const ACTIVE_ITEM_CLASS = "bg-blue-400/20 !text-blue-400 dark:bg-slate-700 dark:!text-typography-primary";
const HOVER_CLASS =
  "group-hover:bg-blue-400/20 group-hover:text-blue-400 dark:group-hover:bg-slate-700 dark:group-hover:text-typography-primary";

export function FundedExpandableNavItem({ isCollapsed, onMenuItemClick }: Props) {
  const { pathname } = useLocation();
  const isFundedRoute = pathname.startsWith("/funded");
  const [isExpanded, setIsExpanded] = useState(() => isFundedRoute);

  // Auto-expand when navigating to a funded route
  useEffect(() => {
    if (isFundedRoute) setIsExpanded(true);
  }, [isFundedRoute]);

  // When sidebar is collapsed: behave as a regular nav item linking to My Journeys
  if (isCollapsed) {
    return (
      <NavItem
        icon={<StarIcon className="size-20" />}
        label={t`FUNDED`}
        isActive={isFundedRoute}
        isCollapsed={isCollapsed}
        to={FUNDED_ROUTES.startJourney}
        onClick={onMenuItemClick}
      />
    );
  }

  const subItems = [
    { label: t`Start Journey`, to: FUNDED_ROUTES.startJourney },
    { label: t`My Journeys`, to: FUNDED_ROUTES.myJourneys },
    { label: t`Journey Dashboard`, to: FUNDED_ROUTES.challengeDashboard },
  ];

  return (
    <li className="p-0 first:-mt-4">
      {/* Parent toggle button */}
      <button
        type="button"
        className="group w-full cursor-pointer select-none py-1"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div
          className={cx(
            "relative flex w-full cursor-pointer items-center gap-8 rounded-8 px-12 py-10 text-typography-secondary",
            HOVER_CLASS,
            { [ACTIVE_ITEM_CLASS]: isFundedRoute }
          )}
        >
          <div className="flex size-20 shrink-0 items-center justify-center [&>svg]:w-full">
            <StarIcon className="size-20" />
          </div>
          <span className="text-body-medium font-medium tracking-[-1.2%]">{t`FUNDED`}</span>
          <div className="ml-auto flex size-16 shrink-0 items-center justify-center">
            {isExpanded ? <ChevronDownIcon className="size-12" /> : <ChevronRightIcon className="size-12" />}
          </div>
        </div>
      </button>

      {/* Sub-items */}
      {isExpanded && (
        <ul className="mt-1 list-none pl-8">
          {subItems.map((item) => (
            <li key={item.to} className="p-0">
              <Link to={item.to} onClick={onMenuItemClick}>
                <button type="button" className="group w-full cursor-pointer select-none py-1">
                  <div
                    className={cx(
                      "flex w-full items-center gap-8 rounded-8 px-12 py-8 text-typography-secondary",
                      HOVER_CLASS,
                      { [ACTIVE_ITEM_CLASS]: pathname === item.to }
                    )}
                  >
                    <div className="ml-4 size-4 shrink-0 rounded-full bg-current opacity-50" />
                    <span className="text-body-medium font-medium tracking-[-1.2%]">{item.label}</span>
                  </div>
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
