import type { ReactionType } from "../../generated/prisma/client.ts";
import prisma from "../config/prisma.ts";

export async function findUserReaction(experienceId: number, userId: number) {
    return prisma.experienceReaction.findUnique({
        where: {
            experienceId_userId: { experienceId, userId },
        },
    });
}

export async function createReaction(experienceId: number, userId: number, type: ReactionType) {
    return prisma.experienceReaction.create({
        data: { experienceId, userId, type },
    });
}

export async function updateReaction(id: number, type: ReactionType) {
    return prisma.experienceReaction.update({
        where: { id },
        data: { type },
    });
}

export async function deleteReaction(id: number) {
    return prisma.experienceReaction.delete({ where: { id } });
}

export async function countReactionsByExperienceIds(experienceIds: number[]) {
    if (experienceIds.length === 0) return [];

    return prisma.experienceReaction.groupBy({
        by: ["experienceId", "type"],
        where: { experienceId: { in: experienceIds } },
        _count: { _all: true },
    });
}

export async function findUserReactionsByExperienceIds(userId: number, experienceIds: number[]) {
    if (experienceIds.length === 0) return [];

    return prisma.experienceReaction.findMany({
        where: {
            userId,
            experienceId: { in: experienceIds },
        },
    });
}
