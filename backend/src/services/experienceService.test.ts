import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateExperienceInput, updateExperience, deleteExperience, ExperienceError } from "./experienceService.ts";

vi.mock("../model/experienceModel.ts", () => ({
    findPlaceById: vi.fn(),
    findExperienceById: vi.fn(),
    updateExperienceById: vi.fn(),
    deleteExperienceById: vi.fn(),
    replaceExperiencePhotos: vi.fn(),
    findAllExperiencesByPlaceId: vi.fn(),
}));

vi.mock("./storageService.ts", () => ({
    uploadBuffer: vi.fn(),
    deleteObject: vi.fn(),
}));

import * as experienceModel from "../model/experienceModel.ts";
import * as storageService from "./storageService.ts";

describe("experienceService validation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(experienceModel.findPlaceById).mockResolvedValue({ id: 1 } as never);
        vi.mocked(storageService.uploadBuffer).mockResolvedValue(undefined);
        vi.mocked(storageService.deleteObject).mockResolvedValue(undefined);
    });

    it("RNF01: rejeita estrelas sem texto", async () => {
        await expect(
            validateExperienceInput(1, { rating: 4, text: "  ", visitDate: "2026-06-01" }, [])
        ).rejects.toMatchObject({ code: "RNF01" });
    });

    it("RNF03: rejeita texto acima de 2000 caracteres", async () => {
        await expect(
            validateExperienceInput(
                1,
                { rating: 4, text: "a".repeat(2001), visitDate: "2026-06-01" },
                []
            )
        ).rejects.toMatchObject({ code: "RNF03" });
    });

    it("RNF02: rejeita blacklist", async () => {
        const text = "Lugar idiota demais. " + "a".repeat(79);
        await expect(
            validateExperienceInput(
                1,
                { rating: 4, text, visitDate: "2026-06-01" },
                []
            )
        ).rejects.toMatchObject({ code: "BLACKLISTED_CONTENT" });
    });

    it("aceita cenário BDD: 4 estrelas e 150 caracteres", async () => {
        const text = "a".repeat(150);
        await expect(
            validateExperienceInput(1, { rating: 4, text, visitDate: "2026-06-01" }, [])
        ).resolves.toMatchObject({ rating: 4, text });
    });
});

const baseExperience = {
    id: 5,
    placeId: 1,
    userId: 20,
    userName: "Turista",
    rating: 4,
    title: "Ótimo",
    text: "a".repeat(150),
    visitDate: new Date("2026-06-01"),
    createdAt: new Date(),
    photos: [{ id: 1, experienceId: 5, url: "experiences/5/0.jpg", sortOrder: 0 }],
    place: { id: 1, name: "Local" },
};

const validInput = {
    rating: 5,
    text: "b".repeat(150),
    visitDate: "2026-06-02",
    title: "Atualizado",
};

describe("experienceService update/delete", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(experienceModel.findPlaceById).mockResolvedValue({ id: 1 } as never);
        vi.mocked(storageService.uploadBuffer).mockResolvedValue(undefined);
        vi.mocked(storageService.deleteObject).mockResolvedValue(undefined);
    });

    it("atualiza relato quando turista é o autor", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue(baseExperience as never);
        vi.mocked(experienceModel.updateExperienceById).mockResolvedValue(baseExperience as never);
        vi.mocked(experienceModel.findAllExperiencesByPlaceId).mockResolvedValue([
            { ...baseExperience, rating: 5 },
        ] as never);

        const result = await updateExperience(20, 1, 5, validInput, []);

        expect(result.rating).toBe(5);
        expect(experienceModel.updateExperienceById).toHaveBeenCalled();
    });

    it("rejeita update quando turista não é autor", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue(baseExperience as never);

        await expect(updateExperience(99, 1, 5, validInput, [])).rejects.toMatchObject({
            statusCode: 403,
            code: "FORBIDDEN_OWNER",
        });
    });

    it("rejeita update quando placeId não coincide", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue(baseExperience as never);

        await expect(updateExperience(20, 2, 5, validInput, [])).rejects.toMatchObject({
            statusCode: 400,
            code: "INVALID_PLACE",
        });
    });

    it("exclui relato e remove fotos do storage", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue(baseExperience as never);
        vi.mocked(experienceModel.deleteExperienceById).mockResolvedValue(baseExperience as never);

        await deleteExperience(20, 1, 5);

        expect(experienceModel.deleteExperienceById).toHaveBeenCalledWith(5);
        expect(storageService.deleteObject).toHaveBeenCalledWith("experiences/5/0.jpg");
    });
});

describe("ExperienceError", () => {
    it("expõe statusCode e code", () => {
        const err = new ExperienceError("msg", 404, "NOT_FOUND");
        expect(err).toBeInstanceOf(Error);
        expect(err.statusCode).toBe(404);
    });
});
