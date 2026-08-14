import { apiFetch } from "@/lib/api/client";

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role:
        | "CUSTOMER"
        | "SYSTEM_ADMIN"
        | "FLORIST";
};

export type ChangePasswordData = {
    currentPassword: string;
    newPassword: string;
};

export async function getMe() {
    return apiFetch<{
        success: boolean;
        data: User;
    }>("/users/me");
}

export async function changePassword(
    data: ChangePasswordData,
) {
    return apiFetch<{
        success: boolean;
        data: unknown;
    }>("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}