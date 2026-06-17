import type { Experiences, ExperiencePhoto } from "../../generated/prisma/client.ts";

type ExperienceWithPhotos = Experiences & {
    photos?: ExperiencePhoto[];
};

type ExperienceWithPlace = ExperienceWithPhotos & {
    place?: { id: number; name: string };
};

function formatPhoto(photo: ExperiencePhoto, placeId: number, experienceId: number) {
    return {
        id: photo.id,
        sortOrder: photo.sortOrder,
        url: `/places/${placeId}/experiences/${experienceId}/photos/${photo.id}`,
    };
}

export function formatExperience(experience: ExperienceWithPhotos, placeId?: number) {
    const pid = placeId ?? experience.placeId;
    return {
        id: experience.id,
        userName: experience.userName,
        userId: experience.userId,
        rating: experience.rating,
        title: experience.title,
        text: experience.text,
        visitDate: experience.visitDate,
        placeId: experience.placeId,
        photos: (experience.photos ?? []).map((p) => formatPhoto(p, pid, experience.id)),
        reactions: { heart: 0, like: 0 },
        createdAt: experience.createdAt,
    };
}

export function formatExperienceList(experiences: ExperienceWithPhotos[], placeId?: number) {
    return experiences.map((e) => formatExperience(e, placeId));
}

export function formatMyExperienceList(experiences: ExperienceWithPlace[]) {
    return experiences.map((experience) => ({
        ...formatExperience(experience),
        placeName: experience.place?.name ?? "Local",
    }));
}
