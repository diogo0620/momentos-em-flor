"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/ui/cn";
import {
    isNavigationItemActive,
    type NavigationItem,
} from "./navigation";

export default function AreaNavigation({
    items,
    onNavigate,
    compact = false,
}: {
    items: NavigationItem[];
    onNavigate?: () => void;
    compact?: boolean;
}) {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Navegação principal"
            className={cn(
                compact ? "flex gap-1 overflow-x-auto" : "space-y-1.5",
            )}
        >
            {items.map((item) => {
                const Icon = item.icon;
                const active = isNavigationItemActive(pathname, item);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                            !compact && "w-full",
                            active
                                ? "bg-[#e8eee8] text-[#203128]"
                                : "text-[#657067] hover:bg-[#f2f5f1] hover:text-[#203128]",
                        )}
                    >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{item.label}</span>
                        {active && !compact && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#52705d]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
