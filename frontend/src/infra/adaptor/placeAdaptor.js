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
    id: 1, name: 'Botequim Mercatto Piri', category: 'gastronomia',
    description: 'Um autêntico botequim no coração do centro histórico, oferecendo comida caseira e bebidas locais em ambiente acolhedor.',
    address: 'R. Direita, 68 - Centro Histórico, Pirenópolis',
    price: '$$', rating: 4.9, reviewsCount: 128, commentsCount: 342, visitsCount: '1.2K',
    hours: '11h - 22h', phone: '(62) 3331-1234',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=70',
    lat: -15.8490, lng: -48.9568, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-10').toISOString(),
    moradorId: 1,
  },
  {
    id: 2, name: 'Cachoeira da Rosário', category: 'natureza',
    description: 'Uma das cachoeiras mais visitadas de Pirenópolis, com águas cristalinas e trilha de fácil acesso.',
    address: 'Estrada da Rosário, km 3, Pirenópolis',
    price: '$', rating: 4.8, reviewsCount: 50, commentsCount: 98, visitsCount: '800',
    hours: '8h - 17h', phone: null,
    coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=70',
    lat: -15.8312, lng: -48.9423, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-15').toISOString(),
    moradorId: 1,
  },
  {
    id: 3, name: 'Trilha do Poço Azul', category: 'natureza',
    description: 'Trilha de dificuldade média com chegada em uma piscina natural de água azul.',
    address: 'Zona Rural - Pirenópolis',
    price: '$$$', rating: 4.5, reviewsCount: 300, commentsCount: 210, visitsCount: '2.1K',
    hours: '7h - 16h', phone: null,
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=70',
    lat: -15.8654, lng: -48.9234, photos: [], mapsLink: null,
    createdAt: new Date('2026-04-20').toISOString(),
  },
  {
    id: 4, name: 'Igreja Matriz de N. S. do Rosário', category: 'cultura',
    description: 'Igreja tombada pelo IPHAN, símbolo da arquitetura colonial de Pirenópolis.',
    address: 'Praça da Matriz, s/n - Centro, Pirenópolis',
    price: '$', rating: 4.7, reviewsCount: 220, commentsCount: 180, visitsCount: '3.5K',
    hours: '8h - 18h', phone: '(62) 3331-0000',
    coverImage: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=300&q=70',
    lat: -15.8497, lng: -48.9575, photos: [], mapsLink: null,
    createdAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 5, name: 'Pousada das Cavalhadas', category: 'hospedagem',
    description: 'Pousada aconchegante no centro histórico, a passos dos principais pontos turísticos.',
    address: 'Rua das Cavalhadas, 42 - Centro, Pirenópolis',
    price: '$$', rating: 4.6, reviewsCount: 80, commentsCount: 64, visitsCount: '500',
    hours: 'Check-in 14h', phone: '(62) 3335-5678',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70',
    lat: -15.8510, lng: -48.9555, photos: [], mapsLink: null,
    createdAt: new Date('2026-04-01').toISOString(),
  },
  {
    id: 6, name: 'Restaurante LovePiri', category: 'gastronomia',
    description: 'Restaurante sofisticado com culinária goiana contemporânea e vista para a Serra dos Pireneus.',
    address: 'Av. Sizenando Jayme, 120 - Centro, Pirenópolis',
    price: '$$$', rating: 3.8, reviewsCount: 45, commentsCount: 60, visitsCount: '300',
    hours: '12h - 23h', phone: '(62) 3331-9988',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=70',
    lat: -15.8475, lng: -48.9541, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-20').toISOString(),
    moradorId: 1,
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

export async function fetchMyPlaces(moradorId) {
  // TODO: substituir por apiClient.get(`/places?moradorId=${moradorId}`) quando disponível
  return MOCK_PLACES.filter((p) => p.moradorId === Number(moradorId));
}
