import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";
import * as authService from "../services/authService.ts";
import { AuthError } from "../services/authService.ts";
import type { RegisterInput } from "../services/authService.ts";
import * as userModel from "../model/userModel.ts";
import { issueTokenForUser } from "../services/authService.ts";

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
