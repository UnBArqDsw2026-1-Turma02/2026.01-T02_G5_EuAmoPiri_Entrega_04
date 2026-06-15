/**
 * CAMADA INFRA — Adaptor de Locais
 *
 * Mapeia as chamadas de domínio para os endpoints da API REST.
 * Isola o restante da aplicação dos detalhes da API.
 *
 * Para substituir o mapa OpenStreetMap (Leaflet) pelo Google Maps:
 *   1. Instale @react-google-maps/api
 *   2. Troque <MapContainer> por <GoogleMap> em PlacesPage.jsx
 *   3. A estrutura de dados (lat/lng) permanece idêntica
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
    lat: -15.8490,
    lng: -48.9568,
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
    lat: -15.8312,
    lng: -48.9423,
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
    lat: -15.8654,
    lng: -48.9234,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-04-20').toISOString(),
  },
  {
    id: 4,
    name: 'Igreja Matriz de N. S. do Rosário',
    category: 'cultura',
    description: 'Igreja tombada pelo IPHAN, símbolo da arquitetura colonial de Pirenópolis.',
    address: 'Praça da Matriz, s/n - Centro',
    price: '$',
    rating: 4.7,
    reviewsCount: 220,
    lat: -15.8497,
    lng: -48.9575,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 5,
    name: 'Pousada das Cavalhadas',
    category: 'hospedagem',
    description: 'Pousada aconchegante no centro histórico, a passos dos principais pontos.',
    address: 'Rua das Cavalhadas, 42 - Centro',
    price: '$$',
    rating: 4.6,
    reviewsCount: 80,
    lat: -15.8510,
    lng: -48.9555,
    photos: [],
    mapsLink: null,
    createdAt: new Date('2026-04-01').toISOString(),
  },
];

/* ─── Funções do adaptor ─── */

export async function fetchPlaces() {
  try {
    const { data } = await apiClient.get('/places');
    return Array.isArray(data) ? data : MOCK_PLACES;
  } catch {
    return MOCK_PLACES;
  }
}

export async function fetchPlaceById(id) {
  const place = MOCK_PLACES.find((p) => p.id === Number(id));
  if (!place) throw new Error('Local não encontrado');
  return place;
}

export async function createPlace(placeData) {
  const { data } = await apiClient.post('/places', placeData);
  return data;
}

export async function updatePlace(id, placeData) {
  console.warn('[mock] updatePlace chamado para id:', id);
  return { ...placeData, id };
}

export async function deletePlace(id) {
  console.warn('[mock] deletePlace chamado para id:', id);
  return { success: true };
}
