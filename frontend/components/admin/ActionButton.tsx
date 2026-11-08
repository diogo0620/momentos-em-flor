import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

type Props = {
    href: string;
    children: React.ReactNode;
    icon?: LucideIcon;
};

export default function ActionButton({
    href,
    children,
    icon: Icon,
}: Props) {
    return (
        <Link
            href={href}
            className={buttonClassName({ size: "lg" })}
        >
            {Icon && <Icon size={18} />}

            {children}
        </Link>
    );
}
