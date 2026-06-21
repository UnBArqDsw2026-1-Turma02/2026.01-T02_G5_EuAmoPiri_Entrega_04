import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Eu Amo Piri API",
            version: "1.0.0",
            description: "API REST do Eu Amo Piri — locais, experiências e autenticação",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Desenvolvimento local",
            },
        ],
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
                        category: { type: "string" },
                        description: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Experience: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        userName: { type: "string" },
                        userId: { type: "integer", nullable: true },
                        rating: { type: "integer", minimum: 0, maximum: 5 },
                        placeId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
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

export const swaggerSpec = swaggerJsdoc(options);
