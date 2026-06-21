import * as commentModel from "../model/commentModel.ts";
import * as experienceModel from "../model/experienceModel.ts";
import { containsBlacklistedWord } from "../utils/blacklist.ts";

const MIN_TEXT_LENGTH = 3;
const MAX_TEXT_LENGTH = 500;

export class CommentError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "CommentError";
    }
}

function validateCommentText(text: string) {
    const trimmed = text.trim();

    if (!trimmed) {
        throw new CommentError("O comentário não pode estar vazio", 400, "RNF01");
    }

    if (trimmed.length < MIN_TEXT_LENGTH) {
        throw new CommentError(
            `O comentário deve ter no mínimo ${MIN_TEXT_LENGTH} caracteres`,
            400,
            "MIN_TEXT_LENGTH"
        );
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
        throw new CommentError(
            `O comentário deve ter no máximo ${MAX_TEXT_LENGTH} caracteres`,
            400,
            "RNF03"
        );
    }

    if (containsBlacklistedWord(trimmed)) {
        throw new CommentError(
            "Revise o conteúdo e tente novamente, mantendo uma linguagem respeitosa.",
            400,
            "BLACKLISTED_CONTENT"
        );
    }

    return trimmed;
}

/** Valida cadeia Local → Relato antes de operar no comentário. */
async function assertRelatoNoLocal(placeId: number, experienceId: number) {
    const relato = await experienceModel.findExperienceByIdAndPlaceId(experienceId, placeId);
    if (!relato) {
        throw new CommentError("Relato não encontrado neste local", 404);
    }
    return relato;
}

export async function createComment(
    userId: number,
    placeId: number,
    experienceId: number,
    text: string
) {
    await assertRelatoNoLocal(placeId, experienceId);
    const validatedText = validateCommentText(text);

    return commentModel.createComment(experienceId, userId, validatedText);
}

export async function listCommentsByExperience(placeId: number, experienceId: number) {
    await assertRelatoNoLocal(placeId, experienceId);
    return commentModel.findCommentsByExperienceId(experienceId);
}

export async function getCommentCountsByExperienceIds(experienceIds: number[]) {
    const rows = await commentModel.countCommentsByExperienceIds(experienceIds);
    const map = new Map<number, number>();
    for (const row of rows) {
        map.set(row.experienceId, row._count._all);
    }
    return map;
}
