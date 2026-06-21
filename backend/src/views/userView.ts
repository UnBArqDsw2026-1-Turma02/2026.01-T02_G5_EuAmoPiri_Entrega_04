import type { User } from "../../generated/prisma/client.ts";

export function formatUser(user: User) {
    return {
        id: user.id,
        accountType: user.accountType,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        phone: user.phone,
        profession: user.profession,
        biography: user.biography,
        profilePhotoUrl: user.profilePhotoUrl,
        createdAt: user.createdAt,
    };
}

export function formatAuthResponse(user: User, token: string) {
    return {
        token,
        user: formatUser(user),
    };
}
