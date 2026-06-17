import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateExperienceInput } from "./experienceService.ts";

vi.mock("../model/experienceModel.ts", () => ({
    findPlaceById: vi.fn(),
}));

import * as experienceModel from "../model/experienceModel.ts";

describe("experienceService validation", () => {
    beforeEach(() => {
        vi.mocked(experienceModel.findPlaceById).mockResolvedValue({ id: 1 } as never);
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
        await expect(
            validateExperienceInput(
                1,
                { rating: 4, text: "Lugar idiota demais", visitDate: "2026-06-01" },
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
