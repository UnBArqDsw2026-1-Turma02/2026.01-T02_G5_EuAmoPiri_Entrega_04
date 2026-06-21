import type { Request, Response } from "express";
import * as reactionService from "../services/reactionService.ts";
import { ReactionError } from "../services/reactionService.ts";

export async function reactToExperience(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    const reaction = typeof req.body?.reaction === "string" ? req.body.reaction : "";

    if (Number.isNaN(placeId) || Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await reactionService.toggleReaction(
            req.user.id,
            placeId,
            experienceId,
            reaction
        );
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof ReactionError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao reagir ao relato" });
    }
}
