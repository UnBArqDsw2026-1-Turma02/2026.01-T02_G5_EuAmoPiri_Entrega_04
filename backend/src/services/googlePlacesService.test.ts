import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    fetchAllGooglePlacesFromApi,
    fetchExternalPhotoMedia,
    refreshExternalPhotoUrl,
    searchTextQueryAll,
} from "./googlePlacesService.ts";

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
        vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
        vi.stubEnv("GOOGLE_SYNC_PER_CATEGORY", "40");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
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

    it("pagina até maxResults quando há nextPageToken", async () => {
        const page1 = { places: [mockPlace], nextPageToken: "token-2" };
        const page2 = {
            places: [{
                ...mockPlace,
                id: "places/ChIJ456",
                displayName: { text: "Restaurante Piri" },
                types: ["restaurant"],
            }],
        };

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => page1 })
            .mockResolvedValueOnce({ ok: true, json: async () => page2 });
        vi.stubGlobal("fetch", fetchMock);

        const raw = await searchTextQueryAll("restaurante em Pirenópolis", "test-key", 40);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(raw).toHaveLength(2);
    });

    it("atualiza a chave da URL externa persistida", () => {
        const stored =
            "https://places.googleapis.com/v1/places/ChIJ123/photos/abc/media?maxHeightPx=400&maxWidthPx=400&key=old-key";
        const refreshed = refreshExternalPhotoUrl(stored);
        expect(refreshed).toContain("key=test-key");
        expect(refreshed).not.toContain("old-key");
    });

    it("busca foto externa via fetch server-side", async () => {
        const stored =
            "https://places.googleapis.com/v1/places/ChIJ123/photos/abc/media?maxHeightPx=400&maxWidthPx=400&key=old-key";
        const body = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array([1, 2, 3]));
                controller.close();
            },
        });
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            headers: new Headers({ "content-type": "image/jpeg" }),
            body,
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchExternalPhotoMedia(stored);

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("key=test-key"),
            { redirect: "follow" }
        );
        expect(result?.contentType).toBe("image/jpeg");
        expect(result?.stream).toBeDefined();
    });
});
