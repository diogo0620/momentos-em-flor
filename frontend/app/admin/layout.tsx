import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#F5F7F2]">

            {/* SIDEBAR */}

            <AdminSidebar />

            {/* CONTENT */}

            <div className="flex flex-1 flex-col overflow-hidden">

                {/* TOPBAR */}

                <AdminTopbar />

                {/* PAGE */}

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        px-10
                        py-8
                    "
                >
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>

            </div>

        </div>
    );
}