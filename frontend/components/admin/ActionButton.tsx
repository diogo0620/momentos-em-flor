import Link from "next/link";
import { LucideIcon } from "lucide-react";

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
            className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#55624A]
                px-5
                py-3
                font-medium
                text-white
                transition-all
                duration-200
                hover:scale-[1.02]
                hover:shadow-lg
            "
        >
            {Icon && <Icon size={18} />}

            {children}
        </Link>
    );
}