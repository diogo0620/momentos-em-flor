export type AdminCreateUser = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    active: boolean;
    floristId?: number;
}

export type UserRole = "ADMIN" | "FLORIST" | "CUSTOMER"
