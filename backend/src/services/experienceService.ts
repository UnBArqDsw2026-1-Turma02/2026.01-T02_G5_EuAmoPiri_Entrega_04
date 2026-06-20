import * as experienceModel from "../model/experienceModel.ts";
import * as storageService from "./storageService.ts";
import { buildExperiencePhotoKey } from "../utils/storageKeys.ts";
import { containsBlacklistedWord } from "../utils/blacklist.ts";
import { validatePhotoFiles, PhotoValidationError } from "../utils/photoValidation.ts";

const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_LENGTH = 2000;

export class ExperienceError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "ExperienceError";
    }
}

export interface CreateExperienceInput {
    rating: number;
    text: string;
    visitDate: string;
    title?: string;
}

function normalizeOptional(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

export async function validateExperienceInput(
    placeId: number,
    input: CreateExperienceInput,
    files: Express.Multer.File[]
) {
    const place = await experienceModel.findPlaceById(placeId);
    if (!place) {
        throw new ExperienceError("Local nÃ£o encontrado", 404);
    }

    const rating = Number(input.rating);
    const text = input.text?.trim() ?? "";
    const visitDateStr = input.visitDate?.trim();

    if (!rating || rating < 1 || rating > 5) {
        throw new ExperienceError("Selecione uma avaliaÃ§Ã£o entre 1 e 5 estrelas", 400);
    }

    if (!text) {
        throw new ExperienceError("O comentÃ¡rio nÃ£o pode estar vazio quando hÃ¡ avaliaÃ§Ã£o em estrelas", 400, "RNF01");
    }

    if (text.length < MIN_TEXT_LENGTH) {
        throw new ExperienceError(`O comentÃ¡rio deve ter no mÃ­nimo ${MIN_TEXT_LENGTH} caracteres`, 400, "MIN_TEXT_LENGTH");
    }

    if (text.length > MAX_TEXT_LENGTH) {
        throw new ExperienceError(`O comentÃ¡rio deve ter no mÃ¡ximo ${MAX_TEXT_LENGTH} caracteres`, 400, "RNF03");
    }

    if (containsBlacklistedWord(text)) {
        throw new ExperienceError("Revise o conteÃºdo e tente novamente, mantendo uma linguagem respeitosa.", 400, "BLACKLISTED_CONTENT");
    }

    if (!visitDateStr) {
        throw new ExperienceError("Data da visita Ã© obrigatÃ³ria", 400);
    }

    const visitDate = new Date(visitDateStr);
    if (Number.isNaN(visitDate.getTime())) {
        throw new ExperienceError("Data da visita invÃ¡lida", 400);
    }

    validatePhotoFiles(files, { min: 0, max: 3 });

    return { rating, text, visitDate, title: normalizeOptional(input.title) };
}

export async function createExperience(
    userId: number,
    userName: string,
    placeId: number,
    input: CreateExperienceInput,
    files: Express.Multer.File[]
) {
    const validated = await validateExperienceInput(placeId, input, files);

    const experience = await experienceModel.createExperienceWithPhotos(
        {
            userName,
            rating: validated.rating,
            text: validated.text,
            ...(validated.title !== undefined ? { title: validated.title } : {}),
            visitDate: validated.visitDate,
            place: { connect: { id: placeId } },
            user: { connect: { id: userId } },
        },
        []
    );

    const photoRecords: { url: string; sortOrder: number }[] = [];
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;
            const key = buildExperiencePhotoKey(experience.id, i, file.mimetype);
            await storageService.uploadBuffer(key, file.buffer, file.mimetype);
            photoRecords.push({ url: key, sortOrder: i });
        }
    } catch {
        for (const record of photoRecords) {
            await storageService.deleteObject(record.url).catch(() => {});
        }
        const prisma = (await import("../config/prisma.ts")).default;
        await prisma.experiences.delete({ where: { id: experience.id } });
        throw new ExperienceError("Erro ao salvar fotos do relato", 500);
    }

    if (photoRecords.length > 0) {
        const prisma = (await import("../config/prisma.ts")).default;
        await prisma.experiencePhoto.createMany({
            data: photoRecords.map((p) => ({ ...p, experienceId: experience.id })),
        });
    }

    const list = await experienceModel.findAllExperiencesByPlaceId(placeId);
    const full = list.find((e) => e.id === experience.id);
    if (!full) throw new ExperienceError("Erro ao cadastrar a experiencia", 500);
    return full;
}

