import type { Request, Response } from "express";
import * as experienceReportService from "../services/experienceReportService.ts";
import { ReportError } from "../services/experienceReportService.ts";

export async function reportExperience(req: Request, res: Response) {
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
        const result = await experienceReportService.reportExperience(
            req.user.id,
            placeId,
            experienceId,
            req.body
        );
        res.status(201).json(result);
    } catch (err) {
        if (err instanceof ReportError) {
            res.status(err.statusCode).json({ error: err.message, code: err.code });
            return;
        }
        res.status(500).json({ error: "Erro ao registrar denúncia" });
    }
}
