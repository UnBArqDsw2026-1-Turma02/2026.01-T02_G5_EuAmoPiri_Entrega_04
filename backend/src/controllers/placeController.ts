import type { Request, Response } from "express";
import * as placeService from "../services/placeService.ts";
import { PlaceError } from "../services/placeService.ts";
import { formatPlace, formatPlaceList } from "../views/placeView.ts";

export async function createPlace(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    try {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        const newPlace = await placeService.createPlace(req.user.id, req.body, files);
        res.status(201).json(formatPlace(newPlace));
    } catch (err) {
        if (err instanceof PlaceError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao cadastrar o local" });
    }
}

export async function listPlaces(req: Request, res: Response) {
    try {
        const moradorIdParam = req.query.moradorId;
        const moradorId = moradorIdParam !== undefined ? Number(moradorIdParam) : undefined;
        const places = await placeService.listPlaces(
            moradorId !== undefined && !Number.isNaN(moradorId) ? moradorId : undefined
        );
        res.status(200).json(formatPlaceList(places));
    } catch {
        res.status(500).json({ error: "Erro ao buscar os locais" });
    }
}

export async function getPlaceById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    try {
        const place = await placeService.getPlaceById(id);
        if (!place) {
            res.status(404).json({ error: "Local não encontrado" });
            return;
        }
        res.status(200).json(formatPlace(place));
    } catch {
        res.status(500).json({ error: "Erro ao buscar o local" });
    }
}

export async function getPlacePhoto(req: Request, res: Response) {
    const placeId = Number(req.params.placeId);
    const photoId = Number(req.params.photoId);
    if (Number.isNaN(placeId) || Number.isNaN(photoId)) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
    }

    try {
        const result = await placeService.getPlacePhotoStream(placeId, photoId);
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
