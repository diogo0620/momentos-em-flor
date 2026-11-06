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
};
