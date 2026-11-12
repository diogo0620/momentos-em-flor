export type AdminCreateUser = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    active: boolean;
    floristId?: number;
    moloniId?: number | null;
}

export type UserRole = "SYSTEM_ADMIN" | "FLORIST" | "CUSTOMER"
