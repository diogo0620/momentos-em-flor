type Props = {
    title?: string;
    children: React.ReactNode;
};

export default function SectionCard({
    title,
    children,
}: Props) {
    return (
        <section className="rounded-2xl border border-[#e1e5df] bg-white p-5 shadow-[0_1px_2px_rgba(25,42,33,0.03)] sm:p-7">

            {title && (
                <h2 className="mb-6 text-xl font-semibold tracking-tight text-[#203128]">
                    {title}
                </h2>
            )}

            {children}

        </section>
    );
}
