"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import {
  isNavigationItemActive,
  type NavigationItem,
  type NavigationGroup,
} from "./navigation";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");

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
  const searchId = useId();
  const [search, setSearch] = useState("");
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
          "group flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
          !compact && "w-full",
          active
            ? "bg-[#294637] font-semibold text-white shadow-sm"
            : "font-medium text-[#59665d] hover:bg-[#edf1eb] hover:text-[#213d2d]",
        )}
      >
        <Icon
          size={17}
          strokeWidth={active ? 2 : 1.6}
          className="shrink-0"
          aria-hidden="true"
        />
        <span>{item.label}</span>
        {active && !compact && (
          <span
            aria-hidden="true"
            className="ml-auto h-1 w-1 rounded-full bg-[#d6dec8]"
          />
        )}
      </Link>
    );
  };
  if (groups && !compact) {
    const query = normalize(search.trim());
    const filtered = groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !query || normalize(item.label + " " + group.label).includes(query),
        ),
      }))
      .filter((group) => group.items.length);
    return (
      <div>
        <div className="relative mb-5">
          <label htmlFor={searchId} className="sr-only">
            Procurar no menu
          </label>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 text-[#7b887c]"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar no menu…"
            className="h-10 w-full rounded-lg border border-[#e0e6dc] bg-[#f5f7f2] pl-9 pr-9 text-xs text-[#294637] outline-none focus:border-[#70826b] [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => setSearch("")}
              className="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-[#59665d]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <nav aria-label="Navegação da administração" className="space-y-4">
          {filtered.map((group) => (
            <section key={group.id} aria-label={group.label}>
              {group.collapsible !== false && (
                <h2 className="mb-1.5 px-3 font-sans text-[10px] font-semibold uppercase tracking-[.13em] text-[#73816f]">
                  {group.label}
                </h2>
              )}
              <div className="space-y-0.5">{group.items.map(renderItem)}</div>
            </section>
          ))}
        </nav>
        {!filtered.length && (
          <p
            role="status"
            className="px-3 py-5 text-xs leading-5 text-[#59665d]"
          >
            Nenhuma opção encontrada.
          </p>
        )}
      </div>
    );
  }
  return (
    <nav
      aria-label="Navegação principal"
      className={cn(compact ? "flex gap-1 overflow-x-auto" : "space-y-1.5")}
    >
      {items.map(renderItem)}
    </nav>
  );
}
