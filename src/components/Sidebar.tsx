"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconArrowLeftRight,
  IconBlocks,
  IconFlask,
  IconGraduation,
  IconLayoutDashboard,
  IconPickaxe,
  IconWallet,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  ready: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard, ready: true },
  { href: "/explorer", label: "Explorer", icon: IconBlocks, ready: true },
  { href: "/transactions", label: "Transactions", icon: IconArrowLeftRight, ready: true },
  { href: "/mining", label: "Mining", icon: IconPickaxe, ready: true },
  { href: "/wallet", label: "Wallet", icon: IconWallet, ready: true },
  { href: "/simulator", label: "Simulator", icon: IconFlask, ready: true },
  { href: "/learn", label: "Learn", icon: IconGraduation, ready: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[var(--panel)] md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-sm font-semibold tracking-tight text-cyan-300 ring-1 ring-cyan-400/30">
          BL
        </div>
        <div>
          <p className="text-sm font-semibold text-white">BlockLearn</p>
          <p className="text-xs text-slate-400">Explorer</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-fit items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                active
                  ? "bg-white/10 text-white ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {!item.ready && (
                <span className="ml-auto hidden rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 md:inline">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <p className="hidden px-5 pb-5 text-xs leading-relaxed text-slate-500 md:block">
        Live data from the BlockLearn engine. No mock chain.
      </p>
    </aside>
  );
}
