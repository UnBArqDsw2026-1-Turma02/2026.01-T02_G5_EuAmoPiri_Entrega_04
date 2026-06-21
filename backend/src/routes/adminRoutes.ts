import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { requireAdmin } from "../middleware/requireAccountTypeMiddleware.ts";
import * as moderationController from "../controllers/moderationController.ts";

const router = Router();

router.use(authMiddleware, requireAdmin);

/**
 * @openapi
 * /admin/moderation:
 *   get:
 *     tags: [Moderation]
 *     summary: Listar conteúdo denunciado (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REPORTED]
 *     responses:
 *       200:
 *         description: Fila de moderação
 *       403:
 *         description: Acesso negado
 */
router.get("/moderation", moderationController.listModeration);

/**
 * @openapi
 * /admin/experiences/{experienceId}/restore:
 *   patch:
 *     tags: [Moderation]
 *     summary: Restaurar relato denunciado (REPORTED → ACTIVE)
 *     security:
 *       - BearerAuth: []
 */
router.patch("/experiences/:experienceId/restore", moderationController.restoreExperience);

/**
 * @openapi
 * /admin/experiences/{experienceId}/hide:
 *   patch:
 *     tags: [Moderation]
 *     summary: Ocultar relato denunciado (REPORTED → HIDDEN)
 *     security:
 *       - BearerAuth: []
 */
router.patch("/experiences/:experienceId/hide", moderationController.hideExperience);

/**
 * @openapi
 * /admin/comments/{commentId}/restore:
 *   patch:
 *     tags: [Moderation]
 *     summary: Restaurar comentário denunciado (REPORTED → ACTIVE)
 *     security:
 *       - BearerAuth: []
 */
router.patch("/comments/:commentId/restore", moderationController.restoreComment);

/**
 * @openapi
 * /admin/comments/{commentId}/hide:
 *   patch:
 *     tags: [Moderation]
 *     summary: Ocultar comentário denunciado (REPORTED → HIDDEN)
 *     security:
 *       - BearerAuth: []
 */
router.patch("/comments/:commentId/hide", moderationController.hideComment);

export default router;
