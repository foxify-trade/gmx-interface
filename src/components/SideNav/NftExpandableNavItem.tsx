import { t } from "@lingui/macro";
import cx from "classnames";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { NFT_ROUTES } from "config/nft";

import ChevronDownIcon from "img/ic_chevron_down.svg?react";
import ChevronRightIcon from "img/ic_chevron_right.svg?react";
import NftIcon from "img/ic_star_gradient.svg?react";

import { NavItem } from "./SideNav";

interface Props {
  isCollapsed: boolean | undefined;
  onMenuItemClick?: () => void;
}

const ACTIVE_ITEM_CLASS = "bg-blue-400/20 !text-blue-400 dark:bg-slate-700 dark:!text-typography-primary";
const HOVER_CLASS =
  "group-hover:bg-blue-400/20 group-hover:text-blue-400 dark:group-hover:bg-slate-700 dark:group-hover:text-typography-primary";

export function NftExpandableNavItem({ isCollapsed, onMenuItemClick }: Props) {
  const { pathname } = useLocation();
  const isNftRoute = pathname.startsWith("/nft");
  const [isExpanded, setIsExpanded] = useState(() => isNftRoute);

  // Auto-expand when navigating to an NFT route
  useEffect(() => {
    if (isNftRoute) setIsExpanded(true);
  }, [isNftRoute]);

  // When sidebar is collapsed: behave as a regular nav item linking to NFT Management
  if (isCollapsed) {
    return (
      <NavItem
        icon={<NftIcon className="size-20" />}
        label={t`NFT`}
        isActive={isNftRoute}
        isCollapsed={isCollapsed}
        to={NFT_ROUTES.management}
        onClick={onMenuItemClick}
      />
    );
  }

  const subItems = [
    { label: t`NFT Management`, to: NFT_ROUTES.management },
    { label: t`Mint Eligibility`, to: NFT_ROUTES.eligibility },
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
            { [ACTIVE_ITEM_CLASS]: isNftRoute }
          )}
        >
          <div className="flex size-20 shrink-0 items-center justify-center [&>svg]:w-full">
            <NftIcon className="size-20" />
          </div>
          <span className="text-body-medium font-medium tracking-[-1.2%]">{t`NFT`}</span>
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
