export type UserRole =
    | "CUSTOMER"
    | "SYSTEM_ADMIN"
    | "FLORIST";

export interface AuthenticatedUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export interface LoginResponse {
    accessToken: string;
    user: AuthenticatedUser;
}