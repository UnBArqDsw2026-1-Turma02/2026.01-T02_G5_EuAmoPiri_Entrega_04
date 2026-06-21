import type { Request, Response } from "express";
import * as commentService from "../services/commentService.ts";
import { CommentError } from "../services/commentService.ts";
import { formatComment, formatCommentList } from "../views/commentView.ts";

export async function createComment(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    const text = typeof req.body?.text === "string" ? req.body.text : "";

    if (Number.isNaN(placeId) || Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const comment = await commentService.createComment(
            req.user.id,
            placeId,
            experienceId,
            text
        );
        res.status(201).json(formatComment(comment));
    } catch (err) {
        if (err instanceof CommentError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao criar comentário" });
    }
}

export async function listComments(req: Request, res: Response) {
    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);

    if (Number.isNaN(placeId) || Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const comments = await commentService.listCommentsByExperience(placeId, experienceId);
        res.status(200).json(formatCommentList(comments));
    } catch (err) {
        if (err instanceof CommentError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao buscar comentários" });
    }
}
