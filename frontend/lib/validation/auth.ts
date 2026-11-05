export const PASSWORD_REQUIREMENTS =
    "A password deve ter pelo menos 8 caracteres, incluindo uma maiúscula, uma minúscula, um número e um símbolo.";

export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
    return /^\+[1-9]\d{7,14}$/.test(value.trim());
}

export function validateStrongPassword(value: string): string | null {
    const isStrong =
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^A-Za-z0-9]/.test(value);

    return isStrong ? null : PASSWORD_REQUIREMENTS;
}
