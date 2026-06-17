import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(_req, file, cb) {
        if (ALLOWED_MIMES.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Formato de imagem inválido. Use JPG ou PNG."));
    },
});

export const profilePhotoUpload = upload.single("profilePhoto");

export function handleProfilePhotoUploadError(
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    if (!err) {
        next();
        return;
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: "A imagem deve ter no máximo 5 MB" });
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
