import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    floristId: number | null;
}