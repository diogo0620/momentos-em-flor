type Props = {
    children: React.ReactNode;
};

export default function FilterBar({
    children,
}: Props) {
    return (
        <div className="rounded-2xl border border-[#e1e5df] bg-white p-4 shadow-[0_1px_2px_rgba(25,42,33,0.03)] sm:p-5">
            {children}
        </div>
    );
}
