import type { User } from "../../generated/prisma/client.ts";

export type SafeUser = Omit<User, "passwordHash">;

declare global {
    namespace Express {
        interface User extends SafeUser {}
    }
}

export {};
