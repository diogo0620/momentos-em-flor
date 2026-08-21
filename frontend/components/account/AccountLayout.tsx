import AccountSidebar from "./AccountSidebar";
import AccountTopBar from "./AccountTopBar";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8F9F6]">

            <AccountTopBar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

                    <AccountSidebar />

                    <section className="min-w-0 flex-1">
                        {children}
                    </section>

                </div>

            </main>

        </div>
    );
}