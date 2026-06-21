import { Router } from "express";
import * as placeController from "../controllers/placeController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { requireAdmin, requireMorador } from "../middleware/requireAccountTypeMiddleware.ts";
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
 * /places/gmaps/sync:
 *   post:
 *     tags: [Places]
 *     summary: Sincronizar locais Google no banco (admin)
 *     description: |
 *       Consulta a Google Places API e persiste/atualiza até `GOOGLE_SYNC_PER_CATEGORY`
 *       locais por categoria (cachoeira, restaurante, pousada) no PostgreSQL.
 *       Requer usuário autenticado com `accountType` **ADMIN**.
 *
 *       **Swagger:** faça login em `POST /auth/login` com um admin, clique em **Authorize**
 *       e cole o token JWT (`Bearer …`). Em seguida execute este endpoint.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sincronização concluída
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoogleSyncResult'
 *             example:
 *               synced: 87
 *               perCategory:
 *                 cachoeira: 29
 *                 restaurante: 40
 *                 pousada: 18
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Usuário autenticado não é admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Acesso negado para este tipo de conta
 *               code: FORBIDDEN_ACCOUNT_TYPE
 *       503:
 *         description: GOOGLE_MAPS_API_KEY ausente ou indisponível
 *       500:
 *         description: Erro ao sincronizar locais do Google
 */
router.post(
    "/gmaps/sync",
    authMiddleware,
    requireAdmin,
    placeController.syncGooglePlaces
);

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
 * /places/{id}:
 *   patch:
 *     tags: [Places]
 *     summary: Atualizar local (requer Morador dono)
 *     description: |
 *       Atualiza os dados de um local cadastrado pelo morador autenticado.
 *       Apenas o morador dono (`moradorId`) pode editar.
 *       Fotos são opcionais: se enviadas (1–3), substituem todas as fotos atuais.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do local
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlaceRequest'
 *     responses:
 *       200:
 *         description: Local atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 *       400:
 *         description: Dados inválidos ou local sem foto após atualização
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto ou morador não é dono do local
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Acesso negado: você não é o dono deste local"
 *               code: FORBIDDEN_OWNER
 *       404:
 *         description: Local não encontrado
 *       409:
 *         description: Já existe outro local com mesmo nome e endereço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Cadastro já existente
 *               code: PLACE_DUPLICATE
 */
router.patch(
    "/:id",
    authMiddleware,
    requireMorador,
    uploadPlacePhotos,
    handlePhotoUploadError,
    placeController.updatePlace
);

/**
 * @openapi
 * /places/{id}:
 *   delete:
 *     tags: [Places]
 *     summary: Excluir local (requer Morador dono)
 *     description: |
 *       Remove permanentemente um local e suas fotos no storage.
 *       Relatos vinculados ao local também são removidos (cascade).
 *       Apenas o morador dono (`moradorId`) pode excluir.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do local
 *     responses:
 *       204:
 *         description: Local excluído com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel incorreto ou morador não é dono do local
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Local não encontrado
 */
router.delete(
    "/:id",
    authMiddleware,
    requireMorador,
    placeController.deletePlace
);

/**
 * @openapi
 * /places/{placeId}/photos/{photoId}:
 *   get:
 *     tags: [Places]
 *     summary: Stream da foto do local
 */
router.get("/:placeId/photos/:photoId", placeController.getPlacePhoto);

export default router;
