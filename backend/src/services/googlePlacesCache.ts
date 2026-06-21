import type { GooglePlaceDto } from "./googlePlacesService.ts";

/** Catálogo paginável — locais Google além dos sincronizados no banco. */
interface CatalogCache {
    extras: GooglePlaceDto[];
    expiresAt: number;
}

let catalogCache: CatalogCache | null = null;

export function getCatalogExtras(): GooglePlaceDto[] | null {
    if (!catalogCache || Date.now() >= catalogCache.expiresAt) {
        return null;
    }
    return catalogCache.extras;
}

export function setCatalogExtras(extras: GooglePlaceDto[], ttlMs: number): void {
    catalogCache = {
        extras,
        expiresAt: Date.now() + ttlMs,
    };
}

export function clearGooglePlacesCache(): void {
    catalogCache = null;
}

export function getCacheTtlMs(): number {
    const raw = process.env.GOOGLE_PLACES_CACHE_TTL_MS;
    const parsed = raw ? Number(raw) : 21_600_000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 21_600_000;
}
