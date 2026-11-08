type Props = {
    children: React.ReactNode;
};

export default function DataTable({
    children,
}: Props) {
    return (
        <div
            className="
                overflow-x-auto
                rounded-2xl
                border
                border-[#e1e5df]
                bg-white
                shadow-[0_1px_2px_rgba(25,42,33,0.03)]
            "
        >
            {children}
        </div>
    );
}
