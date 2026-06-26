type Props = {
    children: React.ReactNode;
};

export default function DataTable({
    children,
}: Props) {
    return (
        <div
            className="
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-sm
            "
        >
            {children}
        </div>
    );
}