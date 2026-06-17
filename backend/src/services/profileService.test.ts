import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "../../generated/prisma/client.ts";
import * as userModel from "../model/userModel.ts";
import * as storageService from "./storageService.ts";
import {
    ProfileError,
    buildObjectKey,
    hasProfileChanges,
    validatePhotoFile,
    updateProfile,
} from "./profileService.ts";

vi.mock("../model/userModel.ts");
vi.mock("./storageService.ts");

const baseUser: User = {
    id: 1,
    accountType: "MORADOR",
    name: "Anna Brandão",
    email: "anna@piri.com",
    birthDate: new Date("1995-06-14"),
    phone: "(62) 99999-0000",
    profession: "Desenvolvedora",
    biography: "Amo Pirenópolis!",
    profilePhotoUrl: null,
    passwordHash: "hash",
    googleId: null,
    createdAt: new Date("2026-01-01"),
};

function mockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
        fieldname: "profilePhoto",
        originalname: "photo.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake-image"),
        destination: "",
        filename: "",
        path: "",
        stream: null as never,
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.uploadBuffer).mockResolvedValue(undefined);
    vi.mocked(storageService.deleteObject).mockResolvedValue(undefined);
});

describe("hasProfileChanges", () => {
    it("retorna false quando nenhum campo foi alterado", () => {
        expect(hasProfileChanges(baseUser, {})).toBe(false);
        expect(hasProfileChanges(baseUser, {
            name: "Anna Brandão",
            email: "anna@piri.com",
            profession: "Desenvolvedora",
        })).toBe(false);
    });

    it("retorna true quando um campo textual muda", () => {
        expect(hasProfileChanges(baseUser, { biography: "Nova bio" })).toBe(true);
    });

    it("retorna true quando há arquivo de foto", () => {
        expect(hasProfileChanges(baseUser, {}, mockFile())).toBe(true);
    });
});

describe("validatePhotoFile", () => {
    it("aceita JPG e PNG válidos", () => {
        expect(() => validatePhotoFile(mockFile())).not.toThrow();
        expect(() => validatePhotoFile(mockFile({ mimetype: "image/png" }))).not.toThrow();
    });

    it("rejeita formato inválido", () => {
        expect(() => validatePhotoFile(mockFile({ mimetype: "image/gif" }))).toThrow(
            new ProfileError("Formato de imagem inválido. Use JPG ou PNG.", 400)
        );
    });

    it("rejeita arquivo maior que 5 MB", () => {
        expect(() =>
            validatePhotoFile(mockFile({ size: 5 * 1024 * 1024 + 1 }))
        ).toThrow(new ProfileError("A imagem deve ter no máximo 5 MB", 400));
    });
});

describe("buildObjectKey", () => {
    it("gera chave com prefixo, id do usuário e extensão", () => {
        const key = buildObjectKey(42, "image/png");
        expect(key).toMatch(/^profile_photo\/42-\d+\.png$/);
    });
});

describe("updateProfile", () => {
    it("atualiza campos alterados com sucesso", async () => {
        const updated = { ...baseUser, biography: "Bio atualizada" };
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);
        vi.mocked(userModel.updateUser).mockResolvedValue(updated);

        const result = await updateProfile(1, { biography: "Bio atualizada" });

        expect(userModel.updateUser).toHaveBeenCalledWith(1, { biography: "Bio atualizada" });
        expect(result.biography).toBe("Bio atualizada");
    });

    it("lança 404 quando usuário não existe", async () => {
        vi.mocked(userModel.findById).mockResolvedValue(null);

        await expect(updateProfile(99, { name: "Novo Nome" })).rejects.toMatchObject({
            message: "Usuário não encontrado",
            statusCode: 404,
        });
    });

    it("lança 400 quando nenhuma alteração é detectada", async () => {
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);

        await expect(updateProfile(1, { name: "Anna Brandão" })).rejects.toMatchObject({
            message: "Nenhuma alteração detectada",
            statusCode: 400,
        });
    });

    it("lança 400 para e-mail inválido", async () => {
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);

        await expect(updateProfile(1, { email: "email-invalido" })).rejects.toMatchObject({
            message: "Email inválido",
            statusCode: 400,
        });
    });

    it("lança 409 quando e-mail já pertence a outro usuário", async () => {
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);
        vi.mocked(userModel.findByEmail).mockResolvedValue({ ...baseUser, id: 2, email: "outro@piri.com" });

        await expect(updateProfile(1, { email: "outro@piri.com" })).rejects.toMatchObject({
            message: "Email já cadastrado",
            statusCode: 409,
        });
    });

    it("faz upload da foto e atualiza profilePhotoUrl", async () => {
        const file = mockFile();
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);
        vi.mocked(userModel.updateUser).mockImplementation(async (_id, data) =>
            ({ ...baseUser, ...data }) as User
        );

        const result = await updateProfile(1, {}, file);

        expect(storageService.uploadBuffer).toHaveBeenCalledOnce();
        expect(result.profilePhotoUrl).toMatch(/^profile_photo\/1-\d+\.jpg$/);
    });

    it("remove foto antiga após upload de nova foto", async () => {
        const userWithPhoto = { ...baseUser, profilePhotoUrl: "profile_photo/1-old.jpg" };
        vi.mocked(userModel.findById).mockResolvedValue(userWithPhoto);
        vi.mocked(userModel.updateUser).mockImplementation(async (_id, data) =>
            ({ ...userWithPhoto, ...data }) as User
        );

        await updateProfile(1, {}, mockFile());

        await vi.waitFor(() => {
            expect(storageService.deleteObject).toHaveBeenCalledWith("profile_photo/1-old.jpg");
        });
    });

    it("lança 500 quando upload da foto falha", async () => {
        vi.mocked(userModel.findById).mockResolvedValue(baseUser);
        vi.mocked(storageService.uploadBuffer).mockRejectedValue(new Error("GCS indisponível"));

        await expect(updateProfile(1, {}, mockFile())).rejects.toMatchObject({
            message: "Erro ao salvar foto",
            statusCode: 500,
        });
    });
});
