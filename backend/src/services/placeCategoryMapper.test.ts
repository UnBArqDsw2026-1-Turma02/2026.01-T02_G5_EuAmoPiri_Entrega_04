import { describe, it, expect } from "vitest";
import { mapGooglePlaceToCategory, placeCategoryToApiLabel } from "./placeCategoryMapper.ts";

describe("placeCategoryMapper", () => {
    it("mapeia type lodging como POUSADA (BDD 1)", () => {
        expect(mapGooglePlaceToCategory(["lodging", "point_of_interest"], "Pousada Solar")).toBe("POUSADA");
    });

    it("mapeia type restaurant como RESTAURANTE", () => {
        expect(mapGooglePlaceToCategory(["restaurant", "food"], "Restaurante LovePiri")).toBe("RESTAURANTE");
    });

    it("mapeia natural_feature como CACHOEIRA", () => {
        expect(mapGooglePlaceToCategory(["natural_feature"], "Poço Azul")).toBe("CACHOEIRA");
    });

    it("mapeia nome contendo cachoeira como CACHOEIRA", () => {
        expect(mapGooglePlaceToCategory(["tourist_attraction"], "Cachoeira da Rosário")).toBe("CACHOEIRA");
    });

    it("descarta types não mapeados", () => {
        expect(mapGooglePlaceToCategory(["church", "place_of_worship"], "Igreja Matriz")).toBeNull();
    });

    it("converte enum para label da API", () => {
        expect(placeCategoryToApiLabel("POUSADA")).toBe("pousada");
        expect(placeCategoryToApiLabel("RESTAURANTE")).toBe("restaurante");
        expect(placeCategoryToApiLabel("CACHOEIRA")).toBe("cachoeira");
    });
});
