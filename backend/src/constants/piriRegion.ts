/** Centro geográfico de Pirenópolis (GO) — usado como locationBias na Places API. */
export const PIRI_CENTER_LAT = Number(process.env.PIRI_CENTER_LAT ?? -15.8503);
export const PIRI_CENTER_LNG = Number(process.env.PIRI_CENTER_LNG ?? -48.9571);
export const PIRI_SEARCH_RADIUS_M = Number(process.env.PIRI_SEARCH_RADIUS_M ?? 12000);

export const PIRI_TEXT_SEARCH_QUERIES = [
    "pousada em Pirenópolis GO",
    "restaurante em Pirenópolis GO",
    "cachoeira em Pirenópolis GO",
] as const;

export const GOOGLE_PLACES_TEXT_SEARCH_URL =
    "https://places.googleapis.com/v1/places:searchText";

export const GOOGLE_PLACES_FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "places.photos",
    "places.editorialSummary",
].join(",");
