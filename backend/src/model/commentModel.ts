import type { ContentStatus } from "../../generated/prisma/client.ts";
import prisma from "../config/prisma.ts";

const PUBLIC_STATUS_FILTER = { not: "HIDDEN" as ContentStatus };

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
        where: { experienceId, status: PUBLIC_STATUS_FILTER },
        include: commentInclude,
        orderBy: { createdAt: "asc" },
    });
}

export async function countCommentsByExperienceIds(experienceIds: number[]) {
    if (experienceIds.length === 0) return [];

    return prisma.experienceComment.groupBy({
        by: ["experienceId"],
        where: { experienceId: { in: experienceIds }, status: PUBLIC_STATUS_FILTER },
        _count: { _all: true },
    });
}

export async function findCommentById(commentId: number) {
    return prisma.experienceComment.findUnique({
        where: { id: commentId },
        include: commentInclude,
    });
}

export async function findCommentByIdAndExperienceId(commentId: number, experienceId: number) {
    return prisma.experienceComment.findFirst({
        where: { id: commentId, experienceId },
        include: commentInclude,
    });
}

export async function updateCommentStatus(id: number, status: ContentStatus) {
    return prisma.experienceComment.update({
        where: { id },
        data: { status },
        include: commentInclude,
    });
}

export async function findReportedComments() {
    return prisma.experienceComment.findMany({
        where: { status: "REPORTED" },
        include: {
            ...commentInclude,
            _count: { select: { reports: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
