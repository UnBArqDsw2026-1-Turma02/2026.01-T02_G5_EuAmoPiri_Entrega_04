import * as experienceModel from "../model/experienceModel.ts";
import * as reactionModel from "../model/reactionModel.ts";
import {
    emptyReactionCounts,
    parseReactionKey,
    reactionEnumToKey,
    reactionKeyToEnum,
    type ReactionKey,
} from "../constants/reactionTypes.ts";
import type { ReactionType } from "../../generated/prisma/client.ts";

export class ReactionError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "ReactionError";
    }
}

async function assertRelatoNoLocal(placeId: number, experienceId: number) {
    const relato = await experienceModel.findExperienceByIdAndPlaceId(experienceId, placeId);
    if (!relato) {
        throw new ReactionError("Relato não encontrado neste local", 404);
    }
    return relato;
}

export function buildReactionCountsFromGroup(
    rows: { experienceId: number; type: ReactionType; _count: { _all: number } }[]
) {
    const map = new Map<number, Record<ReactionKey, number>>();

    for (const row of rows) {
        const counts = map.get(row.experienceId) ?? emptyReactionCounts();
        const key = reactionEnumToKey(row.type);
        counts[key] = row._count._all;
        map.set(row.experienceId, counts);
    }

    return map;
}

export async function getReactionCountsByExperienceIds(experienceIds: number[]) {
    const rows = await reactionModel.countReactionsByExperienceIds(experienceIds);
    return buildReactionCountsFromGroup(rows);
}

export async function getUserReactionMap(userId: number, experienceIds: number[]) {
    const rows = await reactionModel.findUserReactionsByExperienceIds(userId, experienceIds);
    const map = new Map<number, ReactionKey>();
    for (const row of rows) {
        map.set(row.experienceId, reactionEnumToKey(row.type));
    }
    return map;
}

async function getReactionState(experienceId: number, userId?: number) {
    const countsMap = await getReactionCountsByExperienceIds([experienceId]);
    const reactions = countsMap.get(experienceId) ?? emptyReactionCounts();

    let myReaction: ReactionKey | null = null;
    if (userId !== undefined) {
        const userMap = await getUserReactionMap(userId, [experienceId]);
        myReaction = userMap.get(experienceId) ?? null;
    }

    return { reactions, myReaction };
}

export async function toggleReaction(
    userId: number,
    placeId: number,
    experienceId: number,
    reactionKeyRaw: string
) {
    await assertRelatoNoLocal(placeId, experienceId);

    const reactionKey = parseReactionKey(reactionKeyRaw);
    if (!reactionKey) {
        throw new ReactionError("Tipo de reação inválido", 400, "INVALID_REACTION_TYPE");
    }

    const existing = await reactionModel.findUserReaction(experienceId, userId);
    const enumType = reactionKeyToEnum(reactionKey);

    if (existing) {
        if (existing.type === enumType) {
            await reactionModel.deleteReaction(existing.id);
        } else {
            await reactionModel.updateReaction(existing.id, enumType);
        }
    } else {
        await reactionModel.createReaction(experienceId, userId, enumType);
    }

    return getReactionState(experienceId, userId);
}
