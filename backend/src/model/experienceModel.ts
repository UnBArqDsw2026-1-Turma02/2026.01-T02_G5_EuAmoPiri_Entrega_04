import type { Prisma } from "../../generated/prisma/client.ts";
import prisma from "../config/prisma.ts";

const experienceInclude = {
    photos: { orderBy: { sortOrder: "asc" as const } },
};

export async function createExperienceWithPhotos(
    data: Prisma.ExperiencesCreateInput,
    photos: { url: string; sortOrder: number }[]
) {
    return prisma.experiences.create({
        data: {
            ...data,
            ...(photos.length > 0 ? { photos: { create: photos } } : {}),
        },
        include: experienceInclude,
    });
}

export async function findAllExperiencesByPlaceId(placeId: number) {
    return prisma.experiences.findMany({
        where: { placeId },
        include: experienceInclude,
        orderBy: { createdAt: "desc" },
    });
}

export async function findExperiencesByUserId(userId: number) {
    return prisma.experiences.findMany({
        where: { userId },
        include: {
            ...experienceInclude,
            place: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function findExperiencePhotoById(experienceId: number, photoId: number) {
    return prisma.experiencePhoto.findFirst({
        where: { id: photoId, experienceId },
    });
}

export async function findExperienceById(experienceId: number) {
    return prisma.experiences.findUnique({
        where: { id: experienceId },
        include: {
            ...experienceInclude,
            place: { select: { id: true, name: true } },
        },
    });
}

export async function updateExperienceById(id: number, data: Prisma.ExperiencesUpdateInput) {
    return prisma.experiences.update({
        where: { id },
        data,
        include: experienceInclude,
    });
}

export async function deleteExperienceById(id: number) {
    return prisma.experiences.delete({ where: { id } });
}

export async function replaceExperiencePhotos(
    experienceId: number,
    photos: { url: string; sortOrder: number }[]
) {
    await prisma.experiencePhoto.deleteMany({ where: { experienceId } });
    if (photos.length > 0) {
        await prisma.experiencePhoto.createMany({
            data: photos.map((p) => ({ ...p, experienceId })),
        });
    }
}

export async function findPlaceById(placeId: number) {
    return prisma.place.findUnique({ where: { id: placeId } });
}
