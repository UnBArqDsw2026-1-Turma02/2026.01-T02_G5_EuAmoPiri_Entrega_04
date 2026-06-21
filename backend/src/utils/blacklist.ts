const BLACKLIST = [
    // Palavrões comuns
    "bosta",
    "merda",
    "porra",
    "caralho",
    "cu",
    "puta",
    "putaria",
    "fdp",
    "pqp",
    "vtnc",
    "vtmnc",
    "foder",
    "fodase",
    "idiota",
    "burro",
    "otario",
    "imbecil",
    "estupido",
    "babaca",
    "lixo",
    "vagabundo",
    "vagabunda",
    "desgracado",
    "desgraca",
    "cuzao",
    "arrombado",
    "viado",
    "bicha",
    // Racismo estrutural
    "denegrir",
    "mulata",
    "criado-mudo",
    // Capacitismo
    "louco",
    "retardado",
    "surdo-mudo",
    "paralitico",
    // Gênero / machismo
    "mulherzinha",
];

const PHRASE_BLACKLIST = [
    "filho da puta",
    "filha da puta",
    "vai se foder",
    "vai tomar no cu",
    "tomar no cu",
    "servico de preto",
    "mercado negro",
    "inveja branca",
    "homem de verdade",
    "coisa de mulher",
];

function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function deobfuscate(text: string): string {
    return text
        .replace(/[@4]/g, "a")
        .replace(/3/g, "e")
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/\$/g, "s")
        .replace(/[^a-z0-9\s-]/g, " ");
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prepareText(text: string): string {
    return deobfuscate(normalize(text)).replace(/\s+/g, " ").trim();
}

function hasWholeWord(text: string, word: string): boolean {
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(word)}(?:[^a-z0-9]|$)`, "i");
    return pattern.test(text);
}

export function containsBlacklistedWord(...parts: (string | null | undefined)[]): boolean {
    const combined = prepareText(parts.filter(Boolean).join(" "));
    if (!combined) return false;

    if (PHRASE_BLACKLIST.some((phrase) => combined.includes(phrase))) {
        return true;
    }

    return BLACKLIST.some((word) => hasWholeWord(combined, word));
}

export function getBlacklistWords(): readonly string[] {
    return [...BLACKLIST, ...PHRASE_BLACKLIST];
}
