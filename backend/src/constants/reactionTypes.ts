import type { ReactionType } from "../../generated/prisma/client.ts";

export const ALLOWED_REACTION_KEYS = ["heart", "like"] as const;
export type ReactionKey = (typeof ALLOWED_REACTION_KEYS)[number];

const KEY_TO_ENUM: Record<ReactionKey, ReactionType> = {
    heart: "HEART",
    like: "LIKE",
};

const ENUM_TO_KEY: Record<ReactionType, ReactionKey> = {
    HEART: "heart",
    LIKE: "like",
};

export function parseReactionKey(key: string): ReactionKey | null {
    if (ALLOWED_REACTION_KEYS.includes(key as ReactionKey)) {
        return key as ReactionKey;
    }
    return null;
}

export function reactionKeyToEnum(key: ReactionKey): ReactionType {
    return KEY_TO_ENUM[key];
}

export function reactionEnumToKey(type: ReactionType): ReactionKey {
    return ENUM_TO_KEY[type];
}

export function emptyReactionCounts(): Record<ReactionKey, number> {
    return { heart: 0, like: 0 };
}
