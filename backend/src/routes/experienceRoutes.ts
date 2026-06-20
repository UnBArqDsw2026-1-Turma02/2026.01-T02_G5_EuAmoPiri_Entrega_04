import { Router } from "express";
import * as experienceController from "../controllers/experienceController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { requireTurista } from "../middleware/requireAccountTypeMiddleware.ts";
import { uploadExperiencePhotos, handlePhotoUploadError } from "../middleware/uploadPhotosMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /places/{placeId}/experiences:
 *   post:
 *     tags: [Experiences]
 *     summary: Cadastrar experiência (requer Turista autenticado)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [rating, text, visitDate]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               text: { type: string, minLength: 100, maxLength: 2000 }
 *               visitDate: { type: string, format: date }
 *               title: { type: string }
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Experiência criada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto
 *       400:
 *         description: Validação (RNF01, RNF02, RNF03)
 */
router.post(
    "/:placeId/experiences",
    authMiddleware,
    requireTurista,
    uploadExperiencePhotos,
    handlePhotoUploadError,
    experienceController.createExperience
);

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
 *         description: Lista de relatos do local
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experience'
 */
router.get("/:placeId/experiences", experienceController.listExperiences);

/**
 * @openapi
 * /places/{placeId}/experiences/{experienceId}:
 *   patch:
 *     tags: [Experiences]
 *     summary: Atualizar relato (requer Turista autor)
 *     description: |
 *       Atualiza um relato de experiência publicado pelo turista autenticado.
 *       Apenas o autor (`userId`) pode editar.
 *       Fotos são opcionais: se enviadas (até 3), substituem todas as fotos atuais.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do local
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relato
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExperienceRequest'
 *     responses:
 *       200:
 *         description: Relato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experience'
 *       400:
 *         description: Dados inválidos ou relato não pertence ao local informado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Relato não pertence a este local
 *               code: INVALID_PLACE
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto ou turista não é autor do relato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Acesso negado: você não é o autor deste relato"
 *               code: FORBIDDEN_OWNER
 *       404:
 *         description: Relato não encontrado
 */
router.patch(
    "/:placeId/experiences/:experienceId",
    authMiddleware,
    requireTurista,
    uploadExperiencePhotos,
    handlePhotoUploadError,
    experienceController.updateExperience
);

/**
 * @openapi
 * /places/{placeId}/experiences/{experienceId}:
 *   delete:
 *     tags: [Experiences]
 *     summary: Excluir relato (requer Turista autor)
 *     description: |
 *       Remove permanentemente um relato e suas fotos no storage.
 *       Apenas o turista autor (`userId`) pode excluir.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do local
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relato
 *     responses:
 *       204:
 *         description: Relato excluído com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto ou turista não é autor do relato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Relato não encontrado
 */
router.delete(
    "/:placeId/experiences/:experienceId",
    authMiddleware,
    requireTurista,
    experienceController.deleteExperience
);

/**
 * @openapi
 * /places/{placeId}/experiences/{experienceId}/photos/{photoId}:
 *   get:
 *     tags: [Experiences]
 *     summary: Stream da foto do relato
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stream da imagem (JPEG ou PNG)
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Foto não encontrada
 */
router.get(
    "/:placeId/experiences/:experienceId/photos/:photoId",
    experienceController.getExperiencePhoto
);

export default router;
