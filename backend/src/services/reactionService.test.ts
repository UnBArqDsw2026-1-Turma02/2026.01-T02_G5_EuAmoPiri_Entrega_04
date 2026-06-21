import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReactionError, toggleReaction } from "./reactionService.ts";

vi.mock("../model/experienceModel.ts", () => ({
    findExperienceByIdAndPlaceId: vi.fn(),
}));

vi.mock("../model/reactionModel.ts", () => ({
    findUserReaction: vi.fn(),
    createReaction: vi.fn(),
    updateReaction: vi.fn(),
    deleteReaction: vi.fn(),
    countReactionsByExperienceIds: vi.fn(),
    findUserReactionsByExperienceIds: vi.fn(),
}));

import * as experienceModel from "../model/experienceModel.ts";
import * as reactionModel from "../model/reactionModel.ts";

describe("reactionService", () => {
    beforeEach(() => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({ id: 1, placeId: 1 } as never);
        vi.mocked(reactionModel.findUserReaction).mockResolvedValue(null);
        vi.mocked(reactionModel.countReactionsByExperienceIds).mockResolvedValue([]);
        vi.mocked(reactionModel.findUserReactionsByExperienceIds).mockResolvedValue([]);
    });

    it("rejeita chave inválida", async () => {
        await expect(toggleReaction(1, 1, 1, "gem")).rejects.toMatchObject({
            code: "INVALID_REACTION_TYPE",
        });
    });

    it("BDD: adiciona coração quando não há reação", async () => {
        vi.mocked(reactionModel.createReaction).mockResolvedValue({ id: 1 } as never);
        vi.mocked(reactionModel.countReactionsByExperienceIds).mockResolvedValue([
            { experienceId: 1, type: "HEART", _count: { _all: 1 } },
        ] as never);
        vi.mocked(reactionModel.findUserReactionsByExperienceIds).mockResolvedValue([
            { experienceId: 1, type: "HEART" },
        ] as never);

        const result = await toggleReaction(1, 1, 1, "heart");
        expect(reactionModel.createReaction).toHaveBeenCalledWith(1, 1, "HEART");
        expect(result.reactions.heart).toBe(1);
        expect(result.myReaction).toBe("heart");
    });

    it("BDD: remove coração ao clicar de novo", async () => {
        vi.mocked(reactionModel.findUserReaction).mockResolvedValue({
            id: 10,
            type: "HEART",
        } as never);

        const result = await toggleReaction(1, 1, 1, "heart");
        expect(reactionModel.deleteReaction).toHaveBeenCalledWith(10);
        expect(result.myReaction).toBeNull();
    });

    it("troca heart por like", async () => {
        vi.mocked(reactionModel.findUserReaction).mockResolvedValue({
            id: 10,
            type: "HEART",
        } as never);
        vi.mocked(reactionModel.countReactionsByExperienceIds).mockResolvedValue([
            { experienceId: 1, type: "LIKE", _count: { _all: 1 } },
        ] as never);
        vi.mocked(reactionModel.findUserReactionsByExperienceIds).mockResolvedValue([
            { experienceId: 1, type: "LIKE" },
        ] as never);

        const result = await toggleReaction(1, 1, 1, "like");
        expect(reactionModel.updateReaction).toHaveBeenCalledWith(10, "LIKE");
        expect(result.myReaction).toBe("like");
    });

    it("404 se relato não existe no local", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue(null);
        await expect(toggleReaction(1, 1, 99, "heart")).rejects.toBeInstanceOf(ReactionError);
    });
});
