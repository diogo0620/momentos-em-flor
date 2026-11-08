import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <WorkspaceShell area="admin">
                {children}
            </WorkspaceShell>
        </ProtectedRoute>
    );
}
