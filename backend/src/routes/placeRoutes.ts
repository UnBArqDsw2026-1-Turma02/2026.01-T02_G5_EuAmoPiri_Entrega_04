import { Router } from "express";
import * as placeController from "../controllers/placeController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { requireMorador } from "../middleware/requireAccountTypeMiddleware.ts";
import { uploadPlacePhotos, handlePhotoUploadError } from "../middleware/uploadPhotosMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /places:
 *   post:
 *     tags: [Places]
 *     summary: Cadastrar local (requer Morador autenticado)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, address, category, description, photos]
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *               category: { type: string, enum: [CACHOEIRA, RESTAURANTE, POUSADA] }
 *               description: { type: string }
 *               mapsLink: { type: string }
 *               phone: { type: string }
 *               openingDate: { type: string, format: date }
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Local criado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto
 *       409:
 *         description: Cadastro já existente
 */
router.post(
    "/",
    authMiddleware,
    requireMorador,
    uploadPlacePhotos,
    handlePhotoUploadError,
    placeController.createPlace
);

/**
 * @openapi
 * /places:
 *   get:
 *     tags: [Places]
 *     summary: Listar locais
 *     parameters:
 *       - in: query
 *         name: moradorId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de locais
 */
router.get("/", placeController.listPlaces);

/**
 * @openapi
 * /places/{id}:
 *   get:
 *     tags: [Places]
 *     summary: Obter local por ID
 */
router.get("/:id", placeController.getPlaceById);

/**
 * @openapi
 * /places/{placeId}/photos/{photoId}:
 *   get:
 *     tags: [Places]
 *     summary: Stream da foto do local
 */
router.get("/:placeId/photos/:photoId", placeController.getPlacePhoto);

export default router;
