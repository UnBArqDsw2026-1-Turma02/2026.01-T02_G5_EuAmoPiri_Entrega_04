import { describe, it, expect, vi, beforeEach } from "vitest";
import { reportExperience, ReportError } from "./experienceReportService.ts";

vi.mock("../model/experienceModel.ts", () => ({
    findExperienceByIdAndPlaceId: vi.fn(),
    updateExperienceStatus: vi.fn(),
}));

vi.mock("../model/experienceReportModel.ts", () => ({
    findExperienceReportByReporter: vi.fn(),
    createExperienceReport: vi.fn(),
    countExperienceReports: vi.fn(),
}));

import * as experienceModel from "../model/experienceModel.ts";
import * as experienceReportModel from "../model/experienceReportModel.ts";

describe("experienceReportService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("denuncia relato ACTIVE → REPORTED", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({
            id: 1,
            userId: 2,
            status: "ACTIVE",
        } as never);
        vi.mocked(experienceReportModel.findExperienceReportByReporter).mockResolvedValue(null);
        vi.mocked(experienceReportModel.createExperienceReport).mockResolvedValue({ id: 1 } as never);
        vi.mocked(experienceModel.updateExperienceStatus).mockResolvedValue({ id: 1, status: "REPORTED" } as never);
        vi.mocked(experienceReportModel.countExperienceReports).mockResolvedValue(1);

        const result = await reportExperience(3, 1, 1, { reason: "FALSO" });

        expect(experienceModel.updateExperienceStatus).toHaveBeenCalledWith(1, "REPORTED");
        expect(result.status).toBe("REPORTED");
        expect(result.reportCount).toBe(1);
    });

    it("rejeita denúncia do próprio autor", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({
            id: 1,
            userId: 5,
            status: "ACTIVE",
        } as never);

        await expect(reportExperience(5, 1, 1, { reason: "ODIO" })).rejects.toMatchObject({
            code: "CANNOT_REPORT_OWN",
            statusCode: 403,
        });
    });

    it("rejeita denúncia duplicada", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({
            id: 1,
            userId: 2,
            status: "REPORTED",
        } as never);
        vi.mocked(experienceReportModel.findExperienceReportByReporter).mockResolvedValue({ id: 9 } as never);

        await expect(reportExperience(3, 1, 1, { reason: "SENSIVEL" })).rejects.toMatchObject({
            code: "ALREADY_REPORTED",
            statusCode: 409,
        });
    });

    it("exige descrição quando motivo OUTRO", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({
            id: 1,
            userId: 2,
            status: "ACTIVE",
        } as never);

        await expect(reportExperience(3, 1, 1, { reason: "OUTRO" })).rejects.toMatchObject({
            code: "DESCRIPTION_REQUIRED",
        });
    });

    it("rejeita relato HIDDEN", async () => {
        vi.mocked(experienceModel.findExperienceByIdAndPlaceId).mockResolvedValue({
            id: 1,
            userId: 2,
            status: "HIDDEN",
        } as never);

        await expect(reportExperience(3, 1, 1, { reason: "FALSO" })).rejects.toMatchObject({
            code: "CONTENT_UNAVAILABLE",
            statusCode: 410,
        });
    });
});
