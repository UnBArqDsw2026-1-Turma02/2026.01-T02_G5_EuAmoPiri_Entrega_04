import type { PlaceCategory } from "../../generated/prisma/client.ts";
import * as placeModel from "../model/placeModel.ts";
import * as storageService from "./storageService.ts";
import { buildPlacePhotoKey } from "../utils/storageKeys.ts";
import { validatePhotoFiles, PhotoValidationError } from "../utils/photoValidation.ts";

export class PlaceError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "PlaceError";
    }
}

export interface CreatePlaceInput {
    name: string;
    address: string;
    category: string;
    description: string;
    mapsLink?: string;
    phone?: string;
    openingDate?: string;
}

function normalizeOptional(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

function parseOpeningDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new PlaceError("Data de abertura inválida", 400);
    }
    return date;
}

export async function createPlace(
    moradorId: number,
    input: CreatePlaceInput,
    files: Express.Multer.File[]
) {
    const name = input.name?.trim();
    const address = input.address?.trim();
    const description = input.description?.trim();
    const category = placeModel.parsePlaceCategory(input.category ?? "");

    if (!name || !address || !description || !category) {
        throw new PlaceError("Nome, endereço, categoria e descrição são obrigatórios", 400);
    }

    try {
        validatePhotoFiles(files, { min: 1, max: 3 });
    } catch (err) {
        if (err instanceof PhotoValidationError) {
            throw new PlaceError(err.message, err.statusCode);
        }
        throw err;
    }

    const duplicate = await placeModel.findDuplicatePlace(name, address);
    if (duplicate) {
        throw new PlaceError("Cadastro já existente", 409, "PLACE_DUPLICATE");
    }

    const mapsLink = normalizeOptional(input.mapsLink);
    const phone = normalizeOptional(input.phone);
    const openingDate = parseOpeningDate(normalizeOptional(input.openingDate));

    const place = await placeModel.createPlaceWithPhotos(
        {
            name,
            address,
            category: category as PlaceCategory,
            description,
            ...(mapsLink !== undefined ? { mapsLink } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(openingDate !== undefined ? { openingDate } : {}),
            morador: { connect: { id: moradorId } },
        },
        []
    );

    const photoRecords: { url: string; sortOrder: number }[] = [];
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;
            const key = buildPlacePhotoKey(place.id, i, file.mimetype);
            await storageService.uploadBuffer(key, file.buffer, file.mimetype);
            photoRecords.push({ url: key, sortOrder: i });
        }
    } catch {
        for (const record of photoRecords) {
            await storageService.deleteObject(record.url).catch(() => {});
        }
        await placeModel.findPlaceById(place.id).then(async (p) => {
            if (p) {
                const prisma = (await import("../config/prisma.ts")).default;
                await prisma.place.delete({ where: { id: place.id } });
            }
        });
        throw new PlaceError("Erro ao salvar fotos do local", 500);
    }

    if (photoRecords.length > 0) {
        const prisma = (await import("../config/prisma.ts")).default;
        await prisma.placePhoto.createMany({
            data: photoRecords.map((p) => ({ ...p, placeId: place.id })),
        });
    }

    const full = await placeModel.findPlaceById(place.id);
    if (!full) throw new PlaceError("Erro ao cadastrar o local", 500);
    return full;
}

export async function getPlacePhotoStream(placeId: number, photoId: number) {
    const photo = await placeModel.findPlacePhotoById(placeId, photoId);
    if (!photo) return null;
    return {
        stream: storageService.getReadStream(photo.url),
        contentType: storageService.getContentTypeFromKey(photo.url),
    };
}

export async function listPlaces(moradorId?: number) {
    if (moradorId !== undefined) {
        return placeModel.findPlacesByMoradorId(moradorId);
    }
    return placeModel.findAllPlaces();
}

export async function getPlaceById(id: number) {
    return placeModel.findPlaceById(id);
}
