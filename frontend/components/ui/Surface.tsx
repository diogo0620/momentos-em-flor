import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-[#e1e5df] bg-white shadow-[0_1px_2px_rgba(25,42,33,0.03)]",
                className,
            )}
            {...props}
        />
    );
}

export function PageHeading({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#78867b]">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-[#203128] sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d776f] sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </header>
    );
}
