import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-12">

            <div className="mb-10">

                <p className="text-sm font-medium text-[#55624A]">
                    A minha conta
                </p>

                <h1 className="mt-2 text-4xl font-bold text-[#2F3B2A]">
                    A minha conta
                </h1>

                <p className="mt-3 text-gray-500">
                    Gira a sua conta e consulte as suas encomendas.
                </p>

            </div>

            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

                <AccountSidebar />

                <main className="min-w-0">
                    {children}
                </main>

            </div>

        </div>
    );
}