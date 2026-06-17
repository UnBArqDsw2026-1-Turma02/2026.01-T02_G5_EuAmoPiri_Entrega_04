export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIMES = new Set(["image/jpeg", "image/png"]);

export class PhotoValidationError extends Error {
    constructor(
        message: string,
        public statusCode = 400
    ) {
        super(message);
        this.name = "PhotoValidationError";
    }
}

export function validatePhotoFiles(files: Express.Multer.File[] | undefined, options: { min: number; max: number }): void {
    const list = files ?? [];
    if (list.length < options.min) {
        throw new PhotoValidationError(`Envie entre ${options.min} e ${options.max} foto(s).`);
    }
    if (list.length > options.max) {
        throw new PhotoValidationError(`Máximo de ${options.max} foto(s) permitido(s).`);
    }
    for (const file of list) {
        if (!ALLOWED_PHOTO_MIMES.has(file.mimetype)) {
            throw new PhotoValidationError("Formato de imagem inválido. Use JPG ou PNG.");
        }
        if (file.size > MAX_PHOTO_SIZE) {
            throw new PhotoValidationError("Cada imagem deve ter no máximo 5 MB.");
        }
    }
}
