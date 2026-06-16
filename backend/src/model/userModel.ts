import prisma from "../config/prisma.ts";
import type { AccountType, User } from "../../generated/prisma/client.ts";
import type { UserUncheckedCreateInput } from "../../generated/prisma/models/User.ts";

export async function findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
}

export async function findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { googleId } });
}

export async function findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({ data });
}

export async function updateUser(id: number, data: Partial<UserUncheckedCreateInput>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
}

export type { AccountType };
