import { describe, it, expect, vi, beforeEach } from "vitest";
import * as placeModel from "../model/placeModel.ts";
import * as storageService from "./storageService.ts";
import * as googlePlacesService from "./googlePlacesService.ts";
import { PlaceError, getPlaceCoverStream, updatePlace, deletePlace } from "./placeService.ts";

vi.mock("../model/placeModel.ts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../model/placeModel.ts")>();
    return {
        ...actual,
        findPlaceById: vi.fn(),
        findDuplicatePlace: vi.fn(),
        updatePlaceById: vi.fn(),
        deletePlaceById: vi.fn(),
        replacePlacePhotos: vi.fn(),
    };
});
vi.mock("./storageService.ts");
vi.mock("./googlePlacesService.ts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./googlePlacesService.ts")>();
    return {
        ...actual,
        fetchExternalPhotoMedia: vi.fn(),
    };
});

const basePlace = {
    id: 1,
    name: "Botequim",
    address: "R. Direita, 68",
    category: "RESTAURANTE" as const,
    description: "Descrição longa do local para testes.",
    mapsLink: null,
    phone: null,
    openingDate: null,
    moradorId: 10,
    createdAt: new Date(),
    photos: [{ id: 1, placeId: 1, url: "places/1/0.jpg", sortOrder: 0 }],
    morador: { id: 10, name: "Morador" },
    experiences: [],
};

const validInput = {
    name: "Botequim Atualizado",
    address: "R. Direita, 70",
    category: "RESTAURANTE",
    description: "Nova descrição do local para testes de edição.",
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.uploadBuffer).mockResolvedValue(undefined);
    vi.mocked(storageService.deleteObject).mockResolvedValue(undefined);
});

describe("placeService update/delete", () => {
    it("atualiza local quando morador é o dono", async () => {
        vi.mocked(placeModel.findPlaceById)
            .mockResolvedValueOnce(basePlace as never)
            .mockResolvedValueOnce({ ...basePlace, name: validInput.name } as never);
        vi.mocked(placeModel.findDuplicatePlace).mockResolvedValue(null);
        vi.mocked(placeModel.updatePlaceById).mockResolvedValue({ ...basePlace, name: validInput.name } as never);

        const result = await updatePlace(1, 10, validInput, []);

        expect(result.name).toBe(validInput.name);
        expect(placeModel.updatePlaceById).toHaveBeenCalled();
    });

    it("rejeita update quando morador não é dono", async () => {
        vi.mocked(placeModel.findPlaceById).mockResolvedValue(basePlace as never);

        await expect(updatePlace(1, 99, validInput, [])).rejects.toMatchObject({
            statusCode: 403,
            code: "FORBIDDEN_OWNER",
        });
    });

    it("rejeita update com duplicata de nome/endereço", async () => {
        vi.mocked(placeModel.findPlaceById).mockResolvedValue(basePlace as never);
        vi.mocked(placeModel.findDuplicatePlace).mockResolvedValue({ id: 2, name: "x", address: "y" });

        await expect(updatePlace(1, 10, validInput, [])).rejects.toMatchObject({
            statusCode: 409,
            code: "PLACE_DUPLICATE",
        });
    });

    it("exclui local e remove fotos do storage", async () => {
        vi.mocked(placeModel.findPlaceById).mockResolvedValue(basePlace as never);
        vi.mocked(placeModel.deletePlaceById).mockResolvedValue(basePlace as never);

        await deletePlace(1, 10);

        expect(placeModel.deletePlaceById).toHaveBeenCalledWith(1);
        expect(storageService.deleteObject).toHaveBeenCalledWith("places/1/0.jpg");
    });

    it("rejeita delete quando morador não é dono", async () => {
        vi.mocked(placeModel.findPlaceById).mockResolvedValue(basePlace as never);

        await expect(deletePlace(1, 99)).rejects.toMatchObject({
            statusCode: 403,
            code: "FORBIDDEN_OWNER",
        });
    });
});

describe("getPlaceCoverStream", () => {
    it("usa proxy Google quando local não tem fotos no GCS", async () => {
        const googlePlace = {
            ...basePlace,
            photos: [],
            externalPhotoUrl: "https://places.googleapis.com/v1/places/x/photos/y/media?key=z",
        };
        const mockStream = { pipe: vi.fn() };
        vi.mocked(placeModel.findPlaceById).mockResolvedValue(googlePlace as never);
        vi.mocked(googlePlacesService.fetchExternalPhotoMedia).mockResolvedValue({
            stream: mockStream as never,
            contentType: "image/jpeg",
        });

        const result = await getPlaceCoverStream(1);

        expect(googlePlacesService.fetchExternalPhotoMedia).toHaveBeenCalledWith(
            googlePlace.externalPhotoUrl
        );
        expect(result?.contentType).toBe("image/jpeg");
    });
});

describe("PlaceError", () => {
    it("expõe statusCode e code", () => {
        const err = new PlaceError("msg", 404, "NOT_FOUND");
        expect(err).toBeInstanceOf(Error);
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe("NOT_FOUND");
    });
});
