import type { GooglePlaceDto } from "./googlePlacesService.ts";
import { getCatalogExtras } from "./googlePlacesCache.ts";

export interface PaginatedGoogleCatalog {
    items: GooglePlaceDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

function parsePositiveInt(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function getPaginatedGoogleCatalog(
    pageParam: unknown,
    limitParam: unknown,
    categoryParam?: unknown
): PaginatedGoogleCatalog {
    const page = parsePositiveInt(pageParam, 1);
    const limit = Math.min(parsePositiveInt(limitParam, 12), 50);
    const category =
        typeof categoryParam === "string" && categoryParam.trim() !== ""
            ? categoryParam.trim().toLowerCase()
            : undefined;

    const extras = getCatalogExtras() ?? [];
    const filtered = category
        ? extras.filter((p) => p.category === category)
        : extras;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;

    return {
        items: filtered.slice(start, start + limit),
        page: safePage,
        limit,
        total,
        totalPages,
    };
}

/** Local extra do catálogo (não persistido) por googlePlaceId ou id `gmaps:…`. */
export function getCatalogPlaceById(idParam: string): GooglePlaceDto | null {
    const extras = getCatalogExtras() ?? [];
    const raw = idParam.trim();
    if (!raw) return null;

    const googlePlaceId = raw.startsWith("gmaps:") ? raw.slice("gmaps:".length) : raw;

    return (
        extras.find(
            (p) => p.googlePlaceId === googlePlaceId || p.id === raw || p.id === `gmaps:${googlePlaceId}`
        ) ?? null
    );
}
