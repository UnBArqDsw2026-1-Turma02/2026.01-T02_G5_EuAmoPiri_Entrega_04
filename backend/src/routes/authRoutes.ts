import { Router } from "express";
import * as authController from "../controllers/authController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import {
    profilePhotoUpload,
    handleProfilePhotoUploadError,
} from "../middleware/uploadProfilePhotoMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cadastrar novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login com email e senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Conta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserNotFoundError'
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login com Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Autenticação Google bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     isNewUser:
 *                       type: boolean
 *       401:
 *         description: Token Google inválido
 */
router.post("/google", authController.googleLogin);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obter usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autenticado
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Atualizar perfil do usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               accountType:
 *                 type: string
 *                 enum: [TURISTA, MORADOR]
 *               phone:
 *                 type: string
 *               profession:
 *                 type: string
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: JPG ou PNG, máximo 5 MB
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Nenhuma alteração detectada ou dados inválidos
 *       401:
 *         description: Não autenticado
 *       409:
 *         description: Email já cadastrado
 */
router.patch(
    "/me",
    authMiddleware,
    profilePhotoUpload,
    handleProfilePhotoUploadError,
    authController.updateProfile
);

/**
 * @openapi
 * /auth/me/photo:
 *   get:
 *     tags: [Auth]
 *     summary: Obter foto de perfil do usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stream da imagem (JPEG ou PNG)
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Foto não encontrada
 */
router.get("/me/photo", authMiddleware, authController.getProfilePhoto);

/**
 * @openapi
 * /auth/me/experiences:
 *   get:
 *     tags: [Auth]
 *     summary: Listar avaliações do usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de avaliações do turista
 *       401:
 *         description: Não autenticado
 */
router.get("/me/experiences", authMiddleware, authController.getMyExperiences);

export default router;
