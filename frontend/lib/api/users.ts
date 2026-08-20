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

export type CreateUserData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
    role: "SYSTEM_ADMIN" | "FLORIST" | "CUSTOMER";
    floristId?: number;
};

export async function createUser(
    data: CreateUserData,
) {
    return apiFetch<{
        success: boolean;
        data: User;
    }>("/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getUser(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: User;
    }>(`/users/${id}`);
}