export async function getExperiencePhotoStream(experienceId: number, photoId: number) {
    const photo = await experienceModel.findExperiencePhotoById(experienceId, photoId);
    if (!photo) return null;
    return {
        stream: storageService.getReadStream(photo.url),
        contentType: storageService.getContentTypeFromKey(photo.url),
    };
}

export async function listExperiencesByPlace(placeId: number) {
    return experienceModel.findAllExperiencesByPlaceId(placeId);
}

export async function listMyExperiences(userId: number) {
    return experienceModel.findExperiencesByUserId(userId);
}

async function assertExperienceOwner(
    placeId: number,
    experienceId: number,
    userId: number
) {
    const experience = await experienceModel.findExperienceById(experienceId);
    if (!experience) {
        throw new ExperienceError("Relato não encontrado", 404);
    }
    if (experience.placeId !== placeId) {
        throw new ExperienceError("Relato não pertence a este local", 400, "INVALID_PLACE");
    }
    if (experience.userId !== userId) {
        throw new ExperienceError("Acesso negado: você não é o autor deste relato", 403, "FORBIDDEN_OWNER");
    }
    return experience;
}

async function uploadExperiencePhotoRecords(
    experienceId: number,
    files: Express.Multer.File[]
): Promise<{ url: string; sortOrder: number }[]> {
    const photoRecords: { url: string; sortOrder: number }[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const key = buildExperiencePhotoKey(experienceId, i, file.mimetype);
        await storageService.uploadBuffer(key, file.buffer, file.mimetype);
        photoRecords.push({ url: key, sortOrder: i });
    }
    return photoRecords;
}

async function deleteExperiencePhotoKeys(keys: string[]) {
    await Promise.all(keys.map((key) => storageService.deleteObject(key).catch(() => {})));
}

export async function updateExperience(
    userId: number,
    placeId: number,
    experienceId: number,
    input: CreateExperienceInput,
    files: Express.Multer.File[]
) {
    const existing = await assertExperienceOwner(placeId, experienceId, userId);
    const validated = await validateExperienceInput(placeId, input, files);

    const hasNewPhotos = files.length > 0;
    const oldPhotoKeys = (existing.photos ?? []).map((p) => p.url);
    let newPhotoRecords: { url: string; sortOrder: number }[] = [];

    if (hasNewPhotos) {
        try {
            newPhotoRecords = await uploadExperiencePhotoRecords(experienceId, files);
        } catch {
            await deleteExperiencePhotoKeys(newPhotoRecords.map((p) => p.url));
            throw new ExperienceError("Erro ao salvar fotos do relato", 500);
        }
    }

    try {
        await experienceModel.updateExperienceById(experienceId, {
            rating: validated.rating,
            text: validated.text,
            visitDate: validated.visitDate,
            title: validated.title ?? null,
        });

        if (hasNewPhotos) {
            await experienceModel.replaceExperiencePhotos(experienceId, newPhotoRecords);
            await deleteExperiencePhotoKeys(oldPhotoKeys);
        }
    } catch {
        if (hasNewPhotos) {
            await deleteExperiencePhotoKeys(newPhotoRecords.map((p) => p.url));
        }
        throw new ExperienceError("Erro ao atualizar o relato", 500);
    }

    const list = await experienceModel.findAllExperiencesByPlaceId(placeId);
    const full = list.find((e) => e.id === experienceId);
    if (!full) throw new ExperienceError("Erro ao atualizar o relato", 500);
    return full;
}

export async function deleteExperience(
    userId: number,
    placeId: number,
    experienceId: number
) {
    const experience = await assertExperienceOwner(placeId, experienceId, userId);
    const photoKeys = (experience.photos ?? []).map((p) => p.url);

    await experienceModel.deleteExperienceById(experienceId);
    await deleteExperiencePhotoKeys(photoKeys);
}

