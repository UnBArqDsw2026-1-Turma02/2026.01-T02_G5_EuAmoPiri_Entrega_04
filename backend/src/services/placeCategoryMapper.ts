import type { PlaceCategory } from "../../generated/prisma/client.ts";

const POUSADA_TYPES = new Set([
    "lodging",
    "hotel",
    "guest_house",
    "motel",
    "hostel",
    "bed_and_breakfast",
]);

const RESTAURANTE_TYPES = new Set([
    "restaurant",
    "food",
    "cafe",
    "bar",
    "meal_takeaway",
    "meal_delivery",
    "bakery",
]);

const CACHOEIRA_TYPES = new Set(["natural_feature", "park", "tourist_attraction"]);

/**
 * Strategy/Mapper: traduz o vocabulário de types do Google Places
 * para o enum de domínio PlaceCategory do Eu Amo Piri.
 */
export function mapGooglePlaceToCategory(
    types: string[] | undefined,
    name: string
): PlaceCategory | null {
    const normalizedTypes = (types ?? []).map((t) => t.toLowerCase());
    const normalizedName = name.trim().toLowerCase();

    if (normalizedName.includes("cachoeira")) {
        return "CACHOEIRA";
    }

    if (normalizedTypes.some((t) => POUSADA_TYPES.has(t))) {
        return "POUSADA";
    }

    if (normalizedTypes.some((t) => RESTAURANTE_TYPES.has(t))) {
        return "RESTAURANTE";
    }

    if (normalizedTypes.some((t) => CACHOEIRA_TYPES.has(t))) {
        return "CACHOEIRA";
    }

    return null;
}

const CATEGORY_API_LABELS: Record<PlaceCategory, string> = {
    CACHOEIRA: "cachoeira",
    RESTAURANTE: "restaurante",
    POUSADA: "pousada",
};

export function placeCategoryToApiLabel(category: PlaceCategory): string {
    return CATEGORY_API_LABELS[category];
}
