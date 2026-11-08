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
        min-w-[720px]
        items-center
        border-b
        border-[#e8ebe7]
        px-6
        py-5
        transition-all
        duration-200
        hover:bg-[#f7f9f6]
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
