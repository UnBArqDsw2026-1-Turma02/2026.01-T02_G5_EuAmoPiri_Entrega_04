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

    it("detecta termos de racismo estrutural", () => {
        expect(containsBlacklistedWord("Não use denegrir nesse contexto")).toBe(true);
        expect(containsBlacklistedWord("Comprei no mercado negro")).toBe(true);
    });

    it("detecta termos capacitistas", () => {
        expect(containsBlacklistedWord("Isso é retardado")).toBe(true);
        expect(containsBlacklistedWord("Ele é surdo-mudo")).toBe(true);
    });

    it("detecta termos de gênero e machismo", () => {
        expect(containsBlacklistedWord("Isso é coisa de mulher")).toBe(true);
        expect(containsBlacklistedWord("Um homem de verdade faria isso")).toBe(true);
    });
});
