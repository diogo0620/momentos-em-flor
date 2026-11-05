import { apiFetch } from "../common/client";

export const passwordRecoveryApi = {
    forgotPassword(email: string): Promise<void> {
        return apiFetch<void>("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
            skipRefresh: true,
        });
    },

    resetPassword(token: string, newPassword: string): Promise<void> {
        return apiFetch<void>("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, newPassword }),
            skipRefresh: true,
        });
    },
};
