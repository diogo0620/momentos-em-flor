import Link from "next/link";

type Props = {
    href?: string;
    children: React.ReactNode;
};

export default function DataTableRow({
    href,
    children,
}: Props) {
    const className = `
        grid
        items-center
        border-b
        border-gray-100
        px-6
        py-5
        transition-all
        duration-200
        hover:bg-[#F8F9F5]
    `;

    if (href) {
        return (
            <Link
                href={href}
                className={className}
            >
                {children}
            </Link>
        );
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
}