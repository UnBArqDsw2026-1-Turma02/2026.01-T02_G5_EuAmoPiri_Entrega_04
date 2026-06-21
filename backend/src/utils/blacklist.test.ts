import { describe, it, expect } from "vitest";
import { containsBlacklistedWord } from "./blacklist.ts";

describe("blacklist", () => {
    it("detecta palavra proibida", () => {
        expect(containsBlacklistedWord("Esse lugar é uma merda")).toBe(true);
    });

    it("detecta bosta isolada ou no relato", () => {
        expect(containsBlacklistedWord("bosta")).toBe(true);
        expect(containsBlacklistedWord(`bosta\nmerda ${"s".repeat(90)}`)).toBe(true);
    });

    it("detecta palavrão no título do relato", () => {
        expect(containsBlacklistedWord("Experiência bosta", "Texto limpo ".repeat(10))).toBe(true);
    });

    it("detecta ofuscação simples", () => {
        expect(containsBlacklistedWord("b0sta m3rda")).toBe(true);
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
