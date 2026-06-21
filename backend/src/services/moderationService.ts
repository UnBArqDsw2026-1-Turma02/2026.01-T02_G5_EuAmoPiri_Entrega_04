import * as experienceModel from "../model/experienceModel.ts";
import * as commentModel from "../model/commentModel.ts";
import type { ContentStatus } from "../../generated/prisma/client.ts";

export class ModerationError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "ModerationError";
    }
}

function assertReportedStatus(current: ContentStatus, label: string) {
    if (current !== "REPORTED") {
        throw new ModerationError(
            `${label} não está aguardando moderação`,
            400,
            "INVALID_STATUS_TRANSITION"
        );
    }
}

export async function listModerationQueue(status: ContentStatus = "REPORTED") {
    if (status !== "REPORTED") {
        throw new ModerationError("Status de fila inválido", 400, "INVALID_STATUS");
    }

    const [experiences, comments] = await Promise.all([
        experienceModel.findReportedExperiences(),
        commentModel.findReportedComments(),
    ]);

    return {
        experiences: experiences.map((e) => ({
            type: "relato" as const,
            id: e.id,
            placeId: e.placeId,
            placeName: e.place.name,
            userName: e.userName,
            title: e.title,
            text: e.text,
            status: e.status,
            reportCount: e._count.reports,
            createdAt: e.createdAt,
        })),
        comments: comments.map((c) => ({
            type: "comentario" as const,
            id: c.id,
            experienceId: c.experienceId,
            placeId: c.experience.placeId,
            placeName: c.experience.place.name,
            userName: c.user.name,
            text: c.text,
            status: c.status,
            reportCount: c._count.reports,
            createdAt: c.createdAt,
        })),
    };
}

export async function restoreExperience(experienceId: number) {
    const experience = await experienceModel.findExperienceById(experienceId);
    if (!experience) {
        throw new ModerationError("Relato não encontrado", 404);
    }
    assertReportedStatus(experience.status, "Relato");

    const updated = await experienceModel.updateExperienceStatus(experienceId, "ACTIVE");
    return {
        message: "Relato restaurado com sucesso.",
        id: updated.id,
        status: updated.status,
    };
}

export async function hideExperience(experienceId: number) {
    const experience = await experienceModel.findExperienceById(experienceId);
    if (!experience) {
        throw new ModerationError("Relato não encontrado", 404);
    }
    assertReportedStatus(experience.status, "Relato");

    const updated = await experienceModel.updateExperienceStatus(experienceId, "HIDDEN");
    return {
        message: "Relato ocultado com sucesso.",
        id: updated.id,
        status: updated.status,
    };
}

export async function restoreComment(commentId: number) {
    const found = await commentModel.findCommentById(commentId);
    if (!found) {
        throw new ModerationError("Comentário não encontrado", 404);
    }
    assertReportedStatus(found.status, "Comentário");

    const updated = await commentModel.updateCommentStatus(commentId, "ACTIVE");
    return {
        message: "Comentário restaurado com sucesso.",
        id: updated.id,
        status: updated.status,
    };
}

export async function hideComment(commentId: number) {
    const found = await commentModel.findCommentById(commentId);
    if (!found) {
        throw new ModerationError("Comentário não encontrado", 404);
    }
    assertReportedStatus(found.status, "Comentário");

    const updated = await commentModel.updateCommentStatus(commentId, "HIDDEN");
    return {
        message: "Comentário ocultado com sucesso.",
        id: updated.id,
        status: updated.status,
    };
}
