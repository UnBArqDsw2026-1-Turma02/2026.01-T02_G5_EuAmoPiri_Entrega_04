import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): string | null {
    if (password.length < 8) {
        return "Senha deve ter no mínimo 8 caracteres";
    }
    if (!/[A-Z]/.test(password)) {
        return "Senha deve conter letras maiúsculas (A-Z)";
    }
    if (!/[a-z]/.test(password)) {
        return "Senha deve conter letras minúsculas (a-z)";
    }
    if (!/[0-9]/.test(password)) {
        return "Senha deve conter números (0-9)";
    }
    return null;
}
