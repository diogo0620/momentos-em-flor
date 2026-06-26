type Props = {
    children: React.ReactNode;
};

export default function FilterBar({
    children,
}: Props) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            {children}
        </div>
    );
}