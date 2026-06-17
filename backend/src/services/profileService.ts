import type { AccountType, User } from "../../generated/prisma/client.ts";
import type { UserUncheckedUpdateInput } from "../../generated/prisma/models/User.ts";
import * as userModel from "../model/userModel.ts";
import * as storageService from "./storageService.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png"]);
const PROFILE_PREFIX = process.env.GCS_PROFILE_PREFIX ?? "profile_photo/";

export class ProfileError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "ProfileError";
    }
}

export interface ProfileUpdateInput {
    name?: string;
    email?: string;
    accountType?: AccountType;
    phone?: string;
    profession?: string;
    biography?: string;
    birthDate?: string;
}

function normalizeString(value: string | undefined | null): string | null {
    if (value === undefined || value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

function formatBirthDateForCompare(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString().slice(0, 10);
}

function extensionFromMime(mimetype: string): string {
    return mimetype === "image/png" ? "png" : "jpg";
}

export function buildObjectKey(userId: number, mimetype: string): string {
    const ext = extensionFromMime(mimetype);
    return `${PROFILE_PREFIX}${userId}-${Date.now()}.${ext}`;
}

export function validatePhotoFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
        throw new ProfileError("Formato de imagem inválido. Use JPG ou PNG.", 400);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new ProfileError("A imagem deve ter no máximo 5 MB", 400);
    }
}

export function hasProfileChanges(
    current: User,
    input: ProfileUpdateInput,
    file?: Express.Multer.File
): boolean {
    if (file) return true;

    if (input.name !== undefined && normalizeString(input.name) !== current.name) return true;
    if (input.email !== undefined && normalizeString(input.email)?.toLowerCase() !== current.email) return true;
    if (input.accountType !== undefined && input.accountType !== current.accountType) return true;
    if (input.phone !== undefined && normalizeString(input.phone) !== (current.phone ?? null)) return true;
    if (input.profession !== undefined && normalizeString(input.profession) !== (current.profession ?? null)) return true;
    if (input.biography !== undefined && normalizeString(input.biography) !== (current.biography ?? null)) return true;

    if (input.birthDate !== undefined) {
        const newDate = normalizeString(input.birthDate);
        const currentDate = formatBirthDateForCompare(current.birthDate);
        if (newDate !== currentDate) return true;
    }

    return false;
}

function mapChangedFields(current: User, input: ProfileUpdateInput): UserUncheckedUpdateInput {
    const data: UserUncheckedUpdateInput = {};

    if (input.name !== undefined) {
        data.name = normalizeString(input.name) ?? current.name;
    }
    if (input.email !== undefined) {
        const email = normalizeString(input.email);
        if (email) data.email = email.toLowerCase();
    }
    if (input.accountType !== undefined) {
        data.accountType = input.accountType;
    }
    if (input.phone !== undefined) {
        data.phone = normalizeString(input.phone);
    }
    if (input.profession !== undefined) {
        data.profession = normalizeString(input.profession);
    }
    if (input.biography !== undefined) {
        data.biography = normalizeString(input.biography);
    }
    if (input.birthDate !== undefined) {
        const birthDate = normalizeString(input.birthDate);
        data.birthDate = birthDate ? new Date(birthDate) : null;
    }

    return data;
}

async function validateEmailChange(current: User, input: ProfileUpdateInput): Promise<void> {
    if (input.email === undefined) return;

    const email = normalizeString(input.email);
    if (!email) return;

    if (!EMAIL_REGEX.test(email)) {
        throw new ProfileError("Email inválido", 400);
    }

    const normalized = email.toLowerCase();
    if (normalized === current.email) return;

    const existing = await userModel.findByEmail(normalized);
    if (existing && existing.id !== current.id) {
        throw new ProfileError("Email já cadastrado", 409);
    }
}

export async function updateProfile(
    userId: number,
    input: ProfileUpdateInput,
    file?: Express.Multer.File
): Promise<User> {
    const current = await userModel.findById(userId);
    if (!current) {
        throw new ProfileError("Usuário não encontrado", 404);
    }

    if (!hasProfileChanges(current, input, file)) {
        throw new ProfileError("Nenhuma alteração detectada", 400);
    }

    await validateEmailChange(current, input);

    const oldPhotoKey = current.profilePhotoUrl;
    let newPhotoKey = oldPhotoKey;

    if (file) {
        validatePhotoFile(file);
        newPhotoKey = buildObjectKey(userId, file.mimetype);
        try {
            await storageService.uploadBuffer(newPhotoKey, file.buffer, file.mimetype);
        } catch {
            throw new ProfileError("Erro ao salvar foto", 500);
        }
    }

    const updateData = {
        ...mapChangedFields(current, input),
        ...(file && newPhotoKey ? { profilePhotoUrl: newPhotoKey } : {}),
    };

    const updated = await userModel.updateUser(userId, updateData);

    if (file && oldPhotoKey && oldPhotoKey !== newPhotoKey) {
        storageService.deleteObject(oldPhotoKey).catch((err) => {
            console.warn(`Falha ao deletar foto antiga ${oldPhotoKey}:`, err);
        });
    }

    return updated;
}

export async function getProfilePhotoStream(userId: number): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
} | null> {
    const user = await userModel.findById(userId);
    if (!user?.profilePhotoUrl) return null;

    return {
        stream: storageService.getReadStream(user.profilePhotoUrl),
        contentType: storageService.getContentTypeFromKey(user.profilePhotoUrl),
    };
}
