"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/ui/cn";
import {
    isNavigationItemActive,
    type NavigationItem,
    type NavigationGroup,
} from "./navigation";

export default function AreaNavigation({
    items,
    onNavigate,
    compact = false,
    groups,
}: {
    items: NavigationItem[];
    onNavigate?: () => void;
    compact?: boolean;
    groups?: NavigationGroup[];
}) {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries((groups ?? []).map((group) => [group.id, Boolean(group.defaultOpen)])),
    );

    useEffect(() => {
        const activeGroup = groups?.find((group) =>
            group.items.some((item) => isNavigationItemActive(pathname, item)),
        );
        if (activeGroup) {
            setOpenGroups((current) => ({ ...current, [activeGroup.id]: true }));
        }
    }, [groups, pathname]);

    const renderItem = (item: NavigationItem) => {
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
                    active ? "bg-[#e8eee8] text-[#203128]" : "text-[#657067] hover:bg-[#f2f5f1] hover:text-[#203128]",
                )}
            >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {active && !compact && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#52705d]" />}
            </Link>
        );
    };

    if (groups && !compact) {
        return (
            <nav aria-label="Navegação principal" className="space-y-2">
                {groups.map((group) => {
                    if (group.collapsible === false) {
                        return <div key={group.id}>{group.items.map(renderItem)}</div>;
                    }
                    const open = Boolean(openGroups[group.id]);
                    const active = group.items.some((item) => isNavigationItemActive(pathname, item));
                    return <section key={group.id} className="rounded-xl">
                        <button
                            type="button"
                            onClick={() => setOpenGroups((current) => ({ ...current, [group.id]: !open }))}
                            aria-expanded={open}
                            className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition", active ? "text-[#3f5948]" : "text-[#929b94] hover:text-[#657067]")}
                        >
                            {group.label}
                            <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
                        </button>
                        {open && <div className="mt-1 space-y-1">{group.items.map(renderItem)}</div>}
                    </section>;
                })}
            </nav>
        );
    }

    return (
        <nav
            aria-label="Navegação principal"
            className={cn(
                compact ? "flex gap-1 overflow-x-auto" : "space-y-1.5",
            )}
        >
            {items.map(renderItem)}
        </nav>
    );
}
