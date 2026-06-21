import type { Place, PlacePhoto, PlaceSource } from "../../generated/prisma/client.ts";

const CATEGORY_LABELS: Record<string, string> = {
    CACHOEIRA: "cachoeira",
    RESTAURANTE: "restaurante",
    POUSADA: "pousada",
};

const SOURCE_LABELS: Record<PlaceSource, string> = {
    COMMUNITY: "community",
    GOOGLE: "google",
};

type PlaceWithPhotos = Place & {
    photos?: PlacePhoto[];
    morador?: { id: number; name: string } | null;
    experiences?: { rating: number }[];
};

function computeRatingStats(experiences: { rating: number }[] = []) {
    const reviewsCount = experiences.length;
    if (reviewsCount === 0) {
        return { rating: null as number | null, reviewsCount: 0 };
    }
    const sum = experiences.reduce((acc, e) => acc + e.rating, 0);
    return {
        rating: Math.round((sum / reviewsCount) * 10) / 10,
        reviewsCount,
    };
}

function resolvePublicStats(place: PlaceWithPhotos) {
    const fromExperiences = computeRatingStats(place.experiences);
    if (fromExperiences.reviewsCount > 0) {
        return fromExperiences;
    }
    if ((place.googleReviewCount ?? 0) > 0 || place.googleRating != null) {
        return {
            rating: place.googleRating,
            reviewsCount: place.googleReviewCount ?? 0,
        };
    }
    return fromExperiences;
}

function formatPhoto(photo: PlacePhoto, placeId: number) {
    return {
        id: photo.id,
        sortOrder: photo.sortOrder,
        url: `/places/${placeId}/photos/${photo.id}`,
    };
}

export function formatPlace(place: PlaceWithPhotos) {
    const category = CATEGORY_LABELS[place.category] ?? place.category.toLowerCase();
    const { rating, reviewsCount } = resolvePublicStats(place);
    const coverFromPhoto = place.photos?.[0]
        ? `/places/${place.id}/photos/${place.photos[0].id}`
        : null;
    const coverFromGoogle = place.externalPhotoUrl ? `/places/${place.id}/cover` : null;

    return {
        id: place.id,
        name: place.name,
        category,
        description: place.description,
        address: place.address,
        mapsLink: place.mapsLink,
        phone: place.phone,
        openingDate: place.openingDate,
        moradorId: place.moradorId,
        moradorName: place.morador?.name ?? null,
        source: SOURCE_LABELS[place.source] ?? "community",
        googlePlaceId: place.googlePlaceId,
        lat: place.latitude,
        lng: place.longitude,
        rating,
        reviewsCount,
        coverImage: coverFromPhoto ?? coverFromGoogle ?? null,
        photos: (place.photos ?? []).map((p) => formatPhoto(p, place.id)),
        createdAt: place.createdAt,
    };
}

export function formatPlaceList(places: PlaceWithPhotos[]) {
    return places.map(formatPlace);
}
