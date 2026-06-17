import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";
import * as authService from "../services/authService.ts";
import { AuthError } from "../services/authService.ts";
import type { RegisterInput } from "../services/authService.ts";
import * as userModel from "../model/userModel.ts";
import { issueTokenForUser } from "../services/authService.ts";
import * as profileService from "../services/profileService.ts";
import { ProfileError } from "../services/profileService.ts";
import type { ProfileUpdateInput } from "../services/profileService.ts";
import type { AccountType } from "../model/userModel.ts";
import { formatUser } from "../views/userView.ts";

export async function register(req: Request, res: Response) {
    try {
        const result = await authService.registerUser(req.body as RegisterInput);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({
                error: error.message,
                ...(error.code ? { code: error.code } : {}),
            });
            return;
        }
        res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
}

export function login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", { session: false }, async (err: Error | null, user: Express.User | false, info?: { message?: string }) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            if (info?.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    error: "Conta não encontrada",
                    code: "USER_NOT_FOUND",
                });
            }
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const dbUser = await userModel.findById(user.id);
        if (!dbUser) {
            return res.status(404).json({ error: "Conta não encontrada", code: "USER_NOT_FOUND" });
        }

        return res.status(200).json(issueTokenForUser(dbUser));
    })(req, res, next);
}

export async function googleLogin(req: Request, res: Response) {
    try {
        const { credential } = req.body as { credential?: string };
        const result = await authService.loginWithGoogle(credential ?? "");
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Erro ao autenticar com Google" });
    }
}

export function me(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }
    res.status(200).json({ user: req.user });
}

function parseProfileBody(body: Record<string, unknown>): ProfileUpdateInput {
    const input: ProfileUpdateInput = {};

    if (body.name !== undefined) input.name = String(body.name);
    if (body.email !== undefined) input.email = String(body.email);
    if (body.phone !== undefined) input.phone = String(body.phone);
    if (body.profession !== undefined) input.profession = String(body.profession);
    if (body.biography !== undefined) input.biography = String(body.biography);
    if (body.birthDate !== undefined) input.birthDate = String(body.birthDate);

    if (body.accountType !== undefined) {
        const accountType = String(body.accountType).toUpperCase();
        if (accountType === "TURISTA" || accountType === "MORADOR") {
            input.accountType = accountType as AccountType;
        }
    }

    return input;
}

export async function updateProfile(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    try {
        const input = parseProfileBody(req.body as Record<string, unknown>);
        const updated = await profileService.updateProfile(req.user.id, input, req.file);
        res.status(200).json({
            user: formatUser(updated),
            message: "Perfil atualizado com sucesso",
        });
    } catch (error) {
        if (error instanceof ProfileError) {
            res.status(error.statusCode).json({
                error: error.message,
                ...(error.code ? { code: error.code } : {}),
            });
            return;
        }
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
}

export async function getProfilePhoto(req: Request, res: Response) {
    if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    try {
        const result = await profileService.getProfilePhotoStream(req.user.id);
        if (!result) {
            res.status(404).json({ error: "Foto de perfil não encontrada" });
            return;
        }

        res.setHeader("Content-Type", result.contentType);
        res.setHeader("Cache-Control", "private, max-age=3600");
        result.stream.on("error", () => {
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao carregar foto" });
            }
        });
        result.stream.pipe(res);
    } catch {
        res.status(500).json({ error: "Erro ao carregar foto" });
    }
}
