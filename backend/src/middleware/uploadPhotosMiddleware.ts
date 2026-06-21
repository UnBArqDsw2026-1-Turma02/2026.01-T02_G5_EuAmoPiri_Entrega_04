import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { ALLOWED_PHOTO_MIMES, MAX_PHOTO_SIZE } from "../utils/photoValidation.ts";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PHOTO_SIZE },
    fileFilter(_req, file, cb) {
        if (ALLOWED_PHOTO_MIMES.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Formato de imagem inválido. Use JPG ou PNG."));
    },
});

export const uploadPlacePhotos = upload.array("photos", 3);
export const uploadExperiencePhotos = upload.array("photos", 3);

export function handlePhotoUploadError(err: unknown, _req: Request, res: Response, next: NextFunction) {
    if (!err) {
        next();
        return;
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: "Cada imagem deve ter no máximo 5 MB" });
            return;
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            res.status(400).json({ error: "Máximo de 3 fotos permitido" });
            return;
        }
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
    }

    next(err);
}
