export type AdminUserDetail = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: UserRole;
    active: boolean;
    emailVerified: boolean;
    florist?: UserFlorist | null;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updateAt: Date
}

export type UserFlorist = {
    id: number;
    name: string;
}

export type UserRole = "ADMIN" | "FLORIST" | "CUSTOMER"
