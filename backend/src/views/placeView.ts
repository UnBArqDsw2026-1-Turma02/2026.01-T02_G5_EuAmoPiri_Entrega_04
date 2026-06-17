import type { Place, PlacePhoto } from "../../generated/prisma/client.ts";

const CATEGORY_LABELS: Record<string, string> = {
    CACHOEIRA: "cachoeira",
    RESTAURANTE: "restaurante",
    POUSADA: "pousada",
};

type PlaceWithPhotos = Place & {
    photos?: PlacePhoto[];
    morador?: { id: number; name: string };
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

function formatPhoto(photo: PlacePhoto, placeId: number) {
    return {
        id: photo.id,
        sortOrder: photo.sortOrder,
        url: `/places/${placeId}/photos/${photo.id}`,
    };
}

export function formatPlace(place: PlaceWithPhotos) {
    const category = CATEGORY_LABELS[place.category] ?? place.category.toLowerCase();
    const { rating, reviewsCount } = computeRatingStats(place.experiences);
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
        moradorName: place.morador?.name,
        rating,
        reviewsCount,
        coverImage: place.photos?.[0]
            ? `/places/${place.id}/photos/${place.photos[0].id}`
            : null,
        photos: (place.photos ?? []).map((p) => formatPhoto(p, place.id)),
        createdAt: place.createdAt,
    };
}

export function formatPlaceList(places: PlaceWithPhotos[]) {
    return places.map(formatPlace);
}
