import type { Experiences } from "../../generated/prisma/client.ts";

export function formatExperience(experience: Experiences) {
    return {
        id: experience.id,
        userName: experience.userName,
        userId: experience.userId,
        rating: experience.rating,
        placeId: experience.placeId,
        createdAt: experience.createdAt,
    };
}

export function formatExperienceList(experiences: Experiences[]) {
    return experiences.map(formatExperience);
}