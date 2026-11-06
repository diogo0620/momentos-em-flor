"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/auth/types";
import { getRedirectPath } from "@/lib/auth/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export default function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const router = useRouter();

    const {
        user,
        isAuthenticated,
        isLoading,
    } = useAuth();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            router.replace(getRedirectPath(user));
        }
    }, [
        user,
        isAuthenticated,
        isLoading,
        allowedRoles,
        router,
    ]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F7F2]">
                <p className="text-sm text-gray-500">
                    A carregar...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}