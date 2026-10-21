import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    floristId: number | null;
}