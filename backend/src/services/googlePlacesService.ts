import {
    GOOGLE_PLACES_FIELD_MASK,
    GOOGLE_PLACES_TEXT_SEARCH_URL,
    PIRI_CENTER_LAT,
    PIRI_CENTER_LNG,
    PIRI_SEARCH_RADIUS_M,
    PIRI_TEXT_SEARCH_QUERIES,
} from "../constants/piriRegion.ts";
import {
    mapGooglePlaceToCategory,
    placeCategoryToApiLabel,
} from "./placeCategoryMapper.ts";
import { clearGooglePlacesCache } from "./googlePlacesCache.ts";

export class GooglePlacesError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = "GooglePlacesError";
    }
}

export interface GooglePlaceDto {
    id: string;
    googlePlaceId: string;
    name: string;
    category: "cachoeira" | "restaurante" | "pousada";
    address: string;
    lat: number;
    lng: number;
    mapsLink: string;
    source: "google";
    catalogOnly: boolean;
    rating: number | null;
    reviewsCount: number;
    description: string;
    coverImage: string | null;
}

interface GoogleTextSearchPlace {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    types?: string[];
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    photos?: { name?: string }[];
    editorialSummary?: { text?: string };
}

interface GoogleTextSearchResponse {
    places?: GoogleTextSearchPlace[];
}

interface GoogleErrorBody {
    error?: {
        message?: string;
        details?: { reason?: string }[];
    };
}

function getCacheTtlMs(): number {
    const raw = process.env.GOOGLE_PLACES_CACHE_TTL_MS;
    const parsed = raw ? Number(raw) : 21_600_000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 21_600_000;
}

function getApiKey(): string {
    const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
    if (!key) {
        throw new GooglePlacesError(
            "GOOGLE_MAPS_API_KEY não configurada no backend (.env).",
            503,
            "GOOGLE_MAPS_API_KEY_MISSING"
        );
    }
    return key;
}

function extractPlaceId(rawId: string): string {
    return rawId.startsWith("places/") ? rawId.slice("places/".length) : rawId;
}

function buildPhotoUrl(photoName: string | undefined, apiKey: string): string | null {
    if (!photoName) return null;
    const params = new URLSearchParams({
        maxHeightPx: "400",
        maxWidthPx: "400",
        key: apiKey,
    });
    return `https://places.googleapis.com/v1/${photoName}/media?${params.toString()}`;
}

function formatGooglePlace(place: GoogleTextSearchPlace, apiKey: string): GooglePlaceDto | null {
    const name = place.displayName?.text?.trim();
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const rawId = place.id?.trim();

    if (!name || !rawId || lat == null || lng == null) {
        return null;
    }

    const category = mapGooglePlaceToCategory(place.types, name);
    if (!category) {
        return null;
    }

    const googlePlaceId = extractPlaceId(rawId);
    const description =
        place.editorialSummary?.text?.trim() ||
        `${name} — local em Pirenópolis importado do Google Maps.`;

    return {
        id: `gmaps:${googlePlaceId}`,
        googlePlaceId,
        name,
        category: placeCategoryToApiLabel(category) as GooglePlaceDto["category"],
        address: place.formattedAddress?.trim() || "Pirenópolis, GO",
        lat,
        lng,
        mapsLink:
            place.googleMapsUri?.trim() ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " Pirenópolis")}`,
        source: "google",
        catalogOnly: true,
        rating: place.rating ?? null,
        reviewsCount: place.userRatingCount ?? 0,
        description,
        coverImage: buildPhotoUrl(place.photos?.[0]?.name, apiKey),
    };
}

function parseGoogleApiError(status: number, body: string): GooglePlacesError {
    let parsed: GoogleErrorBody = {};
    try {
        parsed = JSON.parse(body) as GoogleErrorBody;
    } catch {
        /* mantém parsed vazio */
    }

    const reason = parsed.error?.details?.find((d) => d.reason)?.reason;
    const googleMessage = parsed.error?.message;

    if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        return new GooglePlacesError(
            "A chave GOOGLE_MAPS_API_KEY está restrita a sites (HTTP referrers). " +
                "O backend chama a API sem referrer — crie uma chave separada para servidor " +
                'com restrição "Nenhuma" (dev) ou "Endereços IP", e habilite "Places API (New)".',
            503,
            "API_KEY_HTTP_REFERRER_BLOCKED"
        );
    }

    if (status === 403) {
        return new GooglePlacesError(
            googleMessage ??
                "Acesso negado pela Google Places API. Verifique a chave e se a Places API (New) está ativa.",
            503,
            reason ?? "GOOGLE_PLACES_FORBIDDEN"
        );
    }

    return new GooglePlacesError(
        googleMessage ?? `Google Places API retornou erro ${status}.`,
        502,
        reason ?? "GOOGLE_PLACES_ERROR"
    );
}

/**
 * Adapter/Facade sobre a Google Places API (New) — Text Search.
 * Delimita buscas à região de Pirenópolis via locationBias circular.
 */
async function searchTextQuery(textQuery: string, apiKey: string): Promise<GoogleTextSearchPlace[]> {
    const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
        },
        body: JSON.stringify({
            textQuery,
            locationBias: {
                circle: {
                    center: {
                        latitude: PIRI_CENTER_LAT,
                        longitude: PIRI_CENTER_LNG,
                    },
                    radius: PIRI_SEARCH_RADIUS_M,
                },
            },
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`Google Places API error (${response.status}): ${body}`);
        throw parseGoogleApiError(response.status, body);
    }

    const data = (await response.json()) as GoogleTextSearchResponse;
    return data.places ?? [];
}

/** Busca todos os locais categorizados na API Google (sem persistir). */
export async function fetchAllGooglePlacesFromApi(): Promise<GooglePlaceDto[]> {
    const apiKey = getApiKey();
    const byId = new Map<string, GooglePlaceDto>();

    for (const query of PIRI_TEXT_SEARCH_QUERIES) {
        const rawPlaces = await searchTextQuery(query, apiKey);
        for (const raw of rawPlaces) {
            const formatted = formatGooglePlace(raw, apiKey);
            if (formatted && !byId.has(formatted.googlePlaceId)) {
                byId.set(formatted.googlePlaceId, formatted);
            }
        }
    }

    return Array.from(byId.values());
}

/** Expõe limpeza de cache para testes. */
export { clearGooglePlacesCache };
