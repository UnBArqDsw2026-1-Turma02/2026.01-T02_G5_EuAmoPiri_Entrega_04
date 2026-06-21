import type { AccountType } from "../../generated/prisma/client.ts";
import * as userModel from "../model/userModel.ts";
import * as experienceModel from "../model/experienceModel.ts";
import * as storageService from "./storageService.ts";

export class AccountError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "AccountError";
    }
}

export interface AccountRequester {
    id: number;
    accountType: AccountType | null;
}

function assertCanDeleteAccount(requester: AccountRequester, targetUserId: number): void {
    if (requester.id === targetUserId) return;
    if (requester.accountType === "ADMIN") return;
    throw new AccountError("Acesso negado", 403, "FORBIDDEN");
}

async function deleteStorageKeys(keys: string[]): Promise<void> {
    const uniqueKeys = [...new Set(keys.filter(Boolean))];
    await Promise.all(
        uniqueKeys.map((key) => storageService.deleteObject(key).catch(() => {}))
    );
}

function collectDeletionPhotoKeys(
    user: NonNullable<Awaited<ReturnType<typeof userModel.findByIdForDeletion>>>
): string[] {
    const keys: string[] = [];

    if (user.profilePhotoUrl) {
        keys.push(user.profilePhotoUrl);
    }

    for (const place of user.places) {
        for (const photo of place.photos) {
            keys.push(photo.url);
        }
        for (const experience of place.experiences) {
            for (const photo of experience.photos) {
                keys.push(photo.url);
            }
        }
    }

    for (const experience of user.experiences) {
        for (const photo of experience.photos) {
            keys.push(photo.url);
        }
    }

    return keys;
}

export async function deleteAccount(
    targetUserId: number,
    requester: AccountRequester
): Promise<void> {
    assertCanDeleteAccount(requester, targetUserId);

    const user = await userModel.findByIdForDeletion(targetUserId);
    if (!user) {
        throw new AccountError("Usuário não encontrado", 404, "USER_NOT_FOUND");
    }

    const photoKeys = collectDeletionPhotoKeys(user);

    for (const experience of user.experiences) {
        await experienceModel.deleteExperienceById(experience.id);
    }

    await userModel.deleteUser(targetUserId);
    await deleteStorageKeys(photoKeys);
}

export { assertCanDeleteAccount };
