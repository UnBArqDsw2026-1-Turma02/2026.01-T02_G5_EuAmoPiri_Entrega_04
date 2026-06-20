import type { Request, Response } from "express";
import * as experienceService from "../services/experienceService.ts";
import { ExperienceError } from "../services/experienceService.ts";
import { formatExperience, formatExperienceList } from "../views/experienceView.ts";

export async function createExperience(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const { placeId } = req.params;

    try {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        const newExperience = await experienceService.createExperience(
            req.user.id,
            req.user.name,
            Number(placeId),
            req.body,
            files
        );
        res.status(201).json(formatExperience(newExperience));
    } catch (err) {
        if (err instanceof ExperienceError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao cadastrar a experiencia" });
    }
}

export async function listExperiences(req: Request, res: Response) {
    const { placeId } = req.params;
    try {
        const experiences = await experienceService.listExperiencesByPlace(Number(placeId));
        res.status(200).json(formatExperienceList(experiences, Number(placeId)));
    } catch {
        res.status(500).json({ error: "Erro ao buscar as experiencias" });
    }
}

export async function getExperiencePhoto(req: Request, res: Response) {
    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    const photoId = Number(req.params.photoId);

    if (Number.isNaN(placeId) || Number.isNaN(experienceId) || Number.isNaN(photoId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await experienceService.getExperiencePhotoStream(experienceId, photoId);
        if (!result) {
            res.status(404).json({ error: "Foto não encontrada" });
            return;
        }
        res.setHeader("Content-Type", result.contentType);
        res.setHeader("Cache-Control", "public, max-age=3600");
        result.stream.on("error", () => {
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao carregar foto" });
            }
        });
        result.stream.pipe(res);
    } catch {
        res.status(500).json({ error: "Erro ao carregar foto" });
    }
}

export async function updateExperience(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    if (Number.isNaN(placeId) || Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        const updated = await experienceService.updateExperience(
            req.user.id,
            placeId,
            experienceId,
            req.body,
            files
        );
        res.status(200).json(formatExperience(updated, placeId));
    } catch (err) {
        if (err instanceof ExperienceError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao atualizar o relato" });
    }
}

export async function deleteExperience(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    const placeId = Number(req.params.placeId);
    const experienceId = Number(req.params.experienceId);
    if (Number.isNaN(placeId) || Number.isNaN(experienceId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        await experienceService.deleteExperience(req.user.id, placeId, experienceId);
        res.status(204).send();
    } catch (err) {
        if (err instanceof ExperienceError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao excluir o relato" });
    }
}
