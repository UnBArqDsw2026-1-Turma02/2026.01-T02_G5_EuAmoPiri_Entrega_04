import { Router } from "express";
import * as experienceController from "../controllers/experienceController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /places/{placeId}/experiences:
 *   post:
 *     tags: [Experiences]
 *     summary: Cadastrar experiência (requer autenticação)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExperienceRequest'
 *     responses:
 *       201:
 *         description: Experiência criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experience'
 *       401:
 *         description: Não autenticado
 */
router.post('/:placeId/experiences', authMiddleware, experienceController.createExperience);

/**
 * @openapi
 * /places/{placeId}/experiences:
 *   get:
 *     tags: [Experiences]
 *     summary: Listar experiências de um local
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de experiências
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experience'
 */
router.get('/:placeId/experiences', experienceController.listExperiences);

export default router;