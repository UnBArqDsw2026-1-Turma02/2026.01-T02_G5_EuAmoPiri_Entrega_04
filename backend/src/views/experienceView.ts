import type { Experiences, ExperiencePhoto } from "../../generated/prisma/client.ts";
import { emptyReactionCounts, type ReactionKey } from "../constants/reactionTypes.ts";

type ExperienceWithPhotos = Experiences & {
    photos?: ExperiencePhoto[];
};

type ExperienceWithPlace = ExperienceWithPhotos & {
    place?: { id: number; name: string };
};

type ExperienceListExtras = {
    commentCounts: Map<number, number>;
    reactionCounts: Map<number, Record<ReactionKey, number>>;
    userReactions: Map<number, ReactionKey>;
};

function formatPhoto(photo: ExperiencePhoto, placeId: number, experienceId: number) {
    return {
        id: photo.id,
        sortOrder: photo.sortOrder,
        url: `/places/${placeId}/experiences/${experienceId}/photos/${photo.id}`,
    };
}

type ExperienceFormatExtras = {
    commentsCount?: number;
    reactions?: Record<ReactionKey, number>;
    myReaction?: ReactionKey | null;
};

export function formatExperience(
    experience: ExperienceWithPhotos,
    placeId?: number,
    extras?: ExperienceFormatExtras
) {
    const pid = placeId ?? experience.placeId;
    const base = {
        id: experience.id,
        userName: experience.userName,
        userId: experience.userId,
        rating: experience.rating,
        title: experience.title,
        text: experience.text,
        visitDate: experience.visitDate,
        placeId: experience.placeId,
        photos: (experience.photos ?? []).map((p) => formatPhoto(p, pid, experience.id)),
        reactions: extras?.reactions ?? emptyReactionCounts(),
        commentsCount: extras?.commentsCount ?? 0,
        status: experience.status,
        createdAt: experience.createdAt,
    };

    if (extras && "myReaction" in extras) {
        return { ...base, myReaction: extras.myReaction ?? null };
    }

    return base;
}

export function formatExperienceList(
    experiences: ExperienceWithPhotos[],
    placeId?: number,
    extras?: ExperienceListExtras
) {
    return experiences.map((e) =>
        formatExperience(e, placeId, {
            commentsCount: extras?.commentCounts.get(e.id) ?? 0,
            reactions: extras?.reactionCounts.get(e.id) ?? emptyReactionCounts(),
            myReaction: extras?.userReactions.get(e.id) ?? null,
        })
    );
}

export function formatMyExperienceList(experiences: ExperienceWithPlace[]) {
    return experiences.map((experience) => ({
        ...formatExperience(experience),
        placeName: experience.place?.name ?? "Local",
    }));
}
