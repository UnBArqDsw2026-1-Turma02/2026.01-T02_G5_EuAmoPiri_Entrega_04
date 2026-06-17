import { describe, it, expect } from "vitest";
import { containsBlacklistedWord } from "./blacklist.ts";

describe("blacklist", () => {
    it("detecta palavra proibida", () => {
        expect(containsBlacklistedWord("Esse lugar é uma merda")).toBe(true);
    });

    it("aceita texto limpo", () => {
        expect(containsBlacklistedWord("Experiência maravilhosa em Pirenópolis")).toBe(false);
    });

    it("ignora acentos na detecção", () => {
        expect(containsBlacklistedWord("Que otário")).toBe(true);
    });
});
