type Props = {
    children: React.ReactNode;
};

export default function DataTableHeader({
    children,
}: Props) {
    return (
        <div
            className="
                min-w-[720px]
                border-b border-[#e1e5df]
                bg-[#f5f7f4]
            "
        >
            {children}
        </div>
    );
}
