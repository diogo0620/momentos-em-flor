import Link from "next/link";

type LegalPageProps = {
    eyebrow: string;
    title: string;
    intro: string;
    children: React.ReactNode;
};

export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
    return (
        <div className="bg-[#F8F9F5] px-4 py-10 sm:px-6 sm:py-16">
            <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[#E3E7DE] bg-white shadow-[0_18px_60px_rgba(47,59,42,0.07)]">
                <header className="bg-[#2F3B2A] px-6 py-10 text-white sm:px-10 sm:py-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D6DEC8]">{eyebrow}</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{intro}</p>
                </header>
                <div className="legal-content px-6 py-9 text-sm leading-7 text-[#626B5D] sm:px-10 sm:py-12">
                    {children}
                </div>
                <footer className="border-t border-[#E8EBE4] bg-[#FAFBF8] px-6 py-5 text-sm sm:px-10">
                    <Link href="/" className="font-semibold text-[#55624A] hover:text-[#2F3B2A]">← Voltar à loja</Link>
                </footer>
            </article>
        </div>
    );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-9 last:mb-0">
            <h2 className="mb-3 text-xl font-bold text-[#2F3B2A]">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
