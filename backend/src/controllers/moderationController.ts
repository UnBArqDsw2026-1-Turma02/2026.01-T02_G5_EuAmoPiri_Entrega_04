import type { Request, Response } from "express";
import * as moderationService from "../services/moderationService.ts";
import { ModerationError } from "../services/moderationService.ts";
import type { ContentStatus } from "../../generated/prisma/client.ts";

export async function listModeration(req: Request, res: Response) {
    const status = (req.query.status as ContentStatus) || "REPORTED";

    try {
        const queue = await moderationService.listModerationQueue(status);
        res.status(200).json(queue);
    } catch (err) {
        if (err instanceof ModerationError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao listar moderação" });
    }
}

export async function restoreExperience(req: Request, res: Response) {
    const experienceId = Number(req.params.experienceId);
    if (Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await moderationService.restoreExperience(experienceId);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof ModerationError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao restaurar relato" });
    }
}

export async function hideExperience(req: Request, res: Response) {
    const experienceId = Number(req.params.experienceId);
    if (Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await moderationService.hideExperience(experienceId);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof ModerationError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao ocultar relato" });
    }
}

export async function restoreComment(req: Request, res: Response) {
    const commentId = Number(req.params.commentId);
    if (Number.isNaN(commentId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await moderationService.restoreComment(commentId);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof ModerationError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao restaurar comentário" });
    }
}

export async function hideComment(req: Request, res: Response) {
    const commentId = Number(req.params.commentId);
    if (Number.isNaN(commentId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await moderationService.hideComment(commentId);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof ModerationError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao ocultar comentário" });
    }
}
