const BLACKLIST = [
    "idiota",
    "burro",
    "merda",
    "porra",
    "caralho",
    "fdp",
    "otario",
    "imbecil",
    "estupido",
    "babaca",
    "lixo",
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

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function containsBlacklistedWord(text: string): boolean {
    const normalized = normalize(text);

    if (PHRASE_BLACKLIST.some((phrase) => normalized.includes(phrase))) {
        return true;
    }

    return BLACKLIST.some((word) => {
        const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
        return pattern.test(normalized);
    });
}

export function getBlacklistWords(): readonly string[] {
    return [...BLACKLIST, ...PHRASE_BLACKLIST];
}
