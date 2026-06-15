import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export interface GoogleUserPayload {
    googleId: string;
    email: string;
    name: string;
}

export async function verifyGoogleToken(credential: string): Promise<GoogleUserPayload> {
    if (!googleClientId) {
        throw new Error("GOOGLE_CLIENT_ID_NOT_CONFIGURED");
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
        throw new Error("INVALID_GOOGLE_TOKEN");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split("@")[0] ?? "Usuário",
    };
}
