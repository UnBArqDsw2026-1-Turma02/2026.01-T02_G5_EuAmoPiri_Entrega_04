const PROFILE_PREFIX = process.env.GCS_PROFILE_PREFIX ?? "profile_photo/";
const PLACE_PREFIX = process.env.GCS_PLACE_PREFIX ?? "place_photos/";
const EXPERIENCE_PREFIX = process.env.GCS_EXPERIENCE_PREFIX ?? "experience_photos/";

function extensionFromMime(mimetype: string): string {
    return mimetype === "image/png" ? "png" : "jpg";
}

export function buildProfilePhotoKey(userId: number, mimetype: string): string {
    const ext = extensionFromMime(mimetype);
    return `${PROFILE_PREFIX}${userId}-${Date.now()}.${ext}`;
}

export function buildPlacePhotoKey(placeId: number, sortOrder: number, mimetype: string): string {
    const ext = extensionFromMime(mimetype);
    return `${PLACE_PREFIX}${placeId}/${sortOrder}-${Date.now()}.${ext}`;
}

export function buildExperiencePhotoKey(experienceId: number, sortOrder: number, mimetype: string): string {
    const ext = extensionFromMime(mimetype);
    return `${EXPERIENCE_PREFIX}${experienceId}/${sortOrder}-${Date.now()}.${ext}`;
}

export { PROFILE_PREFIX, PLACE_PREFIX, EXPERIENCE_PREFIX };
