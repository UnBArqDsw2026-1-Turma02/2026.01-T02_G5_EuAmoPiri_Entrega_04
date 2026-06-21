import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clearGooglePlacesCache, fetchAllGooglePlacesFromApi } from "./googlePlacesService.ts";

const mockPlace = {
    id: "places/ChIJ123",
    displayName: { text: "Cachoeira da Rosário" },
    formattedAddress: "Estrada da Rosário, Pirenópolis, GO",
    location: { latitude: -15.8312, longitude: -48.9423 },
    types: ["natural_feature", "tourist_attraction"],
    rating: 4.8,
    userRatingCount: 120,
    googleMapsUri: "https://maps.google.com/?cid=123",
};

describe("googlePlacesService", () => {
    beforeEach(() => {
        clearGooglePlacesCache();
        vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
        clearGooglePlacesCache();
    });

    it("lança erro sem API key", async () => {
        vi.stubEnv("GOOGLE_MAPS_API_KEY", "");
        await expect(fetchAllGooglePlacesFromApi()).rejects.toMatchObject({
            code: "GOOGLE_MAPS_API_KEY_MISSING",
        });
    });

    it("busca e deduplica lugares do Google", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ places: [mockPlace, mockPlace] }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchAllGooglePlacesFromApi();

        expect(fetchMock).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            googlePlaceId: "ChIJ123",
            name: "Cachoeira da Rosário",
            category: "cachoeira",
        });
    });
});
