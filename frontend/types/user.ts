export type UserRole =
    | "SYSTEM_ADMIN"
    | "FLORIST"
    | "CUSTOMER";

export type UserFlorist = {
    id: number;
    name: string;
};

export type User = {
    id: number;

    firstName: string;
    lastName: string;

    email: string;
    phone?: string | null;
    avatarUrl?: string | null;

    role: UserRole;

    active: boolean;
    emailVerified: boolean;

    florist: UserFlorist | null;

    lastLoginAt?: string | null;

    createdAt: string;
    updatedAt: string;
};