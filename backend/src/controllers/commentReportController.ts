import type { Request, Response } from "express";
import * as commentReportService from "../services/commentReportService.ts";
import { CommentReportError } from "../services/commentReportService.ts";

export async function reportComment(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(placeId) || Number.isNaN(experienceId) || Number.isNaN(commentId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await commentReportService.reportComment(
            req.user.id,
            placeId,
            experienceId,
            commentId,
            req.body
        );
        res.status(201).json(result);
    } catch (err) {
        if (err instanceof CommentReportError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao registrar denúncia" });
    }
}
