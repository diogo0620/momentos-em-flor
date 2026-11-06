import FloristSidebar from "@/components/florist/FloristSidebar";
import FloristTopbar from "@/components/florist/FloristTopbar";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function FloristLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["FLORIST"]}>
            <div className="flex h-screen bg-[#F5F7F2]">

                {/* SIDEBAR */}

                <FloristSidebar />

                {/* CONTENT */}

                <div className="flex flex-1 flex-col overflow-hidden">

                    {/* TOPBAR */}

                    <FloristTopbar />

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
        </ProtectedRoute>
    );
}