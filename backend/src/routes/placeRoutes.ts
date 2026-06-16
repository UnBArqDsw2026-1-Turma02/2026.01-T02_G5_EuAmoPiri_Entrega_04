import { Router } from "express";
import * as placeController from "../controllers/placeController.ts";

const router = Router();

/**
 * @openapi
 * /places:
 *   post:
 *     tags: [Places]
 *     summary: Cadastrar local
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, description]
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Local criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 */
router.post('/', placeController.createPlace);

/**
 * @openapi
 * /places:
 *   get:
 *     tags: [Places]
 *     summary: Listar locais
 *     responses:
 *       200:
 *         description: Lista de locais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Place'
 */
router.get('/', placeController.listPlaces);

export default router;