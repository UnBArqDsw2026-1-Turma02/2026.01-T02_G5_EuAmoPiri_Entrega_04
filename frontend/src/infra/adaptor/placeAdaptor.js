/**
 * CAMADA INFRA — Adaptor de Locais
 *
 * Mapeia as chamadas de domínio para os endpoints da API REST.
 * Isola o restante da aplicação dos detalhes da API.
 *
 * API real disponível: GET /places, POST /places
 * Demais operações: mockadas até o backend implementar.
 */
import apiClient from '../fetcher/apiClient';

/* ─── Dados mock (usados enquanto o backend não implementa) ─── */
const MOCK_PLACES = [
  {
    id: 1,
    name: 'Botequim Mercatto Piri',
    category: 'gastronomia',
    description: 'Bar e restaurante com culinária regional goiana no coração de Pirenópolis.',
    address: 'Rua do Rosário, 15 - Centro',
    price: '$$',
    rating: 4.9,
    reviewsCount: 100,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-05-10').toISOString(),
  },
  {
    id: 2,
    name: 'Cachoeira da Rosário',
    category: 'natureza',
    description: 'Uma das cachoeiras mais visitadas de Pirenópolis, com águas cristalinas.',
    address: 'Estrada da Rosário, km 3',
    price: '$',
    rating: 4.8,
    reviewsCount: 50,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-05-15').toISOString(),
  },
  {
    id: 3,
    name: 'Trilha do Poço Azul',
    category: 'natureza',
    description: 'Trilha de dificuldade média com chegada em uma piscina natural de água azul.',
    address: 'Zona Rural - Pirenópolis',
    price: '$$$',
    rating: 4.5,
    reviewsCount: 300,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-04-20').toISOString(),
  },
];

/* ─── Funções do adaptor ─── */

/**
 * Lista todos os locais.
 * Usa API real; em caso de falha ou dados insuficientes, retorna mock.
 */
export async function fetchPlaces() {
  try {
    const { data } = await apiClient.get('/places');
    return data;
  } catch {
    // TODO: remover mock quando o backend estiver completo
    return MOCK_PLACES;
  }
}

/**
 * Busca um local por ID.
 * Mockado até o backend implementar GET /places/:id
 */
export async function fetchPlaceById(id) {
  // TODO: substituir por apiClient.get(`/places/${id}`) quando disponível
  const place = MOCK_PLACES.find((p) => p.id === Number(id));
  if (!place) throw new Error('Local não encontrado');
  return place;
}

/**
 * Cria um novo local (Morador).
 * Usa API real.
 */
export async function createPlace(placeData) {
  const { data } = await apiClient.post('/places', placeData);
  return data;
}

/**
 * Atualiza um local existente.
 * Mockado até o backend implementar PUT /places/:id
 */
export async function updatePlace(id, placeData) {
  // TODO: substituir por apiClient.put quando disponível
  console.warn('[mock] updatePlace chamado para id:', id);
  return { ...placeData, id };
}

/**
 * Remove um local.
 * Mockado até o backend implementar DELETE /places/:id
 */
export async function deletePlace(id) {
  // TODO: substituir por apiClient.delete quando disponível
  console.warn('[mock] deletePlace chamado para id:', id);
  return { success: true };
}
