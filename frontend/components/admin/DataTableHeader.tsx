type Props = {
    children: React.ReactNode;
};

export default function DataTableHeader({
    children,
}: Props) {
    return (
        <div
            className="
                border-b
                bg-[#F8F9F5]
            "
        >
            {children}
        </div>
    );
}