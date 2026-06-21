import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentError, createComment } from "./commentService.ts";

vi.mock("../model/commentModel.ts", () => ({
    createComment: vi.fn(),
    findCommentsByExperienceId: vi.fn(),
    countCommentsByExperienceIds: vi.fn(),
}));

vi.mock("../model/experienceModel.ts", () => ({
    findExperienceByIdAndPlaceId: vi.fn(),
}));

import * as commentModel from "../model/commentModel.ts";
import * as experienceModel from "../model/experienceModel.ts";

const mockRelato = {
    id: 1,
    placeId: 1,
    title: "Relato teste",
    place: { id: 1, name: "Local teste" },
};

const mockCommentRow = {
    id: 1,
    text: "Sim",
    experienceId: 1,
    userId: 2,
    createdAt: new Date(),
    user: { id: 2, name: "João" },
    experience: {
        id: 1,
        placeId: 1,
        title: "Relato teste",
        place: { id: 1, name: "Local teste" },
    },
};

describe("commentService", () => {
    beforeEach(() => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue(mockRelato as never);
    });

    it("RNF01: rejeita texto vazio", async () => {
        await expect(createComment(1, 1, 1, "   ")).rejects.toMatchObject({ code: "RNF01" });
    });

    it("MIN_TEXT_LENGTH: rejeita texto com menos de 3 caracteres", async () => {
        await expect(createComment(1, 1, 1, "ab")).rejects.toMatchObject({ code: "MIN_TEXT_LENGTH" });
    });

    it("RNF03: rejeita texto longo", async () => {
        await expect(createComment(1, 1, 1, "a".repeat(501))).rejects.toMatchObject({ code: "RNF03" });
    });

    it("BLACKLISTED_CONTENT: rejeita blacklist", async () => {
        await expect(
            createComment(1, 1, 1, "Esse lugar é idiota demais mesmo")
        ).rejects.toMatchObject({ code: "BLACKLISTED_CONTENT" });
    });

    it("404 se relato não pertence ao local", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue(null);
        await expect(createComment(1, 1, 99, "Comentário válido aqui")).rejects.toMatchObject({
            statusCode: 404,
        });
    });

    it("aceita comentário válido vinculado ao relato", async () => {
        vi.mocked(commentModel.createComment).mockResolvedValue(mockCommentRow as never);

        const result = await createComment(2, 1, 1, "Sim");
        expect(result.text).toBe("Sim");
        expect(result.experience.id).toBe(1);
        expect(result.experience.placeId).toBe(1);
        expect(commentModel.createComment).toHaveBeenCalledWith(1, 2, "Sim");
    });
});
