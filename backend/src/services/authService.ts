import type { AccountType, User } from "../../generated/prisma/client.ts";
import * as userModel from "../model/userModel.ts";
import { hashPassword, validatePasswordStrength } from "../utils/password.ts";
import { signToken } from "../utils/jwt.ts";
import { formatAuthResponse } from "../views/userView.ts";

export class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "AuthError";
    }
}

export interface RegisterInput {
    accountType: AccountType;
    name: string;
    email: string;
    birthDate: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

function validateRegisterInput(input: RegisterInput): void {
    if (!input.accountType || !["TURISTA", "MORADOR"].includes(input.accountType)) {
        throw new AuthError("Tipo de conta inválido", 400);
    }
    if (!input.name?.trim()) {
        throw new AuthError("Nome é obrigatório", 400);
    }
    if (!input.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        throw new AuthError("Email inválido", 400);
    }
    if (!input.birthDate) {
        throw new AuthError("Data de nascimento é obrigatória", 400);
    }
    if (!input.phone?.trim()) {
        throw new AuthError("Telefone é obrigatório", 400);
    }
    if (input.password !== input.confirmPassword) {
        throw new AuthError("Senhas não coincidem", 400);
    }
    const passwordError = validatePasswordStrength(input.password);
    if (passwordError) {
        throw new AuthError(passwordError, 400);
    }
}

export async function registerUser(input: RegisterInput) {
    validateRegisterInput(input);

    const existing = await userModel.findByEmail(input.email.toLowerCase());
    if (existing) {
        throw new AuthError("Email já cadastrado", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userModel.createUser({
        accountType: input.accountType,
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        birthDate: new Date(input.birthDate),
        phone: input.phone.trim(),
        passwordHash,
    });

    const token = signToken(user.id, user.email);
    return { ...formatAuthResponse(user, token), isNewUser: true };
}

export function issueTokenForUser(user: User) {
    const token = signToken(user.id, user.email);
    return formatAuthResponse(user, token);
}
