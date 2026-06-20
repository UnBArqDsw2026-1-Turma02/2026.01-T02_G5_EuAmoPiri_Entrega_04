import { describe, it, expect, vi, beforeEach } from "vitest";
import * as userModel from "../model/userModel.ts";
import * as experienceModel from "../model/experienceModel.ts";
import * as storageService from "./storageService.ts";
import { deleteAccount } from "./accountService.ts";

vi.mock("../model/userModel.ts", () => ({
    findByIdForDeletion: vi.fn(),
    deleteUser: vi.fn(),
}));
vi.mock("../model/experienceModel.ts", () => ({
    deleteExperienceById: vi.fn(),
}));
vi.mock("./storageService.ts");

const baseUser = {
    id: 5,
    accountType: "TURISTA" as const,
    name: "Turista",
    email: "turista@test.com",
    birthDate: null,
    phone: null,
    profession: null,
    biography: null,
    profilePhotoUrl: "profile_photo/5.jpg",
    passwordHash: null,
    googleId: null,
    createdAt: new Date(),
    places: [],
    experiences: [
        {
            id: 20,
            userName: "Turista",
            rating: 5,
            title: "Ótimo",
            text: "Texto",
            visitDate: new Date(),
            createdAt: new Date(),
            placeId: 1,
            userId: 5,
            photos: [{ id: 1, experienceId: 20, url: "experience_photos/20/0.jpg", sortOrder: 0 }],
        },
    ],
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.deleteObject).mockResolvedValue(undefined);
    vi.mocked(userModel.deleteUser).mockResolvedValue(undefined);
    vi.mocked(experienceModel.deleteExperienceById).mockResolvedValue(undefined as never);
});

describe("accountService deleteAccount", () => {
    it("permite que o dono exclua a própria conta", async () => {
        vi.mocked(userModel.findByIdForDeletion).mockResolvedValue(baseUser as never);

        await deleteAccount(5, { id: 5, accountType: "TURISTA" });

        expect(experienceModel.deleteExperienceById).toHaveBeenCalledWith(20);
        expect(userModel.deleteUser).toHaveBeenCalledWith(5);
        expect(storageService.deleteObject).toHaveBeenCalledWith("profile_photo/5.jpg");
        expect(storageService.deleteObject).toHaveBeenCalledWith("experience_photos/20/0.jpg");
    });

    it("permite que admin exclua outro usuário", async () => {
        vi.mocked(userModel.findByIdForDeletion).mockResolvedValue(baseUser as never);

        await deleteAccount(5, { id: 99, accountType: "ADMIN" });

        expect(userModel.deleteUser).toHaveBeenCalledWith(5);
    });

    it("rejeita exclusão de terceiro por turista", async () => {
        await expect(
            deleteAccount(5, { id: 10, accountType: "TURISTA" })
        ).rejects.toMatchObject({
            statusCode: 403,
            code: "FORBIDDEN",
        });

        expect(userModel.findByIdForDeletion).not.toHaveBeenCalled();
    });

    it("rejeita exclusão de terceiro por morador", async () => {
        await expect(
            deleteAccount(5, { id: 10, accountType: "MORADOR" })
        ).rejects.toMatchObject({
            statusCode: 403,
            code: "FORBIDDEN",
        });
    });

    it("retorna 404 quando usuário não existe", async () => {
        vi.mocked(userModel.findByIdForDeletion).mockResolvedValue(null);

        await expect(
            deleteAccount(5, { id: 5, accountType: "TURISTA" })
        ).rejects.toMatchObject({
            statusCode: 404,
        });

        expect(userModel.deleteUser).not.toHaveBeenCalled();
    });

    it("limpa fotos de locais do morador", async () => {
        const moradorUser = {
            ...baseUser,
            accountType: "MORADOR" as const,
            experiences: [],
            places: [
                {
                    id: 1,
                    name: "Local",
                    category: "RESTAURANTE" as const,
                    description: "Desc",
                    address: "Rua",
                    mapsLink: null,
                    phone: null,
                    openingDate: null,
                    moradorId: 5,
                    createdAt: new Date(),
                    photos: [{ id: 1, placeId: 1, url: "place_photos/1/0.jpg", sortOrder: 0 }],
                    experiences: [
                        {
                            id: 30,
                            userName: "Outro",
                            rating: 4,
                            title: null,
                            text: "Relato",
                            visitDate: new Date(),
                            createdAt: new Date(),
                            placeId: 1,
                            userId: 8,
                            photos: [{ id: 2, experienceId: 30, url: "experience_photos/30/0.jpg", sortOrder: 0 }],
                        },
                    ],
                },
            ],
        };
        vi.mocked(userModel.findByIdForDeletion).mockResolvedValue(moradorUser as never);

        await deleteAccount(5, { id: 5, accountType: "MORADOR" });

        expect(storageService.deleteObject).toHaveBeenCalledWith("place_photos/1/0.jpg");
        expect(storageService.deleteObject).toHaveBeenCalledWith("experience_photos/30/0.jpg");
        expect(userModel.deleteUser).toHaveBeenCalledWith(5);
    });
});
