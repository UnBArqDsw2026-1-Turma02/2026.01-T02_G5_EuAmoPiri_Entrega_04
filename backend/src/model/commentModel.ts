import prisma from "../config/prisma.ts";

const commentInclude = {
    user: { select: { id: true, name: true } },
    experience: {
        select: {
            id: true,
            placeId: true,
            title: true,
            place: { select: { id: true, name: true } },
        },
    },
};

export async function createComment(experienceId: number, userId: number, text: string) {
    return prisma.experienceComment.create({
        data: {
            text,
            experience: { connect: { id: experienceId } },
            user: { connect: { id: userId } },
        },
        include: commentInclude,
    });
}

export async function findCommentsByExperienceId(experienceId: number) {
    return prisma.experienceComment.findMany({
        where: { experienceId },
        include: commentInclude,
        orderBy: { createdAt: "asc" },
    });
}

export async function countCommentsByExperienceIds(experienceIds: number[]) {
    if (experienceIds.length === 0) return [];

    return prisma.experienceComment.groupBy({
        by: ["experienceId"],
        where: { experienceId: { in: experienceIds } },
        _count: { _all: true },
    });
}
