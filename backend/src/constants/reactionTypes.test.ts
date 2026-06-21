import { describe, it, expect } from "vitest";
import { parseReactionKey, reactionEnumToKey, reactionKeyToEnum } from "../constants/reactionTypes.ts";

describe("reactionTypes", () => {
    it("aceita chaves válidas", () => {
        expect(parseReactionKey("heart")).toBe("heart");
        expect(parseReactionKey("like")).toBe("like");
    });

    it("rejeita dislike e outras chaves inválidas", () => {
        expect(parseReactionKey("dislike")).toBeNull();
        expect(parseReactionKey("gem")).toBeNull();
        expect(parseReactionKey("")).toBeNull();
    });

    it("converte key ↔ enum", () => {
        expect(reactionKeyToEnum("heart")).toBe("HEART");
        expect(reactionEnumToKey("LIKE")).toBe("like");
    });
});
