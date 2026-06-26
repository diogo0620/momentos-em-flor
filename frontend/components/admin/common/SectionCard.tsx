type Props = {
    title?: string;
    children: React.ReactNode;
};

export default function SectionCard({
    title,
    children,
}: Props) {
    return (
        <section className="rounded-3xl bg-white p-8 shadow-sm">

            {title && (
                <h2 className="mb-8 text-2xl font-bold text-[#2F3B2A]">
                    {title}
                </h2>
            )}

            {children}

        </section>
    );
}