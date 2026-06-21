import { describe, it, expect, beforeEach } from "vitest";
import { setCatalogExtras, clearGooglePlacesCache } from "./googlePlacesCache.ts";
import { getPaginatedGoogleCatalog, getCatalogPlaceById } from "./googlePlacesCatalogService.ts";

describe("googlePlacesCatalogService", () => {
    beforeEach(() => {
        clearGooglePlacesCache();
        setCatalogExtras(
            Array.from({ length: 25 }, (_, i) => ({
                id: `gmaps:extra-${i}`,
                googlePlaceId: `extra-${i}`,
                name: `Extra ${i}`,
                category: i % 2 === 0 ? "restaurante" : "cachoeira",
                address: "Pirenópolis",
                lat: -15.85,
                lng: -48.95,
                mapsLink: "https://maps.google.com",
                source: "google" as const,
                rating: 4,
                reviewsCount: 10,
                description: "extra",
                coverImage: null,
                catalogOnly: true,
            })),
            60_000
        );
    });

    it("pagina resultados", () => {
        const page1 = getPaginatedGoogleCatalog(1, 10, undefined);
        expect(page1.items).toHaveLength(10);
        expect(page1.total).toBe(25);
        expect(page1.totalPages).toBe(3);

        const page3 = getPaginatedGoogleCatalog(3, 10, undefined);
        expect(page3.items).toHaveLength(5);
    });

    it("filtra por categoria", () => {
        const result = getPaginatedGoogleCatalog(1, 50, "restaurante");
        expect(result.items.every((p) => p.category === "restaurante")).toBe(true);
    });

    it("busca local extra por id", () => {
        const found = getCatalogPlaceById("gmaps:extra-3");
        expect(found?.name).toBe("Extra 3");
        expect(getCatalogPlaceById("extra-3")?.id).toBe("gmaps:extra-3");
        expect(getCatalogPlaceById("missing")).toBeNull();
    });
});
