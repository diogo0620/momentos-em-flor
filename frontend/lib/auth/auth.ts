import type { AuthenticatedUser } from "./types";

export function getRedirectPath(
    user: AuthenticatedUser,
) {
    switch (user.role) {
        case "SYSTEM_ADMIN":
            return "/admin";

        case "FLORIST":
            return "/florist";

        case "CUSTOMER":
        default:
            return "/";
    }
}