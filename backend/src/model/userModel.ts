import prisma from "../config/prisma.ts";
import type { AccountType, User } from "../../generated/prisma/client.ts";
import type { UserUncheckedCreateInput, UserUncheckedUpdateInput } from "../../generated/prisma/models/User.ts";

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

export async function updateUser(id: number, data: UserUncheckedUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
}

export async function findByIdForDeletion(id: number) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            places: {
                include: {
                    photos: true,
                    experiences: { include: { photos: true } },
                },
            },
            experiences: { include: { photos: true } },
        },
    });
}

export async function deleteUser(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
}

export type { AccountType };
