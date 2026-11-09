import { apiFetch } from "../common/client";

export type PublicCreateUser = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
};

export const publicUsersApi = {
    create(data: PublicCreateUser): Promise<unknown> {
        return apiFetch("/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    verifyEmail(token: string): Promise<void> {
        return apiFetch("/users/verify-email", { method: "POST", body: JSON.stringify({ token }), skipRefresh: true });
    },
    resendVerification(email: string): Promise<void> {
        return apiFetch("/users/resend-verification", { method: "POST", body: JSON.stringify({ email }), skipRefresh: true });
    },
};
