import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function FloristLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["FLORIST"]}>
            <WorkspaceShell area="florist">
                {children}
            </WorkspaceShell>
        </ProtectedRoute>
    );
}
