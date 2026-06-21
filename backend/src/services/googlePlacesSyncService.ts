import type { PlaceCategory } from "../../generated/prisma/client.ts";
import * as placeModel from "../model/placeModel.ts";
import {
    fetchAllGooglePlacesFromApi,
    getSyncPerCategory,
    type GooglePlaceDto,
} from "./googlePlacesService.ts";

const CATEGORY_TO_ENUM: Record<GooglePlaceDto["category"], PlaceCategory> = {
    cachoeira: "CACHOEIRA",
    restaurante: "RESTAURANTE",
    pousada: "POUSADA",
};

function sortByPopularity(a: GooglePlaceDto, b: GooglePlaceDto): number {
    const reviewsDiff = (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
    if (reviewsDiff !== 0) return reviewsDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
}

function groupByCategory(places: GooglePlaceDto[]): Record<GooglePlaceDto["category"], GooglePlaceDto[]> {
    const groups: Record<GooglePlaceDto["category"], GooglePlaceDto[]> = {
        cachoeira: [],
        restaurante: [],
        pousada: [],
    };

    for (const place of places) {
        groups[place.category].push(place);
    }

    for (const key of Object.keys(groups) as GooglePlaceDto["category"][]) {
        groups[key].sort(sortByPopularity);
    }

    return groups;
}

export interface GoogleSyncResult {
    synced: number;
    perCategory: Record<string, number>;
}

/**
 * Sincroniza os top N locais por categoria no PostgreSQL (N = GOOGLE_SYNC_PER_CATEGORY).
 */
export async function syncGooglePlacesToDatabase(): Promise<GoogleSyncResult> {
    const perCategory = getSyncPerCategory();
    const allPlaces = await fetchAllGooglePlacesFromApi();
    const groups = groupByCategory(allPlaces);

    const perCategoryCounts: Record<string, number> = {};
    let synced = 0;

    for (const [category, list] of Object.entries(groups) as [GooglePlaceDto["category"], GooglePlaceDto[]][]) {
        const top = list.slice(0, perCategory);
        perCategoryCounts[category] = top.length;

        for (const place of top) {
            await placeModel.upsertGoogleSyncedPlace({
                googlePlaceId: place.googlePlaceId,
                name: place.name,
                category: CATEGORY_TO_ENUM[category],
                description: place.description,
                address: place.address,
                mapsLink: place.mapsLink,
                latitude: place.lat,
                longitude: place.lng,
                externalPhotoUrl: place.coverImage,
                googleRating: place.rating,
                googleReviewCount: place.reviewsCount ?? 0,
            });
            synced += 1;
        }
    }

    console.log(`Google Places sync: ${synced} locais no banco.`);

    return { synced, perCategory: perCategoryCounts };
}
