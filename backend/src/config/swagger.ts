import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Eu Amo Piri API",
            version: "1.0.0",
            description: "API REST do Eu Amo Piri — locais, experiências e autenticação",
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                RegisterRequest: {
                    type: "object",
                    required: ["accountType", "name", "email", "birthDate", "phone", "password", "confirmPassword"],
                    properties: {
                        accountType: { type: "string", enum: ["TURISTA", "MORADOR"] },
                        name: { type: "string", example: "Maria Silva" },
                        email: { type: "string", format: "email", example: "maria@email.com" },
                        birthDate: { type: "string", format: "date", example: "1995-03-15" },
                        phone: { type: "string", example: "(62) 99999-9999" },
                        password: { type: "string", example: "SenhaForte1" },
                        confirmPassword: { type: "string", example: "SenhaForte1" },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        accountType: { type: "string", enum: ["TURISTA", "MORADOR"], nullable: true },
                        name: { type: "string" },
                        email: { type: "string" },
                        birthDate: { type: "string", format: "date-time", nullable: true },
                        phone: { type: "string", nullable: true },
                        profession: { type: "string", nullable: true },
                        biography: { type: "string", nullable: true },
                        profilePhotoUrl: {
                            type: "string",
                            nullable: true,
                            description: "Chave do objeto no GCS (ex.: profile_photo/1-1718650000.jpg)",
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                ProfileUpdateResponse: {
                    type: "object",
                    properties: {
                        user: { $ref: "#/components/schemas/User" },
                        message: { type: "string", example: "Perfil atualizado com sucesso" },
                    },
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        code: { type: "string" },
                    },
                },
                UserNotFoundError: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Conta não encontrada" },
                        code: { type: "string", example: "USER_NOT_FOUND" },
                    },
                },
                Place: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        category: { type: "string", enum: ["cachoeira", "restaurante", "pousada"] },
                        description: { type: "string" },
                        address: { type: "string" },
                        mapsLink: { type: "string", nullable: true },
                        phone: { type: "string", nullable: true },
                        openingDate: { type: "string", format: "date-time", nullable: true },
                        moradorId: { type: "integer" },
                        moradorName: { type: "string", nullable: true },
                        rating: { type: "number", nullable: true },
                        reviewsCount: { type: "integer" },
                        coverImage: { type: "string", nullable: true },
                        photos: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer" },
                                    sortOrder: { type: "integer" },
                                    url: { type: "string" },
                                },
                            },
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                UpdatePlaceRequest: {
                    type: "object",
                    required: ["name", "address", "category", "description"],
                    properties: {
                        name: { type: "string", example: "Botequim Mercatto Piri" },
                        address: { type: "string", example: "R. Direita, 68 - Centro Histórico" },
                        category: { type: "string", enum: ["CACHOEIRA", "RESTAURANTE", "POUSADA"] },
                        description: { type: "string", example: "Descrição do estabelecimento." },
                        mapsLink: { type: "string", example: "https://maps.google.com/..." },
                        phone: { type: "string", example: "(62) 3331-1234" },
                        openingDate: { type: "string", format: "date", example: "2020-01-15" },
                        photos: {
                            type: "array",
                            description: "Opcional. Se enviadas (1–3), substituem todas as fotos atuais.",
                            items: { type: "string", format: "binary" },
                        },
                    },
                },
                Experience: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        userName: { type: "string" },
                        userId: { type: "integer", nullable: true },
                        rating: { type: "integer", minimum: 1, maximum: 5 },
                        title: { type: "string", nullable: true },
                        text: { type: "string" },
                        visitDate: { type: "string", format: "date-time" },
                        placeId: { type: "integer" },
                        placeName: { type: "string", nullable: true },
                        photos: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer" },
                                    sortOrder: { type: "integer" },
                                    url: { type: "string" },
                                },
                            },
                        },
                        reactions: {
                            type: "object",
                            properties: {
                                heart: { type: "integer" },
                                like: { type: "integer" },
                            },
                        },
                        commentsCount: { type: "integer" },
                        myReaction: {
                            type: "string",
                            enum: ["heart", "like"],
                            nullable: true,
                        },
                        createdAt: { type: "string", format: "date-time" },
                        status: { type: "string", enum: ["ACTIVE", "REPORTED", "HIDDEN"] },
                    },
                },
                CreateReportRequest: {
                    type: "object",
                    required: ["reason"],
                    properties: {
                        reason: { type: "string", enum: ["ODIO", "FALSO", "SENSIVEL", "OUTRO"] },
                        description: { type: "string", maxLength: 500 },
                    },
                },
                ReportResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        reportCount: { type: "integer" },
                        status: { type: "string", enum: ["REPORTED"] },
                    },
                },
                ExperienceComment: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        text: { type: "string" },
                        userId: { type: "integer" },
                        userName: { type: "string" },
                        experienceId: { type: "integer", description: "ID do relato (atalho)" },
                        relato: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                title: { type: "string", nullable: true },
                                placeId: { type: "integer" },
                            },
                        },
                        local: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                name: { type: "string" },
                            },
                        },
                        createdAt: { type: "string", format: "date-time" },
                        status: { type: "string", enum: ["ACTIVE", "REPORTED", "HIDDEN"] },
                    },
                },
                CreateCommentRequest: {
                    type: "object",
                    required: ["text"],
                    properties: {
                        text: { type: "string", minLength: 3, maxLength: 500 },
                    },
                },
                ReactToExperienceRequest: {
                    type: "object",
                    required: ["reaction"],
                    properties: {
                        reaction: { type: "string", enum: ["heart", "like"] },
                    },
                },
                ReactionResponse: {
                    type: "object",
                    properties: {
                        reactions: {
                            type: "object",
                            properties: {
                                heart: { type: "integer" },
                                like: { type: "integer" },
                            },
                        },
                        myReaction: {
                            type: "string",
                            enum: ["heart", "like"],
                            nullable: true,
                        },
                    },
                },
                UpdateExperienceRequest: {
                    type: "object",
                    required: ["rating", "text", "visitDate"],
                    properties: {
                        rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                        text: {
                            type: "string",
                            minLength: 100,
                            maxLength: 2000,
                            example: "Texto do relato com no mínimo 100 caracteres descrevendo a experiência no local visitado em Pirenópolis.",
                        },
                        visitDate: { type: "string", format: "date", example: "2026-06-01" },
                        title: { type: "string", example: "Experiência incrível!" },
                        photos: {
                            type: "array",
                            description: "Opcional. Se enviadas (até 3), substituem todas as fotos atuais.",
                            items: { type: "string", format: "binary" },
                        },
                    },
                },
                CreateExperienceRequest: {
                    type: "object",
                    required: ["rating"],
                    properties: {
                        rating: { type: "integer", minimum: 0, maximum: 5, example: 5 },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const baseSwaggerSpec = swaggerJsdoc(options);

/** Injeta a URL do servidor em runtime (dev, Render, etc.). */
export function getSwaggerSpec(serverUrl: string) {
    return {
        ...baseSwaggerSpec,
        servers: [{ url: serverUrl, description: "Servidor atual" }],
    };
}
