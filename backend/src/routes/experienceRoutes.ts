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

 */

router.get("/:placeId/experiences", experienceController.listExperiences);



/**

 * @openapi

 * /places/{placeId}/experiences/{experienceId}/photos/{photoId}:

 *   get:

 *     tags: [Experiences]

 *     summary: Stream da foto do relato

 */

router.get(

    "/:placeId/experiences/:experienceId/photos/:photoId",

    experienceController.getExperiencePhoto

);



export default router;

