export type AdminUserDetail = {
    moloniId?: string | null;
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
    updatedAt: Date
}

export type UserFlorist = {
    id: number;
    name: string;
}

export type UserRole = "SYSTEM_ADMIN" | "FLORIST" | "CUSTOMER"
