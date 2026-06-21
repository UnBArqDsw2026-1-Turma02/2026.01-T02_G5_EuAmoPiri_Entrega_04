import { describe, it, expect, vi, beforeEach } from "vitest";
import { restoreExperience, hideExperience, ModerationError } from "./moderationService.ts";

vi.mock("../model/experienceModel.ts", () => ({
    findExperienceById: vi.fn(),
    updateExperienceStatus: vi.fn(),
    findReportedExperiences: vi.fn(),
}));

vi.mock("../model/commentModel.ts", () => ({
    findCommentById: vi.fn(),
    updateCommentStatus: vi.fn(),
    findReportedComments: vi.fn(),
}));

import * as experienceModel from "../model/experienceModel.ts";

describe("moderationService — relato", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("restaura relato REPORTED → ACTIVE", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue({
            id: 1,
            status: "REPORTED",
        } as never);
        vi.mocked(experienceModel.updateExperienceStatus).mockResolvedValue({
            id: 1,
            status: "ACTIVE",
        } as never);

        const result = await restoreExperience(1);
        expect(result.status).toBe("ACTIVE");
    });

    it("oculta relato REPORTED → HIDDEN", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue({
            id: 1,
            status: "REPORTED",
        } as never);
        vi.mocked(experienceModel.updateExperienceStatus).mockResolvedValue({
            id: 1,
            status: "HIDDEN",
        } as never);

        const result = await hideExperience(1);
        expect(result.status).toBe("HIDDEN");
    });

    it("rejeita restaurar relato ACTIVE", async () => {
        vi.mocked(experienceModel.findExperienceById).mockResolvedValue({
            id: 1,
            status: "ACTIVE",
        } as never);

        await expect(restoreExperience(1)).rejects.toBeInstanceOf(ModerationError);
        await expect(restoreExperience(1)).rejects.toMatchObject({
            code: "INVALID_STATUS_TRANSITION",
        });
    });
});
