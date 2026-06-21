import type { PlaceCategory, Prisma } from "../../generated/prisma/client.ts";
import prisma from "../config/prisma.ts";

const placeInclude = {
    photos: { orderBy: { sortOrder: "asc" as const } },
    morador: { select: { id: true, name: true } },
    experiences: { select: { rating: true } },
};

export async function createPlaceWithPhotos(
    data: Prisma.PlaceCreateInput,
    photos: { url: string; sortOrder: number }[]
) {
    return prisma.place.create({
        data: {
            ...data,
            photos: { create: photos },
        },
        include: placeInclude,
    });
}

export async function findAllPlaces() {
    return prisma.place.findMany({
        include: placeInclude,
        orderBy: { createdAt: "desc" },
    });
}

export async function findPlaceById(id: number) {
    return prisma.place.findUnique({
        where: { id },
        include: placeInclude,
    });
}

export async function findPlacesByMoradorId(moradorId: number) {
    return prisma.place.findMany({
        where: { moradorId },
        include: placeInclude,
        orderBy: { createdAt: "desc" },
    });
}

export async function findDuplicatePlace(name: string, address: string, excludeId?: number) {
    const normalizedName = name.trim().toLowerCase();
    const normalizedAddress = address.trim().toLowerCase();
    const places = await prisma.place.findMany({
        select: { id: true, name: true, address: true },
    });
    return (
        places.find(
            (p) =>
                p.id !== excludeId &&
                p.name.trim().toLowerCase() === normalizedName &&
                p.address.trim().toLowerCase() === normalizedAddress
        ) ?? null
    );
}

export async function updatePlaceById(id: number, data: Prisma.PlaceUpdateInput) {
    return prisma.place.update({
        where: { id },
        data,
        include: placeInclude,
    });
}

export async function deletePlaceById(id: number) {
    return prisma.place.delete({ where: { id } });
}

export async function replacePlacePhotos(placeId: number, photos: { url: string; sortOrder: number }[]) {
    await prisma.placePhoto.deleteMany({ where: { placeId } });
    if (photos.length > 0) {
        await prisma.placePhoto.createMany({
            data: photos.map((p) => ({ ...p, placeId })),
        });
    }
}

export async function findPlacePhotoById(placeId: number, photoId: number) {
    return prisma.placePhoto.findFirst({
        where: { id: photoId, placeId },
    });
}

export function parsePlaceCategory(value: string): PlaceCategory | null {
    const upper = value.trim().toUpperCase();
    if (upper === "CACHOEIRA") return "CACHOEIRA";
    if (upper === "RESTAURANTE") return "RESTAURANTE";
    if (upper === "POUSADA") return "POUSADA";
    return null;
}

export interface GoogleSyncedPlaceInput {
    googlePlaceId: string;
    name: string;
    category: PlaceCategory;
    description: string;
    address: string;
    mapsLink: string;
    latitude: number;
    longitude: number;
    externalPhotoUrl: string | null;
    googleRating: number | null;
    googleReviewCount: number;
}

export async function upsertGoogleSyncedPlace(input: GoogleSyncedPlaceInput) {
    return prisma.place.upsert({
        where: { googlePlaceId: input.googlePlaceId },
        create: {
            name: input.name,
            category: input.category,
            description: input.description,
            address: input.address,
            mapsLink: input.mapsLink,
            latitude: input.latitude,
            longitude: input.longitude,
            externalPhotoUrl: input.externalPhotoUrl,
            googleRating: input.googleRating,
            googleReviewCount: input.googleReviewCount,
            googlePlaceId: input.googlePlaceId,
            source: "GOOGLE",
            moradorId: null,
        },
        update: {
            name: input.name,
            category: input.category,
            description: input.description,
            address: input.address,
            mapsLink: input.mapsLink,
            latitude: input.latitude,
            longitude: input.longitude,
            externalPhotoUrl: input.externalPhotoUrl,
            googleRating: input.googleRating,
            googleReviewCount: input.googleReviewCount,
        },
        include: placeInclude,
    });
}
