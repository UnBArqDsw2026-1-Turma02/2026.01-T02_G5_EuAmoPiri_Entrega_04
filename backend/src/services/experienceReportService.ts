import * as experienceModel from "../model/experienceModel.ts";
import * as experienceReportModel from "../model/experienceReportModel.ts";
import { isValidReportReason } from "../constants/reportReasons.ts";
import type { ReportReason } from "../../generated/prisma/client.ts";

export class ReportError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "ReportError";
    }
}

const MAX_DESCRIPTION_LENGTH = 500;

function validateReportPayload(reason: unknown, description: unknown) {
    if (typeof reason !== "string" || !isValidReportReason(reason)) {
        throw new ReportError("Motivo de denúncia inválido", 400, "INVALID_REASON");
    }

    let desc: string | undefined;
    if (description !== undefined && description !== null && description !== "") {
        if (typeof description !== "string") {
            throw new ReportError("Descrição inválida", 400, "INVALID_DESCRIPTION");
        }
        desc = description.trim();
        if (reason === "OUTRO" && !desc) {
            throw new ReportError("Descreva brevemente o motivo da denúncia", 400, "DESCRIPTION_REQUIRED");
        }
        if (desc.length > MAX_DESCRIPTION_LENGTH) {
            throw new ReportError(
                `Descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
                400,
                "RNF03"
            );
        }
    } else if (reason === "OUTRO") {
        throw new ReportError("Descreva brevemente o motivo da denúncia", 400, "DESCRIPTION_REQUIRED");
    }

    return { reason: reason as ReportReason, description: desc };
}

export async function reportExperience(
    reporterId: number,
    placeId: number,
    experienceId: number,
    body: { reason: unknown; description?: unknown }
) {
    const { reason, description } = validateReportPayload(body.reason, body.description);

    const experience = await experienceModel.findExperienceByIdAndPlaceId(experienceId, placeId);
    if (!experience) {
        throw new ReportError("Relato não encontrado neste local", 404);
    }
    if (experience.status === "HIDDEN") {
        throw new ReportError("Relato indisponível", 410, "CONTENT_UNAVAILABLE");
    }
    if (experience.userId === reporterId) {
        throw new ReportError("Você não pode denunciar seu próprio relato", 403, "CANNOT_REPORT_OWN");
    }

    const existing = await experienceReportModel.findExperienceReportByReporter(experienceId, reporterId);
    if (existing) {
        throw new ReportError("Você já denunciou este relato", 409, "ALREADY_REPORTED");
    }

    await experienceReportModel.createExperienceReport(experienceId, reporterId, reason, description);

    if (experience.status === "ACTIVE") {
        await experienceModel.updateExperienceStatus(experienceId, "REPORTED");
    }

    const reportCount = await experienceReportModel.countExperienceReports(experienceId);

    return {
        message: "Denúncia recebida! O relato foi sinalizado para revisão.",
        reportCount,
        status: "REPORTED" as const,
    };
}
