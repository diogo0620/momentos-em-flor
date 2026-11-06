export type AdminUserList = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

export type UserRole = "ADMIN" | "FLORIST" | "CUSTOMER"