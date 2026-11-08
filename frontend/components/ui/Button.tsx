import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#26392f] text-white shadow-sm hover:bg-[#1d2d25]",
    secondary: "border border-[#dfe4dc] bg-white text-[#304139] hover:border-[#b9c4ba] hover:bg-[#f8faf7]",
    ghost: "text-[#5c6860] hover:bg-[#eef2ed] hover:text-[#26392f]",
    danger: "bg-[#a83f3f] text-white hover:bg-[#8f3333]",
};

const sizes: Record<ButtonSize, string> = {
    sm: "min-h-9 rounded-xl px-3.5 text-sm",
    md: "min-h-11 rounded-xl px-4 text-sm",
    lg: "min-h-12 rounded-2xl px-5 text-sm",
    icon: "h-11 w-11 rounded-xl",
};

export function buttonClassName({
    variant = "primary",
    size = "md",
    className,
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
} = {}) {
    return cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
    );
}

export function Button({
    variant,
    size,
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}) {
    return (
        <button
            className={buttonClassName({ variant, size, className })}
            {...props}
        />
    );
}

export function ButtonLink({
    href,
    children,
    variant,
    size,
    className,
}: {
    href: string;
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}) {
    return (
        <Link href={href} className={buttonClassName({ variant, size, className })}>
            {children}
        </Link>
    );
}
