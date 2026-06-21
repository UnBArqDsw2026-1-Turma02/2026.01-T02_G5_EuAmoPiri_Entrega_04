import * as experienceModel from "../model/experienceModel.ts";
import * as commentModel from "../model/commentModel.ts";
import * as commentReportModel from "../model/commentReportModel.ts";
import { isValidReportReason } from "../constants/reportReasons.ts";
import type { ReportReason } from "../../generated/prisma/client.ts";

export class CommentReportError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "CommentReportError";
    }
}

const MAX_DESCRIPTION_LENGTH = 500;

function validateReportPayload(reason: unknown, description: unknown) {
    if (typeof reason !== "string" || !isValidReportReason(reason)) {
        throw new CommentReportError("Motivo de denúncia inválido", 400, "INVALID_REASON");
    }

    let desc: string | undefined;
    if (description !== undefined && description !== null && description !== "") {
        if (typeof description !== "string") {
            throw new CommentReportError("Descrição inválida", 400, "INVALID_DESCRIPTION");
        }
        desc = description.trim();
        if (reason === "OUTRO" && !desc) {
            throw new CommentReportError("Descreva brevemente o motivo da denúncia", 400, "DESCRIPTION_REQUIRED");
        }
        if (desc.length > MAX_DESCRIPTION_LENGTH) {
            throw new CommentReportError(
                `Descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
                400,
                "RNF03"
            );
        }
    } else if (reason === "OUTRO") {
        throw new CommentReportError("Descreva brevemente o motivo da denúncia", 400, "DESCRIPTION_REQUIRED");
    }

    return { reason: reason as ReportReason, description: desc };
}

export async function reportComment(
    reporterId: number,
    placeId: number,
    experienceId: number,
    commentId: number,
    body: { reason: unknown; description?: unknown }
) {
    const { reason, description } = validateReportPayload(body.reason, body.description);

    const experience = await experienceModel.findExperienceByIdAndPlaceId(experienceId, placeId);
    if (!experience) {
        throw new CommentReportError("Relato não encontrado neste local", 404);
    }

    const comment = await commentModel.findCommentByIdAndExperienceId(commentId, experienceId);
    if (!comment) {
        throw new CommentReportError("Comentário não encontrado neste relato", 404);
    }
    if (comment.status === "HIDDEN") {
        throw new CommentReportError("Comentário indisponível", 410, "CONTENT_UNAVAILABLE");
    }
    if (comment.userId === reporterId) {
        throw new CommentReportError("Você não pode denunciar seu próprio comentário", 403, "CANNOT_REPORT_OWN");
    }

    const existing = await commentReportModel.findCommentReportByReporter(commentId, reporterId);
    if (existing) {
        throw new CommentReportError("Você já denunciou este comentário", 409, "ALREADY_REPORTED");
    }

    await commentReportModel.createCommentReport(commentId, reporterId, reason, description);

    if (comment.status === "ACTIVE") {
        await commentModel.updateCommentStatus(commentId, "REPORTED");
    }

    const reportCount = await commentReportModel.countCommentReports(commentId);

    return {
        message: "Denúncia recebida! O comentário foi sinalizado para revisão.",
        reportCount,
        status: "REPORTED" as const,
    };
}
